import { useState, useEffect } from "react";
import { Mail, Linkedin, Github, MessageSquare } from "lucide-react";

export default function Contact() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const navigation = [
    { title: "About", path: "/about" },
    { title: "Dev", path: "/dev" },
    { title: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    document.onclick = (e) => {
      if (!e.target.closest(".menu-btn")) setMenuOpen(false);
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
          {menuOpen ? "X" : "≡"}
        </button>
      </div>
    </div>
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (suggestion.trim()) {
      console.log("User Suggestion:", suggestion);
      setSubmitted(true);
      setSuggestion("");
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full relative z-20">
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
              <ul className="flex-1 justify-end items-center space-y-4 md:flex md:space-x-6 md:space-y-0 w-full whitespace-nowrap text-gray-300">
                {navigation.map((item, idx) => (
                  <li key={idx}>
                    <a href={item.path} className="hover:text-white">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Contact Content */}
      <main className="flex-1 px-6 py-16 max-w-4xl mx-auto text-gray-200">
        <h1 className="text-4xl font-bold text-white mb-6">Contact Us</h1>
        <p className="text-lg leading-relaxed mb-8 text-gray-300 text-center">
          Have any <span className="text-sky-400 font-medium">questions</span> or{" "}
          <span className="text-sky-400 font-medium">suggestions</span>? <br />
          Reach out to us via email, socials, or leave your valuable feedback below.
        </p>

        {/* Contact Icons */}
        <div className="flex justify-center gap-10 mb-12">
          <a
            href="mailto:praneethkandukuriii@example.com"
            className="flex flex-col items-center text-sky-400 hover:text-sky-300"
          >
            <Mail size={26} />
            <span className="mt-2 text-sm">Email</span>
          </a>
          <a
            href="https://www.linkedin.com/in/praneethkandukuriii/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center text-blue-500 hover:text-blue-400"
          >
            <Linkedin size={26} />
            <span className="mt-2 text-sm">LinkedIn</span>
          </a>
          <a
            href="https://github.com/PraneethKandukuriii"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center text-gray-400 hover:text-gray-200"
          >
            <Github size={26} />
            <span className="mt-2 text-sm">GitHub</span>
          </a>
        </div>

        {/* Divider */}
        <hr className="border-gray-700 mb-10" />

        {/* Suggestion Form */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-2 flex items-center gap-2">
            <MessageSquare size={22} /> Share Your Suggestions
          </h2>
          <p className="text-gray-400 mb-4">
            Your feedback helps us make{" "}
            <span className="text-sky-400 font-medium">ResumeX</span> more useful and effective for job seekers.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Write your feedback or suggestions here..."
              rows={4}
            />
            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-lg shadow-md"
            >
              Submit
            </button>
          </form>
          {submitted && (
            <p className="mt-3 text-green-400">
              ✅ Thank you for your suggestion! We appreciate your input.
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-gray-500 text-sm">
      © 2025 ResumeX – Intelligent Resume Insights. All rights reserved.
      </footer>
    </div>
  );
}
