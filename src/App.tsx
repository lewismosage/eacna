import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Layouts
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import TrainingPage from './pages/TrainingPage';
import MembershipPage from './pages/MembershipPage';
import Login from './pages/Login';
import ResourcesPage from './pages/ResourcesPage';
import GalleryPage from './pages/GalleryPage';
import FindSpecialistPage from './pages/FindSpecialistPage';
import SpecialistProfilePage from './pages/SpecialistProfilePage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import RenewMembershipPage from './pages/RenewMembershipPage';
import JoinDirectory from './pages/JoinDirectoryForm';
import EventsSection from './pages/EventsSection';
import EventDetails from './pages/EventDetails';
import AllEvents from './pages/AllEvents';
import ConferenceArchives from './pages/ConferenceArchives';
import AllWebinars from './pages/AllWebinars';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import AllPublicationsPage from './pages/AllPublicationsPage';
import ReadPaperPage from './pages/ReadPaperPage';

// Member Portal Components
import MemberPortal from './components/portal/memberportal';
import WritePublicationPage from './components/portal/WritePublicationPage';
import Notifications from './components/portal/Notifications';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import ContactMessages from './pages/Admin/ContactMessages';
import Newsletter from './pages/Admin/Newsletter';
import Subscribers from './pages/Admin/Subscribers';
import SpecialistsApplications from './pages/Admin/SpecialistsApplications';
import MembershipApplications from './pages/Admin/MembershipApplications';


// Modals
import PaymentModal from './components/common/PaymentModal';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;

const supabase = createClient(supabaseUrl, supabaseKey);



function App() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);


  return (
    <>
      <Routes>
        {/* Public Routes with Layout (includes Header + Footer) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route
            path="membership"
            element={<MembershipPage setShowPaymentModal={setShowPaymentModal} />}
          />
          <Route path="login" element={<Login />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="gallery/:year" element={<GalleryPage />} />
          <Route path="find-specialist" element={<FindSpecialistPage />} />
          <Route path="specialist/:id" element={<SpecialistProfilePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="renew-membership" element={<RenewMembershipPage />} />
          <Route path="join-directory" element={<JoinDirectory />} />
          <Route path="events" element={<EventsSection />} />
          <Route path="event-details" element={<EventDetails />} />
          <Route path="all-events" element={<AllEvents />} />
          <Route path="conference-archives" element={<ConferenceArchives />} />
          <Route path="webinars" element={<AllWebinars />} />

          {/* Legal Pages */}
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="cookie-policy" element={<CookiePolicy />} />

          {/* Publications */}
          <Route path="all-publications" element={<AllPublicationsPage />} />
          <Route path="read-publication/:id" element={<ReadPaperPage />} />

          {/* Member Portal */}
          <Route path="portal/publications" element={<WritePublicationPage />} />
          <Route path="portal/notifications" element={<Notifications />} />
          <Route path="member-portal" element={<MemberPortal />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin Route with Header only (no footer) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="/admin/communications/messages" element={<ContactMessages supabase={supabase} />} />
          <Route path="/admin/communications/newsletter" element={<Newsletter supabase={supabase} />} />
          <Route path="/admin/communications/subscribers" element={<Subscribers supabase={supabase} />} />
          <Route path="/admin/specialists/applications" element={<SpecialistsApplications supabase={supabase} />} />
          <Route path="/admin/members/applications" element={<MembershipApplications supabase={supabase} />} /> 

        </Route>
      </Routes>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal onClose={() => setShowPaymentModal(false)} />
      )}
    </>
  );
}

export default App;
