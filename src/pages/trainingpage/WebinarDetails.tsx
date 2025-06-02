import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Video, Clock, Users, Tag, ArrowLeft, Check, AlertCircle, X, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import Section from '../../components/common/Section';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertModal from '../../components/common/AlertModal';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Webinar {
  id: string;
  title: string;
  date: string;
  description: string;
  image_url: string;
  tags: string[];
  start_time: string;
  end_time: string;
  agenda: {
    time: string;
    topic: string;
    speaker?: string;
  }[];
  speakers: {
    name: string;
    title: string;
    image_url?: string;
  }[];
  registration_link: string;
  webinar_link: string;
  recording_url: string;
  is_live: boolean;
  has_recording: boolean;
  status: 'draft' | 'published' | 'completed';
}

interface RegistrationForm {
  name: string;
  email: string;
  phone: string;
  organization: string;
  position: string;
}

const WebinarDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [webinar, setWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<RegistrationForm>({
    name: '',
    email: '',
    phone: '',
    organization: '',
    position: ''
  });
  const [alert, setAlert] = useState<{
    open: boolean;
    title?: string;
    message: string;
    onConfirm?: () => void;
  }>({ open: false, message: '' });

  useEffect(() => {
    const fetchWebinar = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('webinars')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (!data) {
          throw new Error('Webinar not found');
        }

        setWebinar(data as Webinar);
      } catch (err) {
        console.error("Error fetching webinar:", err);
        setError('Failed to load webinar details');
      } finally {
        setLoading(false);
      }
    };

    fetchWebinar();
  }, [id]);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterClick = () => {
    setShowRegistrationForm(true);
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!webinar) return;

  // Basic validation
  if (!formData.name || !formData.email) {
    setAlert({
      open: true,
      title: 'Missing Information',
      message: 'Please provide at least your name and email address.',
    });
    return;
  }

  setIsRegistering(true);

  try {
    const { data, error } = await supabase
      .from('webinar_registrations')
      .insert([{
        webinar_id: webinar.id,
        webinar_title: webinar.title,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        organization: formData.organization,
        position: formData.position,
        status: 'registered'
      }])
      .select();

    if (error) throw error;

    setRegistrationSuccess(true);
    setShowRegistrationForm(false);
    
    // Optionally send confirmation email
    // await sendConfirmationEmail(formData.email, webinar.title);
    
  } catch (err) {
    console.error("Error submitting registration:", err);
    setAlert({
      open: true,
      title: 'Registration Failed',
      message: 'There was an error processing your registration. Please try again later.',
    });
  } finally {
    setIsRegistering(false);
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Section>
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Webinars
          </Button>
        </div>
      </Section>
    );
  }

  if (!webinar) {
    return (
      <Section>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Webinar not found.</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Webinars
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      {/* Back button */}
      <div className="mb-6">
        <Button variant="text" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Webinars
        </Button>
      </div>

      {/* Registration success message */}
      {registrationSuccess && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 flex items-start">
          <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Registration Successful!</h3>
            <p className="text-sm">
              Thank you for registering for "{webinar.title}".
            </p>
          </div>
          <button 
            onClick={() => setRegistrationSuccess(false)}
            className="ml-auto text-green-700 hover:text-green-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Webinar header with image */}
      <div className="relative mb-8 rounded-lg overflow-hidden">
        <div className="h-64 w-full bg-gray-200">
          <img 
            src={webinar.image_url || 'https://via.placeholder.com/1200x400?text=No+Image'} 
            alt={webinar.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <h1 className="text-3xl font-bold text-white">{webinar.title}</h1>
          <div className="flex items-center text-white/90 mt-2">
            <Calendar className="h-5 w-5 mr-1" />
            <span>{formatEventDate(webinar.date)}</span>
            <span className="mx-2">•</span>
            <Clock className="h-5 w-5 mr-1" />
            <span>{webinar.start_time} - {webinar.end_time}</span>
            <span className="mx-2">•</span>
            <Video className="h-5 w-5 mr-1" />
            <span>Online Event</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Webinar status badge */}
          <div className="flex items-center gap-2 mb-4">
            {webinar.is_live ? (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Live Now
              </span>
            ) : webinar.has_recording ? (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                Recording Available
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Upcoming Webinar
              </span>
            )}
          </div>

          {/* Webinar description */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Webinar</h2>
            <div className="prose max-w-none text-gray-700">
              {webinar.description.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Webinar agenda */}
          {webinar.agenda?.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Webinar Agenda</h2>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Speaker</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {webinar.agenda.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.time}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.topic}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.speaker || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Speakers */}
          {webinar.speakers?.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Speakers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {webinar.speakers.map((speaker, index) => (
                  <div key={index} className="flex items-start p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gray-200 overflow-hidden mr-4">
                      {speaker.image_url ? (
                        <img src={speaker.image_url} alt={speaker.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <Users className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{speaker.name}</h3>
                      <p className="text-gray-600">{speaker.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Webinar details card */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Webinar Details</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="text-gray-900">{formatEventDate(webinar.date)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Time</h3>
                  <p className="text-gray-900">{webinar.start_time} - {webinar.end_time}</p>
                </div>
              </div>
              
              {webinar.tags?.length > 0 && (
                <div className="flex items-start">
                  <Tag className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {webinar.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-200 text-xs rounded-full text-gray-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Participation card */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How to Participate</h2>
            
            {webinar.is_live ? (
              <>
                <div className="bg-blue-50 text-blue-700 p-4 rounded-md flex items-start mb-4">
                  <Video className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>This webinar is currently live. Join now to participate.</p>
                  </div>
                </div>
                <a 
                  href={webinar.webinar_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2 px-4 rounded-md bg-green-600 text-white hover:bg-green-700 mb-4"
                >
                  Join Live Webinar
                </a>
              </>
            ) : webinar.has_recording ? (
              <>
                <div className="bg-purple-50 text-purple-700 p-4 rounded-md flex items-start mb-4">
                  <Video className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>This webinar has concluded, but you can watch the recording.</p>
                  </div>
                </div>
                <a 
                  href={webinar.recording_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700 mb-4"
                >
                  Watch Recording
                </a>
              </>
            ) : (
              <>
                {!showRegistrationForm ? (
                  <div className="space-y-4">
                    <p className="text-gray-700">Register now to receive participation details for this webinar.</p>
                    <Button 
                      onClick={handleRegisterClick}
                      className="w-full"
                    >
                      Register Now
                    </Button>
                    {webinar.registration_link && (
                      <p className="text-sm text-gray-500 text-center">
                        Or register through our <a href={webinar.registration_link} className="text-primary-600 hover:underline">external registration page</a>.
                      </p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                        Organization
                      </label>
                      <input
                        type="text"
                        id="organization"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                        Position/Role
                      </label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowRegistrationForm(false)}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isRegistering}
                        className="w-full"
                      >
                        {isRegistering ? 'Registering...' : 'Submit Registration'}
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Alert modal */}
      <AlertModal
        isOpen={alert.open}
        title={alert.title ?? 'Alert'}
        message={alert.message}
        onConfirm={() => setAlert({ ...alert, open: false })}
        onClose={() => setAlert({ ...alert, open: false })}
      />
    </Section>
  );
};

export default WebinarDetails;