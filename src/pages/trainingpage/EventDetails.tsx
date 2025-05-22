import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Tag, ArrowLeft, Check, AlertCircle, X } from 'lucide-react';
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

interface TrainingEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image_url: string;
  tags: string[];
  start_time: string;
  end_time: string;
  agenda: {
    time: string;
    activity: string;
  }[];
  speakers: {
    name: string;
    title: string;
    image_url?: string;
  }[];
  organizers: string[];
  registration_link: string;
  is_full: boolean;
}

interface RegistrationForm {
  name: string;
  email: string;
  phone: string;
  organization: string;
  position: string;
  special_requirements: string;
}

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<TrainingEvent | null>(null);
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
    position: '',
    special_requirements: ''
  });
  const [alert, setAlert] = useState<{
    open: boolean;
    title?: string;
    message: string;
    onConfirm?: () => void;
  }>({ open: false, message: '' });

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('training_events')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (!data) {
          throw new Error('Event not found');
        }

        setEvent(data as TrainingEvent);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
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
    if (event?.is_full) return;
    setShowRegistrationForm(true);
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!event) return;

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
      .from('event_registrations')
      .insert([{
        event_id: event.id,
        event_title: event.title,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        organization: formData.organization,
        position: formData.position,
        special_requirements: formData.special_requirements,
        status: 'registered'
      }])
      .select();

    if (error) throw error;

    setRegistrationSuccess(true);
    setShowRegistrationForm(false);
    
    // Optionally send confirmation email
    // await sendConfirmationEmail(formData.email, event.title);
    
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
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
          </Button>
        </div>
      </Section>
    );
  }

  if (!event) {
    return (
      <Section>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Event not found.</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
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
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>
      </div>

      {/* Registration success message */}
      {registrationSuccess && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 flex items-start">
          <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Registration Successful!</h3>
            <p className="text-sm">
              Thank you for registering for "{event.title}". A confirmation has been sent to {formData.email}.
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

      {/* Event header with image */}
      <div className="relative mb-8 rounded-lg overflow-hidden">
        <div className="h-64 w-full bg-gray-200">
          <img 
            src={event.image_url || 'https://via.placeholder.com/1200x400?text=No+Image'} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <h1 className="text-3xl font-bold text-white">{event.title}</h1>
          <div className="flex items-center text-white/90 mt-2">
            <Calendar className="h-5 w-5 mr-1" />
            <span>{formatEventDate(event.date)}</span>
            <span className="mx-2">•</span>
            <Clock className="h-5 w-5 mr-1" />
            <span>{event.start_time} - {event.end_time}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Event status badge */}
          {event.is_full && (
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Event Full
              </span>
            </div>
          )}

          {/* Event description */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
            <div className="prose max-w-none text-gray-700">
              {event.description.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Event agenda */}
          {event.agenda?.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Agenda</h2>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {event.agenda.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.time}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.activity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Speakers */}
          {event.speakers?.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Speakers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.speakers.map((speaker, index) => (
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
          {/* Event details card */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Event Details</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="text-gray-900">{formatEventDate(event.date)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Time</h3>
                  <p className="text-gray-900">{event.start_time} - {event.end_time}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="text-gray-900">{event.location}</p>
                </div>
              </div>
              
              {event.organizers?.length > 0 && (
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Organized By</h3>
                    <p className="text-gray-900">{event.organizers.join(', ')}</p>
                  </div>
                </div>
              )}
              
              {event.tags?.length > 0 && (
                <div className="flex items-start">
                  <Tag className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {event.tags.map((tag, index) => (
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

          {/* Registration card */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Registration</h2>
            {event.is_full ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p>This event is currently full. Please check back later for cancellations or future events.</p>
                </div>
              </div>
            ) : (
              <>
                {!showRegistrationForm ? (
                  <div className="space-y-4">
                    <p className="text-gray-700">Register now to secure your spot at this event.</p>
                    <Button 
                      onClick={handleRegisterClick}
                      className="w-full"
                    >
                      Register Now
                    </Button>
                    {event.registration_link && (
                      <p className="text-sm text-gray-500 text-center">
                        Or register through our <a href={event.registration_link} className="text-primary-600 hover:underline">external registration page</a>.
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
                    
                    <div>
                      <label htmlFor="special_requirements" className="block text-sm font-medium text-gray-700 mb-1">
                        Special Requirements
                      </label>
                      <textarea
                        id="special_requirements"
                        name="special_requirements"
                        rows={3}
                        value={formData.special_requirements}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Dietary restrictions, accessibility needs, etc."
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

export default EventDetails;