import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
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
  const email = state?.email || "User";

  const [menuOpen, setMenuOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigation = [
    { title: "About", path: "/about" },
    { title: "Dev", path: "/dev" },
    { title: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    document.onclick = (e) => {
      const target = e.target;
      if (!target.closest(".menu-btn")) setMenuOpen(false);
    };
  }, []);

  const analyze = async () => {
    if (!file) return alert("⚠️ Pick a file first");
    setLoading(true);
    const data = await uploadResume(file);
    setRes(data);
    setLoading(false);
  };

  const loadLast = async () => {
    const data = await fetchLast();
    if (data.error) alert(data.error);
    else setRes(data);
  };

  const atsData = useMemo(() => {
    if (!res) return null;
    const score = Math.round(res.manual_score || res.ats_score || 0);
    return {
      labels: ["Score", "Remaining"],
      datasets: [
        {
          data: [score, 100 - score],
          backgroundColor: ["#3b82f6", "#e5e7eb"],
          borderWidth: 0,
        },
      ],
    };
  }, [res]);

  const keywordsData = useMemo(() => {
    if (!res) return null;
    return {
      labels: ["Found", "Missing"],
      datasets: [
        {
          data: [
            (res.found_keywords || []).length,
            (res.missing_keywords || []).length,
          ],
          backgroundColor: ["#10b981", "#f59e0b"],
          borderWidth: 0,
        },
      ],
    };
  }, [res]);

  const Brand = () => (
    <div className="flex items-center justify-between py-5 md:justify-start md:gap-x-14">
      <a href="/" className="text-2xl font-bold text-white md:text-left">
        ResumeX
      </a>
      <div className="md:hidden">
        <button
          className="menu-btn text-gray-400 hover:text-gray-300"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 min-h-screen w-full relative flex flex-col">
      {/* Header */}
      <header className="w-full relative z-20">
        <div className={`md:hidden ${menuOpen ? "mx-4 pb-5" : "hidden"}`}>
          <Brand />
        </div>
        <nav
          className={`pb-5 md:text-sm ${
            menuOpen
              ? "absolute z-30 top-0 inset-x-0 bg-gray-800 rounded-xl mx-4 mt-2 md:mx-0 md:mt-0 md:relative md:bg-transparent"
              : ""
          }`}
        >
          <div className="flex flex-wrap items-center justify-between w-full px-4 md:px-8 md:justify-between">
            <Brand />
            <div
              className={`flex-1 items-center mt-8 md:mt-0 md:flex ${
                menuOpen ? "block w-full" : "hidden"
              }`}
            >
              <ul className="flex-1 justify-end items-center space-y-4 md:flex md:space-x-6 md:space-y-0 w-full whitespace-nowrap">
                {navigation.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-gray-300 hover:text-gray-400 text-center md:text-left"
                  >
                    <a href={item.path}>{item.title}</a>
                  </li>
                ))}
                <li className="text-center md:text-left text-gray-300">
                  Hi, <span className="text-white font-medium">{email}</span>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Upload Section */}
      <section className="relative flex-1">
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 py-20 md:px-8">
          <div className="space-y-6 max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
              Upload & Analyze Your Resume
            </h2>
            <p className="text-lg text-gray-400">
              Get ATS score, keyword insights, and AI feedback instantly.
            </p>

            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full px-3 py-2 mb-4 rounded-lg bg-gray-700 text-gray-200"
              />
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={analyze}
                  disabled={loading}
                  className="bg-sky-500 hover:bg-sky-400 text-white px-5 py-2 rounded-lg font-medium"
                >
                  {loading ? "Analyzing…" : "Analyze"}
                </button>
                <button
                  onClick={loadLast}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-5 py-2 rounded-lg font-medium"
                >
                  Load Last Result
                </button>
              </div>
            </div>

            {res && (
              <div className="grid md:grid-cols-2 gap-8 mt-10">
                {/* ATS Score */}
                {atsData && (
                  <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      ATS Score
                    </h3>
                    <Doughnut data={atsData} />
                  </div>
                )}

                {/* Keywords */}
                {keywordsData && (
                  <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Keywords
                    </h3>
                    <Pie data={keywordsData} />
                  </div>
                )}

                {/* Subscores */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg md:col-span-2">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Subscores
                  </h3>
                  <ul className="space-y-2 text-gray-200">
                    {res.subscores &&
                      Object.entries(res.subscores).map(([key, val], idx) => (
                        <li key={idx}>
                          <span className="font-medium">{key}:</span> {val}%
                        </li>
                      ))}
                  </ul>
                </div>

                {/* AI Feedback */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg md:col-span-2">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    AI Feedback
                  </h3>
                  <pre className="text-gray-200 whitespace-pre-wrap">
                    {res.ai_feedback || "—"}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Background gradient */}
        <div
          className="absolute inset-0 m-auto max-w-xs h-[357px] blur-[118px] sm:max-w-md md:max-w-lg"
          style={{
            background:
              "linear-gradient(106.89deg, rgba(192, 132, 252, 0.11) 15.73%, rgba(14, 165, 233, 0.41) 15.74%, rgba(232, 121, 249, 0.26) 56.49%, rgba(79, 70, 229, 0.4) 115.91%)",
          }}
        ></div>
      </section>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-gray-500 text-sm">
      © 2025 ResumeX – Intelligent Resume Insights. All rights reserved. Developed by{" "}
        <a
          href="https://www.linkedin.com/in/praneethkandukuriii/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-200 underline"
        >
          Praneeth Kandukuri
        </a>
      </footer>
    </div>
  );
}


