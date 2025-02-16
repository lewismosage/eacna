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
import Research from "./pages/Research";
import { LearnMore } from "./pages/LearnMore";
import { Membership } from "./pages/Membership";
import { Register } from "./pages/Register";
import { JoinMission } from "./pages/JoinMission";
import { Support } from "./pages/Support";
import { Approach } from "./pages/Approach";
import MyProjects from "./pages/portal/MyProjects";
import ArticleDetail from "./pages/ArticleDetail";
import { AdminLayout } from './pages/admin/AdminLayout';
import { ManageResources } from './pages/admin/ManageResources';
import { ManageEvents } from './pages/admin/ManageEvents';
import { RequireAuth } from './components/admin/RequireAuth';
import { AdminLogin } from './pages/admin/AdminLogin';

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
          <Route path="/research" element={<Research />} />
          <Route path="/learn-more" element={<LearnMore />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join-mission" element={<JoinMission />} />
          <Route path="/support" element={<Support />} />
          <Route path="/approach" element={<Approach />} />
          <Route path="/portal/myprojects" element={<MyProjects />} />{" "}
          <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/admin" element={<AdminLayout />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route path="resources" element={<ManageResources />} />
          <Route path="events" element={<ManageEvents />} />
        </Route>
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
