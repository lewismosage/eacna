import React from 'react';
import { Calendar, MapPin, Clock, Users, ExternalLink } from 'lucide-react';

const upcomingEvents = [
  {
    id: 1,
    title: "Annual East African Child Neurology Conference",
    date: "June 15-17, 2024",
    location: "Serena Hotel, Nairobi",
    description: "Join leading experts for our flagship conference featuring keynote speakers, workshops, and networking opportunities.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80",
    registrationUrl: "#"
  },
  {
    id: 2,
    title: "Pediatric Epilepsy Workshop",
    date: "July 8, 2024",
    location: "Aga Khan University Hospital, Dar es Salaam",
    description: "Intensive workshop on the latest developments in pediatric epilepsy diagnosis and treatment.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80",
    registrationUrl: "#"
  },
  {
    id: 3,
    title: "Research Symposium",
    date: "August 22-23, 2024",
    location: "Kampala Serena Hotel",
    description: "Present and discuss the latest research in child neurology across East Africa.",
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&q=80",
    registrationUrl: "#"
  }
];

const pastEvents = [
  {
    id: 4,
    title: "Neurological Assessment Training",
    date: "March 5, 2024",
    location: "Virtual Event",
    description: "Online training session on pediatric neurological assessment techniques.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80",
    recordingUrl: "#"
  }
];

export function Events() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative py-24 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-6">
              Events & Conferences
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join us for educational conferences, workshops, and networking opportunities
              in child neurology across East Africa.
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">{event.title}</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{event.description}</p>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <Users className="h-5 w-5 mr-2" />
                  Register Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Events */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Past Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pastEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="h-48 overflow-hidden opacity-75">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">{event.title}</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{event.description}</p>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  View Recording
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}