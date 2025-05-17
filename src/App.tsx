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
import MemberPortal from './components/membersportal/memberportal';
import WritePublicationPage from './components/membersportal/WritePublicationPage';
import Notifications from './components/membersportal/Notifications';

// Admin Pages
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ContactMessages from './pages/Admin/communications/ContactMessages';
import Newsletter from './pages/Admin/communications/Newsletter';
import Subscribers from './pages/Admin/communications/Subscribers';
import MemberApplications from './pages/Admin/members/MemberApplications';
import Directory from './pages/Admin/members/Directory';
import MembershipPayments from './pages/Admin/members/Payments';
import PublicationReview from './pages/Admin/publications/PublicationsReview';
import PublishedArticles from './pages/Admin/publications/PublishedArticles';
import Applications from './pages/Admin/Specialists/Applications';
import SpecialistsDirectory from './pages/Admin/Specialists/Directory';
import AnnualMeetings from './pages/Admin/events/AnnualMeetings';
import TrainingEvents from './pages/Admin/events/TrainingEvents';
import Webinars from './pages/Admin/events/Webinars';
import AbtractSubmissions from './pages/Admin/events/AbstractSubmissions';

// Modals
import PaymentModal from './pages/PaymentModal';
import LoadingSpinner from './components/common/LoadingSpinner';

// Route protection
import ProtectedRoute from './components/common/ProtectedRoute';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading] = useState(false); 


  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <LoadingSpinner />
        </div>
      )}
      <Routes>
        {/* Public Routes with Layout (includes Header + Footer) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="membership" element={<MembershipPage setShowPaymentModal={setShowPaymentModal} />} />
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
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="cookie-policy" element={<CookiePolicy />} />
          <Route path="all-publications" element={<AllPublicationsPage />} />
          <Route path="read-publication/:id" element={<ReadPaperPage />} />

          {/* Protected Member Portal */}
          <Route element={<ProtectedRoute />}>
            <Route path="portal/publications" element={<WritePublicationPage />} />
            <Route path="portal/notifications" element={<Notifications />} />
            <Route path="member-portal" element={<MemberPortal />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Dashboard - Protected Route */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="communications/messages" element={<ContactMessages supabase={supabase} />} />
            <Route path="communications/newsletter" element={<Newsletter supabase={supabase} />} />
            <Route path="communications/subscribers" element={<Subscribers supabase={supabase} />} />
            <Route path="members/applications" element={<MemberApplications />} />
            <Route path="members/payments" element={<MembershipPayments supabase={supabase} />} />
            <Route path="members/directory" element={<Directory />} />
            <Route path="events/meetings" element={<AnnualMeetings/>} />
            <Route path="events/training" element={<TrainingEvents />} />
            <Route path="events/webinars" element={<Webinars />} />
            <Route path="specialists/applications" element={<Applications supabase={supabase} />} />
            <Route path="specialists/directory" element={<SpecialistsDirectory supabase={supabase} />} />
            <Route path="publications/review" element={<PublicationReview supabase={supabase} />} />
            <Route path="publications/published" element={<PublishedArticles supabase={supabase} />} />
            <Route path="events/abstracts" element={<AbtractSubmissions />} /> 
          </Route>
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
