import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/home/Hero';
import { Impact } from './components/home/Impact';
import { Mission } from './components/home/Mission';
import { CoreValues } from './components/home/CoreValues';
import { JoinUs } from './components/home/JoinUs';
import { About } from './pages/About';
import { Resources } from './pages/Resources';
import { Events } from './pages/Events';
import { Contact } from './pages/Contact';
import { Login } from './pages/portal/Login';
import Dashboard from './pages/portal/Dashboard';
import Research from './pages/portal/Research';
import { JoinMission } from './pages/JoinMission';
import { LearnMore } from './pages/LearnMore';
import { Approach } from './pages/Approach';
import { Membership } from './pages/Membership';
import { Support } from './pages/Support';


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
          <Route path="/portal/login" element={<Login />} />
          <Route path="/portal/dashboard" element={<Dashboard />} />
          <Route path="/portal/research" element={<Research />} />
          <Route path="/join-mission" element={<JoinMission />} />
          <Route path="/learn-more" element={<LearnMore />} />
          <Route path="/approach" element={<Approach />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/support" element={<Support />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
