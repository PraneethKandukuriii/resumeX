import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { uploadResume, fetchLast } from "./api";
import { Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Upload() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email || "User";

  const [menuOpen, setMenuOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigation = [
    { title: "About", path: "/about" },
    { title: "Dev", path: "/dev" },
    { title: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    document.onclick = (e) => {
      const target = e.target;
      if (!target.closest(".menu-btn") && !target.closest(".nav-menu")) {
        setMenuOpen(false);
      }
    };
  }, []);

  const showAlert = (msg) => {
    setErrorMessage(msg);
    setShowErrorModal(true);
  };

  const analyze = async () => {
    if (!file) {
      showAlert("⚠️ Please pick a file first.");
      return;
    }
    setLoading(true);
    try {
      const data = await uploadResume(file);
      setRes(data);
    } catch {
      showAlert("🚫 Error analyzing resume.");
    } finally {
      setLoading(false);
    }
  };

  const loadLast = async () => {
    setLoading(true);
    try {
      const data = await fetchLast();
      if (data.error) showAlert(data.error);
      else setRes(data);
    } catch {
      showAlert("🚫 Error loading last result.");
    } finally {
      setLoading(false);
    }
  };

  const mainScore = useMemo(() => {
    if (!res) return 0;
    return Math.round(res.manual_score ?? res.ats_score ?? 0);
  }, [res]);

  const issuesList = useMemo(() => {
    if (!res) return [];
  
    const list =
      res.issues ??
      res.analysis?.issues ??
      res.full_analysis?.issues ??
      res.full_analysis?.warnings ??
      [];
  
    return Array.isArray(list) ? list : [];
  }, [res]);
  

  const issuesCount = useMemo(() => {
    if (!res) return 0;
    return issuesList.length || res.issues_count || 0;
  }, [issuesList, res]);
  
  const donutData = useMemo(() => {
    if (!res) return null;
    return {
      labels: ["Score", "Remaining"],
      datasets: [
        {
          data: [mainScore, 100 - mainScore],
          backgroundColor: ["#38BDF8", "#1F2937"],
          borderWidth: 0,
        },
      ],
    };
  }, [res, mainScore]);

  const donutOptions = {
    cutout: "70%",
    plugins: { legend: { display: false } },
    responsive: true,
    maintainAspectRatio: false,
  };

  const keywordsData = useMemo(() => {
    if (!res) return null;
    return {
      labels: ["Found Keywords", "Missing Keywords"],
      datasets: [
        {
          data: [
            res.found_keywords?.length || 0,
            res.missing_keywords?.length || 0,
          ],
          backgroundColor: ["#10B981", "#EF4444"],
        },
      ],
    };
  }, [res]);

  const keywordsOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#E5E7EB" },
      },
    },
  };

  const desiredSubscores = useMemo(() => {
    const subs = res?.subscores || {};
    return Object.entries(subs).map(([k, v]) => ({
      label: k.replace(/_/g, " ").toUpperCase(),
      value: Math.round(v),
    }));
  }, [res]);

  const Brand = () => (
    <div className="flex items-center justify-between py-5">
      <a href="/" className="text-2xl font-bold text-white">ResumeX</a>
      <button
        className="menu-btn md:hidden text-gray-400"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>
    </div>
  );

  return (
    <div className="bg-gray-900 min-h-screen w-full relative flex flex-col overflow-hidden">

      {/* BLUE GLOW */}
      <div
        className="absolute inset-0 m-auto max-w-xs h-[357px] blur-[118px] sm:max-w-md md:max-w-lg"
        style={{
          background:
            "linear-gradient(45deg, rgba(2,132,199,0.4), rgba(125,211,252,0.3), rgba(56,189,248,0.4))",
        }}
      />

      {/* HEADER */}
      <header className="w-full relative z-20">
        <nav className="pb-5 md:text-sm">
          <div className="flex items-center justify-between w-full px-4 md:px-8">
            <Brand />
            <div className="hidden md:flex items-center space-x-6">
              {navigation.map((item, i) => (
                <a key={i} href={item.path} className="text-gray-300 hover:text-white">
                  {item.title}
                </a>
              ))}
              <span className="px-4 py-2 bg-sky-500 rounded-full text-white text-sm">
                {email}
              </span>
            </div>
          </div>
        </nav>
      </header>

      {/* MAIN */}
      <section className="relative z-10 flex-1 py-16">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 space-y-16">

        <h2 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
  Your Resume Is Competing With Thousands.
  <br />
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
    Make Sure It Wins.
  </span>
</h2>

<p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto">
  Most resumes never reach recruiters.
  ResumeX analyzes your resume exactly how
  <span className="text-sky-400 font-semibold"> ATS systems</span> do —
  then shows you how to beat them.
</p>


          {/* UPLOAD */}
          <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 max-w-xl mx-auto text-center">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-gray-300 mb-6"
            />
            <div className="flex gap-4 justify-center">
              <button
                onClick={analyze}
                disabled={loading}
                className="px-6 py-3 bg-sky-500 rounded-lg text-white"
              >
                {loading ? "Analyzing..." : "Analyze Resume"}
              </button>
              <button
                onClick={loadLast}
                className="px-6 py-3 bg-gray-700 rounded-lg text-white"
              >
                Load Last
              </button>
            </div>
          </div>

          {/* RESULTS */}
          {res && (
            <div className="space-y-16">

              {/* ATS SCORE */}
              <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 max-w-md mx-auto text-center">
                <h3 className="text-xl font-bold text-white mb-6">ATS Score</h3>
                <div className="relative w-64 h-64 mx-auto">
                  <Doughnut data={donutData} options={donutOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-sky-400">
                    <span className="text-5xl font-extrabold">{mainScore}</span>
                    <span className="text-gray-400 text-sm">
                      {issuesCount} issues detected
                    </span>
                  </div>
                </div>
              </div>

              {/* SUBSCORES */}
              <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  Detailed Subscores
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {desiredSubscores.map(({ label, value }) => (
                    <div key={label} className="bg-gray-700 p-5 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-200">{label}</span>
                        <span className="text-sky-400 font-bold">{value}%</span>
                      </div>
                      <div className="h-3 bg-gray-600 rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ISSUES LIST */}
              {issuesList.length > 0 && (
                <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 max-w-3xl mx-auto">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">
                    Critical Issues Detected
                  </h3>
                  <ul className="space-y-3">
                    {issuesList.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                        <span className="text-red-400 text-xl">⚠️</span>
                        <span className="text-gray-200">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* KEYWORDS */}
              <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 max-w-3xl mx-auto">
  <h3 className="text-2xl font-bold text-white mb-6 text-center">
    Keyword Analysis
  </h3>

  {/* SUMMARY */}
  <div className="flex flex-col sm:flex-row justify-around mb-8 text-center gap-6">
    <div>
      <p className="text-4xl font-extrabold text-emerald-400">
        {res.found_keywords?.length || 0}
      </p>
      <p className="text-gray-400 text-sm">Keywords Found</p>
    </div>

    <div>
      <p className="text-4xl font-extrabold text-red-400">
        {res.missing_keywords?.length || 0}
      </p>
      <p className="text-gray-400 text-sm">Keywords Missing</p>
    </div>

    <div>
      <p className="text-4xl font-extrabold text-sky-400">
        {(() => {
          const found = res.found_keywords?.length || 0;
          const missing = res.missing_keywords?.length || 0;
          const total = found + missing;
          return total ? Math.round((found / total) * 100) : 0;
        })()}%
      </p>
      <p className="text-gray-400 text-sm">Keyword Match</p>
    </div>
  </div>

  {/* PIE CHART */}
  <div className="h-[350px] mb-8 flex items-center justify-center">
  <div className="w-[300px] h-[300px]">
    <Pie data={keywordsData} options={keywordsOptions} />
  </div>
</div>


  {/* MISSING KEYWORDS LIST */}
  <div className="text-left">
    <h4 className="text-lg font-semibold text-white mb-3">
    High-Impact Keywords You’re Missing
    </h4>

    {res.missing_keywords?.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {res.missing_keywords.map((kw, idx) => (
          <span
            key={idx}
            className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-sm"
          >
            {kw}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-emerald-400 text-sm">
        🎉 Great job! No missing keywords found.
      </p>
    )}
  </div>
</div>

              {/* AI FEEDBACK */}
              <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  AI-Powered Feedback
                </h3>
                <div className="bg-gray-700 p-6 rounded-lg text-gray-200 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {res.ai_feedback?.status === "success" && res.ai_feedback.feedback}
                  {res.ai_feedback?.status === "failed" && res.ai_feedback.error}
                  {res.ai_feedback?.status === "disabled" && "AI feedback disabled."}
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl border border-red-500 text-center">
            <p className="text-red-400 mb-6">{errorMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="px-6 py-2 bg-red-600 rounded-full text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="w-full py-4 text-center text-gray-500 text-sm z-20">
        © {new Date().getFullYear()} ResumeX – Developed by{" "}
        <a
          href="https://www.linkedin.com/in/praneethkandukuriii/"
          className="text-gray-400 hover:text-white underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Praneeth Kandukuri
        </a>
      </footer>
    </div>
  );
}
