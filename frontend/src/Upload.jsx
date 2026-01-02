import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { uploadResume, fetchLast } from "./api"; // Now this file will exist
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

  // Function to show custom alert modal
  const showAlert = (message) => {
    setErrorMessage(message);
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
    } catch (error) {
      showAlert("🚫 Error analyzing resume. Please try again.");
      console.error("Resume upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLast = async () => {
    setLoading(true); // Indicate loading for this action too
    try {
      const data = await fetchLast();
      if (data.error) {
        showAlert(data.error);
      } else {
        setRes(data);
      }
    } catch (error) {
      showAlert("🚫 Error loading last result. Please try again.");
      console.error("Fetch last result error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Chart Data & Options ---
  const mainScore = useMemo(() => {
    if (!res) return 0;
    return Math.round(res.manual_score ?? res.ats_score ?? 0);
  }, [res]);

  const issuesCount = useMemo(() => {
    if (!res) return 0;
    // Try several common fields for "issues"
    return (
      res.issues_count ??
      (Array.isArray(res.issues) ? res.issues.length : undefined) ??
      (Array.isArray(res.missing_keywords) ? res.missing_keywords.length : 0)
    );
  }, [res]);

  const donutData = useMemo(() => {
    if (!res) return null;
    return {
      labels: ["Score", "Remaining"],
      datasets: [
        {
          data: [mainScore, 100 - mainScore],
          backgroundColor: ["#3B82F6", "#1F2937"], // Tailwind blue-500, gray-800
          borderColor: ["#3B82F6", "#1F2937"],
          borderWidth: 1,
          hoverOffset: 4,
        },
      ],
    };
  }, [res, mainScore]);

  const donutOptions = {
    cutout: "70%",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed + '%';
            }
            return label;
          }
        }
      },
    },
  };

  const keywordsData = useMemo(() => {
    if (!res) return null;
    const found = (res.found_keywords || []).length;
    const missing = (res.missing_keywords || []).length;
    return {
      labels: ["Found Keywords", "Missing Keywords"],
      datasets: [
        {
          data: [found, missing],
          backgroundColor: ["#10B981", "#EF4444"], // Tailwind emerald-500, red-500
          borderColor: ["#10B981", "#EF4444"],
          borderWidth: 1,
          hoverOffset: 4,
        },
      ],
    };
  }, [res]);

  const keywordsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#E5E7EB", // Tailwind gray-200
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed;
            }
            return label;
          }
        }
      },
    },
  };

  // --- Subscores mapping (ordered) ---
  const desiredSubscores = useMemo(() => {
    const mapOrder = [
      { label: "Content", keys: ["content"] },
      { label: "ATS Parse Rate", keys: ["ats_parse_rate", "ats"] },
      { label: "Quantifying Impact", keys: ["quantifying_impact", "impact"] },
      { label: "Repetition", keys: ["repetition"] },
      { label: "Spelling & Grammar", keys: ["spelling_grammar", "spelling", "grammar"] },
      { label: "Section Structure", keys: ["section", "sections"] },
      { label: "ATS Essentials", keys: ["ats_essentials", "essentials"] },
      { label: "Tailoring", keys: ["tailoring"] },
    ];

    const norm = (s) => String(s).toLowerCase().replace(/[^a-z]/g, "");
    const subs = res?.subscores || {};
    const entries = Object.entries(subs).map(([k, v]) => [norm(k), v]);

    const out = [];
    for (const row of mapOrder) {
      let val = null;
      for (const k of row.keys) {
        const nk = norm(k);
        const hit = entries.find(([ek]) => ek === nk);
        if (hit) {
          val = Number(hit[1]);
          break;
        }
      }
      if (val !== null && !Number.isNaN(val)) {
        out.push({ label: row.label, value: Math.max(0, Math.min(100, Math.round(val))) });
      }
    }

    // Add any remaining subscores that weren't in the desired map
    const mappedLabels = new Set(out.map((o) => o.label));
    for (const [rawKey, rawVal] of Object.entries(subs)) {
      const pretty =
        rawKey
          .replace(/_/g, " ")
          .replace(/\b\w/g, (m) => m.toUpperCase()) || "Other";
      if (!mappedLabels.has(pretty)) {
        const v = Number(rawVal);
        if (!Number.isNaN(v)) out.push({ label: pretty, value: Math.max(0, Math.min(100, Math.round(v))) });
      }
    }

    return out;
  }, [res]);

  const Brand = () => (
    <div className="flex items-center justify-between py-5 md:justify-start md:gap-x-14">
      <a href="/" className="text-3xl font-extrabold text-white tracking-wide md:text-left animate-pulse">ResumeX</a>
      <div className="md:hidden">
        <button
          className="menu-btn text-gray-400 hover:text-gray-100 transition duration-300"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 min-h-screen w-full relative flex flex-col font-inter">
      {/* Header */}
      <header className="w-full relative z-20 shadow-lg">
        <div className={`md:hidden ${menuOpen ? "mx-4 pb-5" : "hidden"}`}>
          <Brand />
        </div>
        <nav
          className={`pb-5 md:text-lg ${
            menuOpen
              ? "absolute z-30 top-0 inset-x-0 bg-gray-800 rounded-xl mx-4 mt-2 md:mx-0 md:mt-0 md:relative md:bg-transparent nav-menu"
              : ""
          }`}
        >
          <div className="flex flex-wrap items-center justify-between w-full px-4 md:px-8 md:justify-between">
            <Brand />
            <div className={`flex-1 items-center mt-8 md:mt-0 md:flex ${menuOpen ? "block w-full" : "hidden"}`}>
              <ul className="flex-1 justify-end items-center space-y-4 md:flex md:space-x-8 md:space-y-0 w-full whitespace-nowrap">
                {navigation.map((item, idx) => (
                  <li key={idx} className="text-gray-300 hover:text-sky-400 transition duration-300 transform hover:scale-105 text-center md:text-left">
                    <a href={item.path}>{item.title}</a>
                  </li>
                ))}
                <li className="text-center md:text-left text-gray-300 px-3 py-1 bg-gray-700 rounded-full shadow-inner">
                  Welcome, <span className="text-sky-300 font-semibold">{email}</span> 👋
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Upload & Results */}
      <section className="relative flex-1 py-12">
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="space-y-12 max-w-5xl mx-auto text-center">
            <h2 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 leading-tight tracking-wide drop-shadow-lg">
              Unlock Your Resume's Full Potential
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Get an **instant ATS score**, detailed **keyword insights**, and personalized **AI feedback** to optimize your job application.
            </p>

            {/* Upload controls */}
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-xl mx-auto transform hover:scale-[1.01] transition duration-300 ease-in-out">
              <label htmlFor="resume-file" className="block text-left text-lg font-medium text-gray-200 mb-4 cursor-pointer">
                Upload Your Resume (PDF, DOCX, TXT)
              </label>
              <input
                id="resume-file"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-500 file:text-white hover:file:bg-sky-600 transition duration-300 mb-6 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              {file && (
                <p className="text-gray-400 text-sm mb-4">Selected file: <span className="font-medium text-sky-300">{file.name}</span></p>
              )}
              <div className="flex flex-col sm:flex-row justify-center gap-5">
                <button
                  onClick={analyze}
                  disabled={loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transform hover:-translate-y-1 transition duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L6.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      Analyze Resume
                    </>
                  )}
                </button>
                <button
                  onClick={loadLast}
                  className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-full font-semibold shadow-md transform hover:-translate-y-1 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Load Last Result
                </button>
              </div>
            </div>

            {/* RESULTS */}
            {res && (
              <div className="flex flex-col items-center gap-12 mt-12">
                {/* Main Score Donut */}
                {donutData && (
                  <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-lg mx-auto transform hover:scale-[1.01] transition duration-300 ease-in-out relative">
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">Your ATS Score</h3>
                    <div className="relative mx-auto" style={{ width: 300, height: 300 }}>
                      <Doughnut data={donutData} options={donutOptions} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center -mt-2">
                        <span className="text-6xl font-extrabold text-sky-400 drop-shadow-lg animate-fade-in-up">{mainScore}<span className="text-4xl">/100</span></span>
                        <span className="text-gray-300 text-md font-medium mt-1">Overall Score</span>
                        {typeof issuesCount === "number" && (
                          <span className="mt-2 text-sm text-gray-400">
                            {issuesCount === 0 ? "🎉 No issues found!" : `🚨 ${issuesCount} Issue${issuesCount === 1 ? "" : "s"} detected.`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Subscores with progress bars */}
                {desiredSubscores.length > 0 && (
                  <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 w-full transform hover:scale-[1.01] transition duration-300 ease-in-out">
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">Detailed Subscores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                      {desiredSubscores.map(({ label, value }) => (
                        <div key={label} className="bg-gray-700/50 rounded-lg p-5 border border-gray-600 flex flex-col justify-between h-full transform hover:bg-gray-600/60 transition duration-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-200 font-medium text-lg">{label}</span>
                            <span className="text-sky-300 font-bold text-xl">{value}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords Pie Chart */}
                {keywordsData && (
                  <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 w-full flex flex-col items-center transform hover:scale-[1.01] transition duration-300 ease-in-out">
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">Keyword Analysis</h3>
                    <p className="text-gray-300 text-md mb-6 max-w-2xl">
                      This chart illustrates the ratio of **found keywords** (matching your job target) versus **missing keywords**, helping you tailor your resume effectively.
                    </p>
                    <div className="w-full max-w-xl aspect-square" style={{ height: 500 }}>
                      <Pie data={keywordsData} options={keywordsOptions} />
                    </div>
                  </div>
                )}

                {/* AI Feedback */}
                <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 w-full transform hover:scale-[1.01] transition duration-300 ease-in-out">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">AI-Powered Feedback</h3>
                  <div className="bg-gray-700/50 p-6 rounded-lg max-h-96 overflow-y-auto custom-scrollbar shadow-inner text-left">
                    <pre className="text-gray-200 whitespace-pre-wrap text-base leading-relaxed">
                      {res.ai_feedback ? (
                        <>
                          <span className="font-semibold text-sky-300">Here's what our AI suggests:</span>
                          <br /><br />
                          {res.ai_feedback}
                        </>
                      ) : (
                        "— No AI feedback available. Upload a resume to get started! —"
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Custom Alert Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-red-500 max-w-md w-full text-center">
            <h4 className="text-3xl font-bold text-red-400 mb-4">Oops!</h4>
            <p className="text-gray-200 text-lg mb-6">{errorMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-6 text-center text-gray-400 text-sm border-t border-gray-700 bg-gray-950">
        © {new Date().getFullYear()} ResumeX – Intelligent Resume Insights. All rights reserved. Developed by{" "}
        <a
          href="https://www.linkedin.com/in/praneethkandukuriii/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:text-sky-300 underline font-medium transition duration-300"
        >
          Praneeth Kandukuri
        </a>
      </footer>

      {/* Custom styles for animations and scrollbar */}
      <style jsx>{`
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }
        .animate-pulse {
          animation: pulse 2s infinite ease-in-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151; /* gray-700 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #60a5fa; /* blue-400 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3b82f6; /* blue-500 */
        }
      `}</style>
    </div>
  );
}
