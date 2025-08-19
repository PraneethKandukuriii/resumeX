import io
import json
import re
from datetime import datetime
from typing import List, Dict, Any, Tuple
from collections import Counter
from rapidfuzz import process

import pdfplumber
import docx

# Optional OCR (we’ll try, but fail gracefully if unavailable)
try:
    import pytesseract  # noqa
    from pdf2image import convert_from_bytes  # noqa
    from PIL import Image  # noqa
    OCR_AVAILABLE = True
except Exception:
    OCR_AVAILABLE = False

# ---------- Normalization / Regex ----------
DASH = r"[–—-]"
MONTHS = r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"
YEAR = r"(?:19|20)\d{2}"
DATE_RX = re.compile(
    rf"\b(?:(?:{MONTHS})\s+)?({YEAR})(?:\s*{DASH}|\s+to\s+|\s*-\s*)(?:(?:{MONTHS}\s+)?({YEAR})|\b(Present|Current)\b)\b",
    re.IGNORECASE,
)
YEAR_RANGE_RX = re.compile(rf"\b({YEAR})\s*(?:{DASH}|\s+to\s+|\s*-\s*)\s*({YEAR}|Present|Current)\b", re.IGNORECASE)
EXPLICIT_YEARS_RX = re.compile(r"\b(\d+(?:\.\d+)?)\s*(?:years|yrs?)\b", re.IGNORECASE)
BULLET_RX = re.compile(r"^[\s>*•\-–—]\s+", re.MULTILINE)

SECTION_HEADINGS = [
    "summary","profile","experience","work experience","professional experience",
    "projects","education","skills","technical skills","certifications",
    "achievements","awards","publications","activities","links"
]

DEFAULT_SKILLS = [
    "python","java","c","c++","javascript","typescript","go","rust","kotlin","swift",
    "react","next.js","node.js","express","spring","spring boot","django","flask",
    "html","css","tailwind","sass","webpack","jest","pytest",
    "sql","postgresql","mysql","mongodb","redis","elasticsearch","spark",
    "machine learning","deep learning","pytorch","tensorflow","scikit-learn",
    "nlp","computer vision","data engineering","airflow","dbt",
    "aws","gcp","azure","lambda","s3","ec2","eks","docker","kubernetes","terraform","git","linux",
    "jwt","oauth","spring security",
    "jira","confluence","github","gitlab","bitbucket","vs code",
]

SKILL_ALIASES = {
    "react": ["reactjs","react.js"],
    "node.js": ["node","nodejs"],
    "spring boot": ["springboot"],
    "tailwind": ["tailwind css"],
    "postgresql": ["postgres"],
    "tensorflow": ["tf"],
    "pytorch": ["torch"],
    "scikit-learn": ["sklearn","sci-kit learn"],
    "aws": ["amazon web services"],
    "git": ["github","gitlab","bitbucket"],
    "sql": ["mysql","postgresql","postgres","mssql","oracle sql"],
}

DEGREE_WORDS = [
    "bachelor","master","phd","associate","diploma","degree","b.tech","m.tech",
    "b.e","b.e.","bsc","b.sc","msc","m.sc","mca","me","m.e","mba"
]

CERT_KEYWORDS = ["certified","certification","certificate","exam","credential","badge"]
ACHIEVE_KEYWORDS = ["award","achievement","ranked","honors","honours","winner","finalist","hackathon","patent","publication","prize"]

ACTION_VERBS = [
    "developed","designed","implemented","engineered","created","optimized","led",
    "managed","analyzed","built","deployed","delivered","streamlined","architected",
    "launched","scaled","improved","reduced","increased","owned"
]

LINK_PATTERNS = {
    "email": r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
    "phone": r"(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}",
    "linkedin": r"(?:https?://)?(?:www\.)?linkedin\.com/[A-Za-z0-9_/\-]+",
    "github": r"(?:https?://)?(?:www\.)?github\.com/[A-Za-z0-9_\-]+",
    "portfolio": r"(?:https?://)?[A-Za-z0-9\-]+\.[A-Za-z]{2,}(?:/[^\s]*)?",
    "leetcode": r"(?:https?://)?(?:www\.)?leetcode\.com/[A-Za-z0-9_\-]+",
}

THETA = {
    "skills": 0.30, "experience": 0.20, "education": 0.10, "certs": 0.07,
    "impact_verbs": 0.10, "metrics": 0.08, "formatting": 0.07, "links": 0.05,
    "section_coverage": 0.03
}

# ---------- Text extraction ----------
def _normalize(text: str) -> str:
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def _pdf_to_text(file_bytes: bytes) -> str:
    # Try native text first
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        pages = []
        for p in pdf.pages:
            t = p.extract_text() or ""
            if t.strip():
                pages.append(t)
        text = "\n".join(pages)
    if text.strip():
        return text
    # Fallback OCR (optional)
    if OCR_AVAILABLE:
        try:
            images = convert_from_bytes(file_bytes, fmt="png", dpi=300)
            ocr_text = []
            for im in images:
                ocr_text.append(pytesseract.image_to_string(im))
            return "\n".join(ocr_text)
        except Exception:
            pass
    return ""

def _docx_to_text(file_bytes: bytes) -> str:
    document = docx.Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in document.paragraphs if p.text)

def extract_text_from_upload(django_file) -> str:
    """Read uploaded file and extract text. Supports PDF/DOCX/UTF-8 .txt; graceful fallback."""
    name = (getattr(django_file, "name", "") or "").lower()
    data = django_file.read()
    try:
        if name.endswith(".pdf"):
            return _normalize(_pdf_to_text(data))
        if name.endswith(".docx"):
            return _normalize(_docx_to_text(data))
        # try decode as text
        return _normalize(data.decode("utf-8", errors="ignore"))
    finally:
        # Reset pointer so Django can save the file normally afterwards
        try:
            django_file.seek(0)
        except Exception:
            pass

# ---------- Section splitting ----------
def split_sections(text: str) -> Dict[str, str]:
    lines = [l.strip() for l in text.split("\n")]
    sections: Dict[str, List[str]] = {}
    current = "header"

    def guess_heading(line: str) -> str:
        low = line.lower()
        for h in SECTION_HEADINGS:
            if re.fullmatch(rf"{h}\b[:\-]?", low):
                return h
        return ""

    for line in lines:
        if not line:
            continue
        maybe = guess_heading(line)
        if maybe:
            current = maybe
            if current not in sections:
                sections[current] = []
            continue
        sections.setdefault(current, []).append(line)

    return {k: "\n".join(v).strip() for k, v in sections.items() if v}

# ---------- Extractors ----------
def extract_links(text: str) -> Dict[str, List[str]]:
    found: Dict[str, List[str]] = {}
    for k, rx in LINK_PATTERNS.items():
        matches = re.findall(rx, text, flags=re.IGNORECASE)
        if matches:
            if k == "portfolio":
                matches = [m for m in matches if all(x not in m.lower() for x in ["linkedin.com","github.com","leetcode.com"])]
            found[k] = list(dict.fromkeys(matches))
    return found

def _maybe_load_skill_json() -> List[str]:
    try:
        from django.conf import settings
        import os
        path = os.path.join(getattr(settings, "BASE_DIR", ""), "skills.json")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                sk = json.load(f)
                if isinstance(sk, list) and sk:
                    return [s.lower() for s in sk]
    except Exception:
        pass
    return [s.lower() for s in DEFAULT_SKILLS]

def extract_skills(text: str) -> List[str]:
    text_l = " " + text.lower() + " "
    canonical = set(_maybe_load_skill_json())

    found = {s for s in canonical if re.search(rf"\b{re.escape(s)}\b", text_l)}

    for canon, aliases in SKILL_ALIASES.items():
        for a in aliases:
            if re.search(rf"\b{re.escape(a)}\b", text_l):
                found.add(canon)

    tokens = set(re.findall(r"[a-zA-Z][a-zA-Z0-9\.\+#\-]{1,}", text_l))
    for token in tokens:
        match, score, _ = process.extractOne(token, list(canonical))
        if score >= 88:
            found.add(match)

    if "node" in found and "node.js" in canonical:
        found.discard("node")
        found.add("node.js")

    return sorted(found)

def _parse_year(s: str) -> int:
    try:
        return int(re.search(YEAR, s).group(0))
    except Exception:
        return 0

def _range_years(start: str, end: str) -> float:
    sy = _parse_year(start)
    if not sy:
        return 0.0
    if end and re.match(r"(?i)present|current", end):
        ey = datetime.now().year
    else:
        ey = _parse_year(end) if end else sy
    return max(0.0, float(ey - sy))

def extract_experience_years(text: str) -> float:
    text_n = text.replace("–","-").replace("—","-")
    years_from_words = [float(x) for x in EXPLICIT_YEARS_RX.findall(text_n)]
    explicit = max(years_from_words) if years_from_words else 0.0

    total_from_ranges = 0.0
    seen_spans: List[Tuple[int, int]] = []
    for m in DATE_RX.finditer(text_n):
        sy = m.group(1) or ""
        ey = m.group(2) or m.group(3) or ""
        span = _range_years(sy, ey)
        key = (_parse_year(sy), _parse_year(ey) if not re.match(r"(?i)present|current", ey) else datetime.now().year)
        if key not in seen_spans:
            total_from_ranges += span
            seen_spans.append(key)
    for m in YEAR_RANGE_RX.finditer(text_n):
        sy, ey = m.group(1), m.group(2)
        total_from_ranges += _range_years(sy, ey)
    if total_from_ranges == 0.0 and "intern" in text_n.lower():
        total_from_ranges = 0.5
    return round(max(explicit, total_from_ranges), 2)

def extract_education(text: str) -> List[Dict[str, Any]]:
    sections = split_sections(text)
    edu_block = sections.get("education","") or sections.get("education & certifications","")
    block = edu_block if edu_block else text

    results: List[Dict[str, Any]] = []
    for line in block.split("\n"):
        low = line.lower()
        if any(dw in low for dw in DEGREE_WORDS) or re.search(YEAR, line):
            ranges = list(DATE_RX.finditer(line)) or list(YEAR_RANGE_RX.finditer(line))
            start_y, end_y = None, None
            if ranges:
                m = ranges[0]
                if m.re is DATE_RX:
                    start_y = _parse_year(m.group(1) or "")
                    if m.group(3) and re.match(r"(?i)present|current", m.group(3)):
                        end_y = datetime.now().year
                    else:
                        end_y = _parse_year(m.group(2) or "")
                else:
                    start_y = _parse_year(m.group(1))
                    ey = m.group(2)
                    end_y = datetime.now().year if re.match(r"(?i)present|current", ey or "") else _parse_year(ey or "")
            degree = ""
            for d in DEGREE_WORDS:
                if re.search(rf"\b{re.escape(d)}\b", low):
                    degree = d
                    break
            results.append({"line": line.strip(), "degree": degree, "start_year": start_y, "end_year": end_y})

    seen, deduped = set(), []
    for r in results:
        if r["line"] not in seen:
            deduped.append(r); seen.add(r["line"])
    return deduped

def extract_certifications_and_achievements(text: str) -> Tuple[List[str], List[str]]:
    sections = split_sections(text)
    certs_raw = "\n".join([sections.get("certifications",""), sections.get("certifications & achievements","")])
    ach_raw = "\n".join([sections.get("achievements",""), sections.get("awards",""), sections.get("publications","")])
    if not certs_raw.strip(): certs_raw = text
    if not ach_raw.strip(): ach_raw = text

    def pick_lines(src: str, keys: List[str]) -> List[str]:
        out = []
        for ln in src.split("\n"):
            low = ln.lower()
            if any(k in low for k in keys):
                out.append(ln.strip("•*- ").strip())
        return out

    def tidy(items: List[str]) -> List[str]:
        items = [re.sub(r"\s+"," ", x).strip() for x in items]
        items = [x for x in items if len(x) >= 3]
        return list(dict.fromkeys(items))

    certs = tidy(pick_lines(certs_raw, CERT_KEYWORDS))
    achievements = tidy(pick_lines(ach_raw, ACHIEVE_KEYWORDS))
    return certs, achievements

def extract_projects(text: str) -> List[Dict[str, str]]:
    sections = split_sections(text)
    block = sections.get("projects","")
    if not block: return []
    projects = []
    for para in re.split(r"\n{2,}", block.strip()):
        lines = [l.strip("•*- ").strip() for l in para.split("\n") if l.strip()]
        if not lines: continue
        title = lines[0]
        techs = ", ".join(sorted(set(extract_skills(para))))
        projects.append({"title": title, "tech": techs, "snippet": " ".join(lines[1:])[:300]})
    return projects

def repeated_words(text: str, top_n: int = 10) -> List[Tuple[str, int]]:
    toks = [t.lower() for t in re.findall(r"[A-Za-z]{2,}", text)]
    stop = {"the","and","for","with","a","an","to","of","in","on","at","as","by","or","be",
            "is","are","was","were","this","that","it","from","your","you","we","our",
            "my","their","his","her","they","them","us","me"}
    toks = [t for t in toks if t not in stop]
    cnt = Counter(toks)
    return cnt.most_common(top_n)

# ---------- Scoring ----------
def _clip(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))

def _subscore_skills(skills: List[str]) -> float:
    return _clip(len(skills) / 25.0, 0, 1) * 100

def _subscore_experience(experience_years: float) -> float:
    return _clip(experience_years / 8.0, 0, 1) * 100

def _subscore_education(edu: List[Dict[str, Any]]) -> float:
    if not edu: return 0.0
    score = 0.0
    for e in edu:
        if e.get("degree"): score += 35
        if e.get("start_year") and e.get("end_year"): score += 25
        elif e.get("start_year"): score += 15
    return _clip(score, 0, 100)

def _subscore_certs(certs: List[str]) -> float:
    return _clip(len(certs) / 4.0, 0, 1) * 100

def _subscore_impact_verbs(text: str) -> float:
    count = sum(1 for v in ACTION_VERBS if re.search(rf"\b{re.escape(v)}\b", text, flags=re.IGNORECASE))
    return _clip(count / 12.0, 0, 1) * 100

def _subscore_metrics(text: str) -> float:
    hits = re.findall(r"(\b\d{1,3}%|\$\d[\d,]*|\b\d+k\b|\b\d{3,}\b)", text)
    return _clip(len(hits) / 8.0, 0, 1) * 100

def _subscore_formatting(text: str) -> float:
    bullets = len(BULLET_RX.findall(text))
    headers = len(re.findall(r"\n[A-Z][A-Za-z ]{2,50}\n", text))
    return _clip((bullets / 20.0) + (headers / 8.0), 0, 1) * 100

def _subscore_links(links: Dict[str, List[str]]) -> float:
    have = sum(1 for k in ["linkedin","github","portfolio","leetcode"] if links.get(k))
    return _clip(have / 3.0, 0, 1) * 100

def _subscore_section_coverage(text: str) -> float:
    low = text.lower()
    need = ["experience","education","skills","projects"]
    have = sum(1 for s in need if s in low)
    return _clip(have / len(need), 0, 1) * 100

def compute_all_scores(text: str) -> Dict[str, Any]:
    links = extract_links(text)
    skills = extract_skills(text)
    education = extract_education(text)
    certs, achievements = extract_certifications_and_achievements(text)
    projects = extract_projects(text)
    exp_years = extract_experience_years(text)
    repeats = repeated_words(text)

    subs = {
        "skills": _subscore_skills(skills),
        "experience": _subscore_experience(exp_years),
        "education": _subscore_education(education),
        "certs": _subscore_certs(certs),
        "impact_verbs": _subscore_impact_verbs(text),
        "metrics": _subscore_metrics(text),
        "formatting": _subscore_formatting(text),
        "links": _subscore_links(links),
        "section_coverage": _subscore_section_coverage(text),
    }

    total = sum(subs[k] * THETA[k] for k in THETA.keys())

    penalty = 0.0
    if not education: penalty += 5
    if exp_years < 1: penalty += 5
    if len(skills) < 5: penalty += 5
    if repeats and repeats[0][1] > 30: penalty += 3

    ats_score = int(_clip(total - penalty, 0, 100))
    impact_score = min(20, int(subs["impact_verbs"] // 10 + subs["metrics"] // 10))

    # Missing keywords relative to canonical set
    canonical = set(_maybe_load_skill_json())
    missing = sorted(list(canonical - set(skills)))[:50]

    return {
        "theta": THETA,
        "subscores": subs,
        "ats_score": ats_score,
        "impact_score": impact_score,
        "skills": skills,
        "experience_years": exp_years,
        "education": education,
        "certifications": certs,
        "achievements": achievements,
        "projects": projects,
        "links": links,
        "repeated_words_top": repeats,
        "summary": text[:800],
        "found_keywords": skills,
        "missing_keywords": missing,
    }

# ---------- AI suggestions (optional) ----------
def ai_suggestions(text: str) -> str:
    import os
    api_key = os.getenv("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", "").strip()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    if not api_key:
        return "AI feedback disabled (no OPENAI_API_KEY configured)."
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        prompt = (
            "You are an ATS & hiring expert. Review the resume text below and provide:\n"
            "1) Top strengths (bullet list)\n"
            "2) Missing keywords (max 10)\n"
            "3) 5 concrete improvement suggestions (short, actionable)\n\n"
            f"Resume:\n{text[:15000]}"
        )
        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.25,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        return f"AI feedback failed: {e}"
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

def ai_suggestions(text: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return "AI feedback disabled (no OPENAI_API_KEY configured)."

    try:
        client = OpenAI(api_key=api_key)
        prompt = (
            "You are an ATS & hiring expert. Review the resume text below and provide:\n"
            "1) Top strengths (bullet list)\n"
            "2) Missing keywords (max 10)\n"
            "3) 5 concrete improvement suggestions (short, actionable)\n\n"
            f"Resume:\n{text[:15000]}"
        )
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.25,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        return f"AI feedback failed: {e}"
