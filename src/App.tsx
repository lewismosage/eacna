import { Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { SupabaseProvider } from "./context/SupabaseContext";

// Layouts
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/layout/AdminLayout";

// Public Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/aboutpage/AboutUs";
import TrainingPage from "./pages/trainingpage/TrainingPage";
import MembershipPage from "./pages/membershipage/MembershipPage";
import PaymentPage from "./pages/membershipage/PaymentPage";
import WelcomePage from "./pages/WelcomePage";
import ResourcesPage from "./pages/resourcespage/ResourcesPage";
import GalleryPage from "./pages/GalleryPage";
import FindSpecialistPage from "./pages/specialistpage/FindSpecialistPage";
import SpecialistProfilePage from "./pages/specialistpage/SpecialistProfilePage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";
import RenewMembershipPage from "./pages/membershipage/RenewMembershipPage";
import JoinDirectory from "./pages/specialistpage/JoinDirectoryForm";
import EventsSection from "./pages/trainingpage/EventsSection";
import EventDetails from "./pages/trainingpage/EventDetails";
import AllEvents from "./pages/trainingpage/AllEvents";
import ConferenceArchives from "./pages/trainingpage/ConferenceArchives";
import AllWebinars from "./pages/trainingpage/AllWebinars";
import PrivacyPolicy from "./pages/sitepolicies/PrivacyPolicy";
import TermsOfService from "./pages/sitepolicies/TermsOfService";
import CookiePolicy from "./pages/sitepolicies/CookiePolicy";
import AllPublicationsPage from "./pages/resourcespage/AllPublicationsPage";
import ReadPaperPage from "./pages/resourcespage/ReadPaperPage";
import WebinarDetails from "./pages/trainingpage/WebinarDetails";
import AbstractSubmission from "./pages/trainingpage/AbstractSubmission";
import AbstractGuidelines from "./pages/trainingpage/AbstractGuidelines";
import AllReviewsPage from "./pages/specialistpage/AllReviewsPage";
import AllResourcesPage from "./pages/resourcespage/AllResourcesPage";
import AllVideosPage from "./pages/resourcespage/AllVideosPage";

// Member Portal Components
import Login from "./pages/portalpages/Login";
import ForgotPassword from "./pages/portalpages/ForgotPassword";
import ResetPassword from "./pages/portalpages/ResetPassword";
import MemberPortal from "./pages/portalpages/PortalDashboard";
import WritePublicationPage from "./pages/portalpages/WritePublications";
import MyPublications from "./pages/portalpages/MyPublications";
import ViewProfile from "./pages/portalpages/ViewProfile";
import MembershipStatus from "./pages/portalpages/MembershipStatus";

// Admin Pages
import AdminLogin from "./pages/adminpages/AdminLogin";
import AdminDashboard from "./pages/adminpages/AdminDashboard";
import ContactMessages from "./pages/adminpages/communications/ContactMessages";
import Newsletter from "./pages/adminpages/communications/Newsletter";
import Subscribers from "./pages/adminpages/communications/Subscribers";
import MemberApplications from "./pages/adminpages/members/MemberApplications";
import Directory from "./pages/adminpages/members/Directory";
import MembershipPayments from "./pages/adminpages/members/Payments";
import PublicationReview from "./pages/adminpages/publications/PublicationsReview";
import PublishedArticles from "./pages/adminpages/publications/PublishedArticles";
import Applications from "./pages/adminpages/Specialists/Applications";
import SpecialistsDirectory from "./pages/adminpages/Specialists/Directory";
import AnnualMeetings from "./pages/adminpages/events/AnnualMeetings";
import TrainingEvents from "./pages/adminpages/events/TrainingEvents";
import Webinars from "./pages/adminpages/events/Webinars";
import AbtractSubmissions from "./pages/adminpages/events/Submissions";

// Route protection
import ProtectedRoute from "./components/protectedroute/ProtectedRoute";
import UnsubscribePage from "./pages/UnsubscribePage";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        await supabase.auth.getSession();
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/login");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <SupabaseProvider client={supabase}>
      <Routes>
        {/* Public Routes with Layout (includes Header + Footer) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="membership" element={<MembershipPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="gallery/:year" element={<GalleryPage />} />
          <Route path="find-specialist" element={<FindSpecialistPage />} />
          <Route path="specialist/:id" element={<SpecialistProfilePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="renew-membership" element={<RenewMembershipPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="join-directory" element={<JoinDirectory />} />
          <Route path="events" element={<EventsSection />} />
          <Route path="event/:id" element={<EventDetails />} />
          <Route path="all-events" element={<AllEvents />} />
          <Route path="conference-archives" element={<ConferenceArchives />} />
          <Route path="webinars" element={<AllWebinars />} />
          <Route path="webinar/:id" element={<WebinarDetails />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="cookie-policy" element={<CookiePolicy />} />
          <Route path="all-publications" element={<AllPublicationsPage />} />
          <Route path="all-resources" element={<AllResourcesPage />} />
          <Route path="all-videos" element={<AllVideosPage />} />
          <Route path="read-publication/:id" element={<ReadPaperPage />} />
          <Route path="abstract-submission" element={<AbstractSubmission />} />
          <Route path="abstract-guidelines" element={<AbstractGuidelines />} />
          <Route path="/specialists/:id/reviews" element={<AllReviewsPage />} />
          <Route path="welcome" element={<WelcomePage />} />
          <Route path="*" element={<NotFoundPage />} />

          {/* Member Login */}
          <Route path="login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Member Portal */}
          <Route element={<ProtectedRoute />}>
            <Route path="portal/publications" element={<WritePublicationPage />} />
            <Route path="portal/my-publications" element={<MyPublications />} />
            <Route path="portal/publications/edit/:id" element={<WritePublicationPage />} />
            <Route path="member-portal" element={<MemberPortal />} />
            <Route path="/portal/profile" element={<ViewProfile />} />
            <Route path="/portal/membership" element={<MembershipStatus />} />
          </Route>
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Dashboard - Protected Route */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route
              path="communications/messages"
              element={<ContactMessages supabase={supabase} />}
            />
            <Route
              path="communications/newsletter"
              element={<Newsletter supabase={supabase} />}
            />
            <Route
              path="communications/subscribers"
              element={<Subscribers supabase={supabase} />}
            />
            <Route path="members/applications" element={<MemberApplications />}/>
            <Route path="members/payments" element={<MembershipPayments />} />
            <Route path="members/directory" element={<Directory />} />
            <Route path="events/meetings" element={<AnnualMeetings supabase={supabase} />} />
            <Route
              path="events/training"
              element={<TrainingEvents supabase={supabase} />}
            />
            <Route
              path="events/webinars"
              element={<Webinars supabase={supabase} />}
            />
            <Route
              path="specialists/applications"
              element={<Applications supabase={supabase} />}
            />
            <Route
              path="specialists/directory"
              element={<SpecialistsDirectory supabase={supabase} />}
            />
            <Route path="publications/review" element={<PublicationReview />} />
            <Route path="publications/published" element={<PublishedArticles />} />
            <Route path="events/abstracts" element={<AbtractSubmissions />} />
          </Route>

          <Route path="unsubscribe" element={<UnsubscribePage />} />
        </Route>
      </Routes>
    </SupabaseProvider>
  );
}

export default App;