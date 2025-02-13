import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Hero } from "./components/home/Hero";
import { Impact } from "./components/home/Impact";
import { Mission } from "./components/home/Mission";
import { CoreValues } from "./components/home/CoreValues";
import { JoinUs } from "./components/home/JoinUs";
import { About } from "./pages/About";
import { Resources } from "./pages/Resources";
import { Events } from "./pages/Events";
import { Contact } from "./pages/Contact";
import Dashboard from "./pages/portal/Dashboard";
import { Login } from "./pages/portal/Login";
import Research from "./pages/portal/Research";
import { LearnMore } from "./pages/LearnMore";

function HomePage() {
  return (
    <main>
      <Hero />
      <Impact />
      <Mission />
      <CoreValues />
      <JoinUs />
    </main>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/portal/dashboard" element={<Dashboard />} />
          <Route path="/portal/login" element={<Login />} />
          <Route path="/portal/research" element={<Research />} />
          <Route path="/learn-more" element={<LearnMore />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
