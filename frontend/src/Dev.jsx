import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Cpu, Camera } from "lucide-react";

export default function Dev() {
  return (
    <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-black min-h-screen text-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 md:px-20 py-6 border-b border-gray-800 sticky top-0 bg-gray-950/80 backdrop-blur-md z-50">
        <h1 className="text-3xl font-extrabold tracking-wide bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
          ResumeX
        </h1>
        <nav className="hidden md:flex gap-8 text-gray-400 text-sm font-medium">
          <a href="/about" className="hover:text-white transition">About</a>
          <a href="/dev" className="hover:text-white transition">Dev</a>
          <a href="/contact" className="hover:text-white transition">Contact</a>
        </nav>
      </header>

      {/* Hero */}
      <motion.section
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  className="text-center py-24 px-6 md:px-20"
>
  <h3 className="text-2xl md:text-3xl text-gray-400 mb-4">
    Hey, I'm
  </h3>
  <h2 className="text-5xl md:text-6xl font-extrabold text-sky-400 mb-6">
    Praneeth Kandukuri
  </h2>
  <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-4">
    A curious learner who loves solving problems with code.  
    Always exploring new technologies to create meaningful solutions.
  </p>
  <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
    Passionate about <span className="text-white">ML</span>,{" "}
    <span className="text-white">full-stack development</span>, and{" "}
    <span className="text-white">data analytics</span>. I build real-world{" "}
    <span className="text-sky-400">impactful</span> applications.
  </p>
</motion.section>


      {/* Education Timeline */}
<section className="py-20 px-6 md:px-20 max-w-4xl mx-auto">
  <h3 className="text-3xl font-semibold text-sky-400 mb-12 text-center">
    Education
  </h3>
  <div className="relative border-l-2 border-sky-500/40 ml-6">
    {[
      { 
        icon: <BookOpen size={20} />, 
        title: "SPR High School", 
        period: "– Schooling", 
        location: "Nalgonda" 
      },
      { 
        icon: <GraduationCap size={20} />, 
        title: "Gouthami Junior College", 
        period: "2020 – 2022 | Intermediate", 
        location: "Nalgonda" 
      },
      { 
        icon: <Cpu size={20} />, 
        title: "B.Tech in Computer Science & Engineering", 
        period: "2022 – Present | 7th Semester", 
        location: "Vadodara, Gujarat" 
      },
    ].map((edu, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: i * 0.3 }}
        viewport={{ once: true }}
        className="mb-12 ml-6 relative"
      >
        {/* Animated Dot */}
        <motion.span
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.3 }}
          viewport={{ once: true }}
          className="absolute -left-6 top-1 w-4 h-4 bg-sky-400 rounded-full shadow-lg shadow-sky-500/40"
        />

        {/* Icon */}
        <div className="text-sky-400 absolute -left-12 top-0">{edu.icon}</div>

        <h4 className="text-lg font-bold text-white">{edu.title}</h4>
        <p className="text-gray-400 text-sm">
          {edu.period} | {edu.location}
        </p>
      </motion.div>
    ))}
  </div>
</section>

      {/* Projects */}
      <section className="py-20 px-6 md:px-20 bg-gradient-to-br from-gray-900 to-gray-950">
  <h3 className="text-3xl font-semibold text-sky-400 mb-12 text-center">
    Projects
  </h3>
  <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
    {[
      {
        title: "College Prediction System (ML)",
        desc: "Predicts colleges based on rank, gender, and other inputs. Data sourced from govt sites. Used in E-MACET sessions.",
      },
      {
        title: "SnapHire",
        desc: "Full-stack platform to book photographers, editors, and creators with smooth profile & booking workflows.",
      },
    ].map((proj, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: i * 0.2 }}
        viewport={{ once: true }}
        className="bg-gray-950/70 border border-gray-800 rounded-2xl p-6 hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500/20 transition"
      >
        <h4 className="text-xl font-bold mb-2 text-white">{proj.title}</h4>
        <p className="text-gray-400 leading-relaxed text-sm">{proj.desc}</p>
      </motion.div>
    ))}
  </div>
</section>


      {/* Skills */}
      <section className="py-20 px-6 md:px-20">
        <h3 className="text-3xl font-semibold text-sky-400 mb-12 text-center">
          Skills & Expertise
        </h3>
        <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
          {["Data Structures & Algorithms","Machine Learning","Full-Stack Development","PostgreSQL","n8n Automations","Photography","Video Editing","Storytelling"].map((skill, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="px-4 py-2 text-sm bg-gray-900/60 border border-gray-700 rounded-full text-gray-300 hover:border-sky-400 hover:text-white transition"
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-gray-500 text-sm border-t border-gray-800">
        © {new Date().getFullYear()} ResumeX – Intelligent Resume Insights. All rights reserved.
      </footer>
    </div>
  );
}
