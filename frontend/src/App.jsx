import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Upload from "./Upload";
import About from "./About";
import Dev from "./Dev";
import Contact from "./Contact";

export default function App() {
  const [email, setEmail] = useState(null);

  return (
    <Routes>
      <Route path="/" element={<Login onLoggedIn={setEmail} />} />
      <Route path="/upload" element={<Upload email={email} />} />
      <Route path="/about" element={<About />} />
      <Route path="/dev" element={<Dev />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}

