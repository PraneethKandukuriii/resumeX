import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Sparkles, Settings } from "lucide-react";

export default function About() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

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
            // close icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          ) : (
            // burger
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                 strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
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
                  <li key={idx} className="text-gray-300 hover:text-gray-400 text-center md:text-left">
                    <a href={item.path}>{item.title}</a>
                  </li>
                ))}
                <li className="text-center md:text-left">
                  <button
                    onClick={() => navigate("/upload")}
                    className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Start Using Now
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="text-center py-20 px-6 bg-gradient-to-r from-gray-800 to-gray-700">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Create Professional Resumes with ResumeX
        </h1>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Generate ATS-friendly resumes in seconds. ResumeX blends manual parsing with AI insights
          to deliver precise formatting, keyword guidance, and suggestions that help you stand out.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate("/upload")}
            className="px-8 py-3 text-lg rounded-2xl shadow-md bg-sky-500 text-white hover:bg-sky-400"
          >
            Start Using Now
          </button>
        </div>
        <p className="mt-6 text-sm text-gray-400">See what you can create with ResumeX</p>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-6 bg-gray-900">
        <h2 className="text-3xl font-bold text-center mb-10">Powerful Features for Perfect Resumes</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="rounded-xl border border-gray-700 p-6 text-center h-full">
            <FileText className="w-10 h-10 mx-auto mb-3 text-sky-400" />
            <h3 className="text-lg font-semibold mb-1">ATS Friendly</h3>
            <p className="text-gray-400">Formatting that passes Applicant Tracking Systems.</p>
          </div>
          <div className="rounded-xl border border-gray-700 p-6 text-center h-full">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-fuchsia-400" />
            <h3 className="text-lg font-semibold mb-1">AI Suggestions</h3>
            <p className="text-gray-400">Actionable edits to strengthen impact and clarity.</p>
          </div>
          <div className="rounded-xl border border-gray-700 p-6 text-center h-full">
            <Settings className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
            <h3 className="text-lg font-semibold mb-1">Adjust Sections</h3>
            <p className="text-gray-400">Reorder and fine-tune any section with ease.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-6 bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto text-center">
          <div className="rounded-xl border border-gray-700 p-6 h-full">
            <h3 className="text-xl font-semibold mb-2">01. Upload Your Resume</h3>
            <p className="text-gray-300">Choose a PDF/DOCX/TXT and submit it for analysis.</p>
          </div>
          <div className="rounded-xl border border-gray-700 p-6 h-full">
            <h3 className="text-xl font-semibold mb-2">02. Manual + AI Parsing</h3>
            <p className="text-gray-300">
              We combine deterministic parsing with AI to extract sections, skills, and context.
            </p>
          </div>
          <div className="rounded-xl border border-gray-700 p-6 h-full">
            <h3 className="text-xl font-semibold mb-2">03. ATS Score & Suggestions</h3>
            <p className="text-gray-300">
              See your ATS score, keyword coverage, and concrete AI suggestions to improve.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose + Reviews */}
      <section id="why" className="py-20 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-bold mb-6">Why Choose ResumeX?</h2>
            <p className="text-gray-300 mb-4">
              ResumeX blends reliable manual parsing with powerful AI to deliver fast, clear, and
              practical feedback. Built on PostgreSQL for performance and stability.
            </p>
            <ul className="space-y-3 text-gray-300">
  <li>• Instantly calculate your ATS compatibility score</li>
  <li>• AI-powered suggestions to boost your resume</li>
  <li>• Highlight missing skills & keywords recruiters look for</li>
  <li>• Easy drag-and-drop upload (PDF & DOCX supported)</li>
  <li>• 100% free, secure, and private—your data stays yours</li>
</ul>

          </div>

          {/* Reviews column */}
          <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-2xl shadow-md">
              <p className="italic text-gray-200">
                "ResumeX helped me land multiple interview calls! The ATS score boost and AI
                feedback were game changers."
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="font-semibold text-white">Ananya Sharma • Parul University</p>
                <div className="flex space-x-1 text-yellow-400" aria-label="5 stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                         viewBox="0 0 20 20" className="w-5 h-5">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.17c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.959c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.285-3.959a1 1 0 00-.364-1.118L2.045 9.387c-.784-.57-.38-1.81.588-1.81h4.17a1 1 0 00.951-.69l1.285-3.96z"/>
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-800 rounded-2xl shadow-md">
              <p className="italic text-gray-200">
                "Simple, effective, and professional. I uploaded my resume and had targeted
                suggestions and a clear ATS score in minutes."
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="font-semibold text-white">Rohit Mehta • Gitam University</p>
                <div className="flex space-x-1 text-yellow-400" aria-label="5 stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                         viewBox="0 0 20 20" className="w-5 h-5">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.17c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.959c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.285-3.959a1 1 0 00-.364-1.118L2.045 9.387c-.784-.57-.38-1.81.588-1.81h4.17a1 1 0 00.951-.69l1.285-3.96z"/>
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-6 bg-gray-800 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Optimize Your Resume Today</h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-6">
          No credit card required • Free forever • Get instant insights
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/upload")}
            className="px-8 py-3 text-lg rounded-2xl shadow-md bg-sky-600 text-white hover:bg-sky-500"
          >
            Optimize Your Resume Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-gray-500 text-sm">
      © 2025 ResumeX – Intelligent Resume Insights. All rights reserved.
      </footer>
    </div>
  );
}
