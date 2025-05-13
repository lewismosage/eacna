// src/pages/EventDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Download } from 'lucide-react';
import Section from '../components/common/Section';
import Button from '../components/common/Button';

// Define the event interface
interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  agenda?: {
    time: string;
    activity: string;
  }[];
  speakers?: {
    name: string;
    title: string;
    image?: string;
  }[];
  organizers?: string[];
  registrationLink?: string;
  isFull?: boolean;
}

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real application, this would be an API call
    // For now, we'll mock the event data
    const fetchEvent = async () => {
      try {
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock events database
        const eventsData: Event[] = [
          {
            id: 1,
            title: "PET1 Training in Nairobi",
            date: "September 15-16, 2024",
            location: "Gertrude's Children's Hospital, Nairobi",
            image: "https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=600",
            description: "The Pediatric Epilepsy Training (PET1) course is designed for healthcare professionals involved in the care of children with epilepsy. This comprehensive two-day training program covers diagnosis, investigations, treatment options, and management strategies for pediatric epilepsy.",
            startTime: "8:00 AM",
            endTime: "5:00 PM",
            agenda: [
              { time: "8:00 - 8:30", activity: "Registration & Morning Coffee" },
              { time: "8:30 - 10:30", activity: "Introduction to Pediatric Epilepsy" },
              { time: "10:30 - 10:45", activity: "Coffee Break" },
              { time: "10:45 - 12:30", activity: "Seizure Types and Classifications" },
              { time: "12:30 - 13:30", activity: "Lunch" },
              { time: "13:30 - 15:30", activity: "Treatment Approaches & Case Studies" },
              { time: "15:30 - 15:45", activity: "Coffee Break" },
              { time: "15:45 - 17:00", activity: "Practical Session & Q&A" }
            ],
            speakers: [
              { name: "Dr. Sarah Kimani", title: "Pediatric Neurologist, EACNA President" },
              { name: "Dr. James Mwangi", title: "Head of Neurology, Gertrude's Children's Hospital" },
              { name: "Prof. Elizabeth Odera", title: "Consultant Pediatric Neurologist" }
            ],
            organizers: ["East African Child Neurology Association", "Gertrude's Children's Hospital"],
            registrationLink: "/register/pet1-nairobi",
            isFull: false
          },
          {
            id: 2,
            title: "Annual EACNA Conference",
            date: "October 10-12, 2024",
            location: "Serena Hotel, Kampala, Uganda",
            image: "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=600",
            description: "The Annual EACNA Conference brings together professionals from across East Africa and beyond to share the latest research and best practices in pediatric neurology. This year's theme is 'Advancing Pediatric Neurology Care in Resource-Limited Settings'.",
            startTime: "9:00 AM",
            endTime: "6:00 PM",
            agenda: [
              { time: "Day 1", activity: "Pre-conference Workshops" },
              { time: "Day 2", activity: "Opening Ceremony, Keynote Address, Scientific Sessions" },
              { time: "Day 3", activity: "Scientific Sessions, Panel Discussions, Closing Ceremony" }
            ],
            speakers: [
              { name: "Prof. David Kariuki", title: "Keynote Speaker, University of Nairobi" },
              { name: "Dr. Florence Musubika", title: "EACNA Vice President" },
              { name: "Dr. Emmanuel Tusiime", title: "Head of Pediatrics, Mulago Hospital" }
            ],
            organizers: ["East African Child Neurology Association", "Uganda Pediatric Association"],
            registrationLink: "/register/eacna-conference-2024",
            isFull: false
          },
          {
            id: 3,
            title: "Pediatric Epilepsy Webinar",
            date: "November 5, 2024",
            location: "Virtual Event",
            image: "https://images.pexels.com/photos/8199190/pexels-photo-8199190.jpeg?auto=compress&cs=tinysrgb&w=600",
            description: "This virtual webinar will focus on current approaches to pediatric epilepsy diagnosis and management. It is designed for pediatricians, neurologists, and other healthcare professionals interested in pediatric neurology.",
            startTime: "2:00 PM",
            endTime: "4:30 PM",
            agenda: [
              { time: "2:00 - 2:15", activity: "Welcome and Introduction" },
              { time: "2:15 - 3:00", activity: "Updates in Pediatric Epilepsy Diagnosis" },
              { time: "3:00 - 3:45", activity: "Management Approaches in Resource-Limited Settings" },
              { time: "3:45 - 4:30", activity: "Q&A and Discussion" }
            ],
            speakers: [
              { name: "Dr. Rebecca Ouma", title: "Pediatric Neurologist, Kenyatta National Hospital" },
              { name: "Dr. Thomas Ngwiri", title: "Pediatric Neurology Fellow" }
            ],
            organizers: ["East African Child Neurology Association"],
            registrationLink: "/register/epilepsy-webinar",
            isFull: false
          }
        ];
        
        const foundEvent = eventsData.find(e => e.id === parseInt(id || '0'));
        setEvent(foundEvent || null);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching event details:", error);
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <Section>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Section>
    );
  }

  if (!event) {
    return (
      <Section>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-8">The event you are looking for does not exist or has been removed.</p>
          <Link to="/events">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
            </Button>
          </Link>
        </div>
      </Section>
    );
  }

  return (
    <>
      {/* Hero Section with Event Image */}
      <div className="relative h-64 md:h-96 w-full">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center z-20">
          <div className="container mx-auto px-4">
            <Link to="/events" className="inline-flex items-center text-white hover:text-primary-200 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{event.title}</h1>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <Section>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-card p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 text-primary-800">About This Event</h2>
              <p className="text-gray-700">{event.description}</p>
              
              {event.organizers && event.organizers.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Organized by:</h3>
                  <p className="text-gray-700">{event.organizers.join(', ')}</p>
                </div>
              )}
            </div>

            {event.agenda && event.agenda.length > 0 && (
              <div className="bg-white rounded-lg shadow-card p-6 mb-8">
                <h2 className="text-xl font-bold mb-4 text-primary-800">Agenda</h2>
                <ul className="space-y-4">
                  {event.agenda.map((item, index) => (
                    <li key={index} className="border-l-2 border-primary-500 pl-4 py-1">
                      <span className="font-semibold text-primary-700">{item.time}</span>
                      <p className="text-gray-700">{item.activity}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {event.speakers && event.speakers.length > 0 && (
              <div className="bg-white rounded-lg shadow-card p-6">
                <h2 className="text-xl font-bold mb-4 text-primary-800">Speakers</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {event.speakers.map((speaker, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-gray-200 rounded-full h-12 w-12 flex items-center justify-center mr-3">
                        {speaker.image ? (
                          <img src={speaker.image} alt={speaker.name} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-gray-500">{speaker.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{speaker.name}</h3>
                        <p className="text-gray-600 text-sm">{speaker.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-card p-6 mb-6">
              <h2 className="text-lg font-bold mb-4 text-primary-800">Event Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-primary-600 mt-1 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Date</h3>
                    <p className="text-gray-600">{event.date}</p>
                  </div>
                </div>
                
                {event.startTime && (
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-primary-600 mt-1 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Time</h3>
                      <p className="text-gray-600">{event.startTime} - {event.endTime}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary-600 mt-1 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Location</h3>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>
              </div>
              
              {event.registrationLink && (
                <div className="mt-6">
                  <Link to={event.registrationLink}>
                    <Button 
                      className="w-full" 
                      disabled={event.isFull}
                    >
                      {event.isFull ? 'Registration Full' : 'Register Now'}
                    </Button>
                  </Link>
                  
                  {event.isFull && (
                    <p className="text-sm text-red-600 mt-2">
                      This event is currently full. Please check back later for openings.
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-card p-6">
              <h2 className="text-lg font-bold mb-4 text-primary-800">Share This Event</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="h-4 w-4 mr-1" /> Share
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-1" /> Calendar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default EventDetails;