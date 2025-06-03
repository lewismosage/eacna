import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, MapPin, Calendar, BookOpen, Award, ExternalLink, Edit } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_image?: string | null;
  membership_type: string;
  member_since: string;
  nationality: string;
  country_of_residence: string;
  city?: string;
  current_profession?: string;
  institution?: string;
  bio?: string;
}

interface Publication {
  id: number;
  title: string;
  journal: string;
  year: string;
  url: string;
  user_id: number;
}

const ViewProfile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Get current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('membership_directory')
          .select('*')
          .eq('email', user.email)
          .single();

        if (profileError) throw profileError;
        if (!profileData) throw new Error('User profile not found');

        setUserData(profileData);

        // Fetch user publications
        const { data: pubs, error: pubsError } = await supabase
          .from('publications')
          .select('*')
          .eq('user_id', profileData.id);

        if (pubsError) throw pubsError;
        setPublications(pubs || []);

      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const ProfileHeader = () => {
    if (!userData) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Profile Image */}
          <div className="relative">
            {userData.profile_image ? (
              <img 
                src={userData.profile_image} 
                alt={`${userData.first_name} ${userData.last_name}`}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-4xl border-4 border-white shadow">
                {userData.first_name.charAt(0)}{userData.last_name.charAt(0)}
              </div>
            )}
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900">
              {userData.first_name} {userData.last_name}
            </h1>
            <p className="text-primary-600 font-medium">{userData.membership_type}</p>
            {userData.current_profession && (
              <p className="text-gray-600 mt-1">{userData.current_profession}</p>
            )}
            
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{userData.email}</span>
              </div>
              {(userData.city || userData.country_of_residence) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {userData.city ? `${userData.city}, ` : ''}
                    {userData.country_of_residence}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Member since {formatMemberSince(userData.member_since)}</span>
              </div>
            </div>
          </div>
          
          {/* Edit Profile Button */}
          <Link 
            to="/portal/profile/settings" 
            className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-primary-100 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
        </div>
        
        {/* Bio */}
        {userData.bio && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h3 className="font-medium text-gray-700 mb-2">About</h3>
            <p className="text-gray-600">{userData.bio}</p>
          </div>
        )}
      </div>
    );
  };

  const ProfileTabs = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-4 font-medium text-sm flex-1 ${
            activeTab === 'overview'
              ? 'border-b-2 border-primary-600 text-primary-700'
              : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('publications')}
          className={`px-6 py-4 font-medium text-sm flex-1 ${
            activeTab === 'publications'
              ? 'border-b-2 border-primary-600 text-primary-700'
              : 'text-gray-600 hover:text-primary-600'
          }`}
        >
          Publications
        </button>
      </div>
    </div>
  );

  const Overview = () => {
    if (!userData) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Overview</h2>
        <div className="space-y-6">
          {(userData.current_profession || userData.institution) && (
            <div>
              <h3 className="text-gray-700 font-medium mb-2">Current Position</h3>
              <p className="text-gray-600">
                {userData.current_profession}
                {userData.institution && (
                  <span> at {userData.institution}</span>
                )}
              </p>
            </div>
          )}
          {publications.length > 0 && (
            <div>
              <h3 className="text-gray-700 font-medium mb-2">Recent Publications</h3>
              <div className="space-y-2">
                {publications.slice(0, 2).map((pub, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="pt-1">
                      <BookOpen className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">{pub.title}</p>
                      <p className="text-gray-600 text-sm">
                        {pub.journal}, {pub.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const Publications = () => {
    if (publications.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Publications</h2>
          <p className="text-gray-600">No publications found</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Publications</h2>
        <div className="space-y-6">
          {publications.map((pub) => (
            <div key={pub.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
              <h3 className="font-medium text-gray-800">{pub.title}</h3>
              <p className="text-gray-600 mt-1">{pub.journal}, {pub.year}</p>
              <a 
                href={pub.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 mt-2 inline-flex items-center gap-1 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Publication</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Award className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Not Found</h2>
          <p className="text-gray-600">We couldn't find your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-primary-800 mb-6">Member Profile</h1>
      <ProfileHeader />
      <ProfileTabs />
      {activeTab === 'overview' && <Overview />}
      {activeTab === 'publications' && <Publications />}
    </div>
  );
};

export default ViewProfile;