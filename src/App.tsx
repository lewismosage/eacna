import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/layout/Layout';
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
import MemberPortal from './components/portal/memberportal';
import PaymentModal from './components/common/PaymentModal';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import AllPublicationsPage from './pages/AllPublicationsPage';
import ReadPaperPage from './pages/ReadPaperPage';
import WritePublicationPage from './components/portal/WritePublicationPage';
import Notifications from './components/portal/Notifications';

function App() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="membership" element={<MembershipPage setShowPaymentModal={setShowPaymentModal} />} />
          <Route path="login" element={<Login />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="/gallery/:year" element={<GalleryPage />} />
          <Route path="find-specialist" element={<FindSpecialistPage />} />
          <Route path="/specialist/:id" element={<SpecialistProfilePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="renew-membership" element={<RenewMembershipPage />} />
          <Route path="join-directory" element={<JoinDirectory />} />
          <Route path="events" element={<EventsSection />} />
          <Route path="event-details" element={<EventDetails />} />
          <Route path="all-events" element={<AllEvents />} />
          <Route path="conference-archives" element={<ConferenceArchives />} />
          <Route path="webinars" element={<AllWebinars />} />
          <Route path="member-portal" element={<MemberPortal />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/all-publications" element={<AllPublicationsPage />} />
          <Route path="/read-publication/:id" element={<ReadPaperPage />} />
          <Route path="/portal/publications" element={<WritePublicationPage />} /> 
          <Route path="/portal/notifications" element={<Notifications />} /> 
          
        </Route>
      </Routes>
      
      {showPaymentModal && (
        <PaymentModal onClose={() => setShowPaymentModal(false)} />
      )}
    </>
  );
}

export default App;