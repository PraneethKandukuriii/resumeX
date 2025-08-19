import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HeaderAndHero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.access);
        navigate("/upload", { state: { email } });
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Network error. Try again.");
    }

    setLoading(false);
  };

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
                <li className="text-center md:text-left">
                  <a
                    href="/upload"
                    className="inline-block py-2 px-4 text-white font-medium bg-sky-500 hover:bg-sky-400 active:bg-sky-600 rounded-full duration-150 whitespace-nowrap"
                  >
                    Upload Resume
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1">
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 py-28 md:px-8">
          <div className="space-y-5 max-w-4xl mx-auto text-center">
            <h2 className="text-5xl sm:text-6xl font-extrabold text-white mx-auto">
              Optimize Your Resume. Score Higher. Stand Out.
            </h2>
            <p className="text-xl text-gray-400 mt-4">
              Enter your email and let ResumeX give your resume AI-powered insights!
            </p>

            <form
              onSubmit={handleSubmit}
              className="justify-center items-center gap-x-3 sm:flex mt-5"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="w-full px-3 py-2.5 text-gray-400 bg-gray-700 focus:bg-gray-900 duration-150 outline-none rounded-lg shadow sm:max-w-sm sm:w-auto"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-x-2 py-2.5 px-4 mt-3 w-full text-sm text-white font-medium bg-sky-500 hover:bg-sky-400 active:bg-sky-600 duration-150 rounded-lg sm:mt-0 sm:w-auto"
              >
                {loading ? "Processing..." : "Boost My Resume"}
              </button>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
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

      {/* Footer Watermark */}
      <footer className="w-full py-4 text-center text-gray-500 text-sm">
      © 2025 ResumeX – Intelligent Resume Insights. All rights reserved. | Developed by{" "}
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
