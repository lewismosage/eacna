// src/pages/EventsSection.tsx
import React from 'react';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';
import Section from '../components/common/Section';
import Button from '../components/common/Button';
import Card, { CardContent } from '../components/common/Card';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
}

const EventsSection = () => {
  // Upcoming Events data now defined here
  const upcomingEvents: Event[] = [
    {
      id: 1,
      title: "PET1 Training in Nairobi",
      date: "September 15-16, 2024",
      location: "Gertrude's Children's Hospital, Nairobi",
      image: "https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: 2,
      title: "Annual EACNA Conference",
      date: "October 10-12, 2024",
      location: "Serena Hotel, Kampala, Uganda",
      image: "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: 3,
      title: "Pediatric Epilepsy Webinar",
      date: "November 5, 2024",
      location: "Virtual Event",
      image: "https://images.pexels.com/photos/8199190/pexels-photo-8199190.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];

  return (
    <>
      {/* Upcoming Events */}
      <Section id="upcoming-events">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">Upcoming Training Events</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join us for these upcoming training opportunities and conferences in child neurology.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map(event => (
            <Card key={event.id} className="overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardContent>
                <div className="flex items-start mb-3">
                  <Calendar className="h-5 w-5 text-primary-600 mt-1 mr-2" />
                  <div>
                    <span className="text-primary-600 font-semibold">{event.date}</span>
                    <p className="text-gray-600 text-sm">{event.location}</p>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary-800">{event.title}</h3>
                <Button variant="text" className="mt-2" to="/event-details">
                  View Details <ArrowRight className="ml-1 h-4 w-4"/>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button variant="outline" to="/all-events">
            View All Events
          </Button>
        </div>
      </Section>
      
      {/* Webinars & Annual Meetings */}
      <Section background="light">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">Annual Meetings & Webinars</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Access our archive of past events and register for upcoming webinars and annual conferences.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-800 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" /> Annual Conferences
            </h3>
            <p className="text-gray-700 mb-4">
              Our annual conferences bring together experts from across East Africa and beyond to share the 
              latest research and best practices in pediatric neurology.
            </p>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start">
                <span className="bg-secondary-100 text-secondary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2 mt-1">2023</span>
                <div>
                  <h4 className="font-semibold">3rd Annual EACNA Conference</h4>
                  <p className="text-gray-600 text-sm">Kigali, Rwanda | December 5-7, 2023</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-secondary-100 text-secondary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2 mt-1">2022</span>
                <div>
                  <h4 className="font-semibold">2nd Annual EACNA Conference</h4>
                  <p className="text-gray-600 text-sm">Dar es Salaam, Tanzania | November 10-12, 2022</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-secondary-100 text-secondary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2 mt-1">2021</span>
                <div>
                  <h4 className="font-semibold">Inaugural EACNA Conference</h4>
                  <p className="text-gray-600 text-sm">Nairobi, Kenya | October 15-17, 2021</p>
                </div>
              </li>
            </ul>
            <Button variant="outline" to="/conference-archives">
              View All Conference Archives
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-800 flex items-center">
              <Calendar className="h-5 w-5 mr-2" /> Webinars & Online Events
            </h3>
            <p className="text-gray-700 mb-4">
              Our monthly webinars feature presentations on various topics in pediatric neurology from 
              leading experts in the field.
            </p>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start">
                <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2 mt-1">Upcoming</span>
                <div>
                  <h4 className="font-semibold">Management of Status Epilepticus in Children</h4>
                  <p className="text-gray-600 text-sm">July 15, 2024 | 2:00 PM EAT</p>
                  <Button variant="text" size="sm" className="mt-1 p-0">
                    Register Now
                  </Button>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2 mt-1">Upcoming</span>
                <div>
                  <h4 className="font-semibold">Neurodevelopmental Outcomes in Children with Epilepsy</h4>
                  <p className="text-gray-600 text-sm">August 12, 2024 | 3:00 PM EAT</p>
                  <Button variant="text" size="sm" className="mt-1 p-0">
                    Register Now
                  </Button>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2 mt-1">Past</span>
                <div>
                  <h4 className="font-semibold">Advances in Pediatric Epilepsy Surgery</h4>
                  <p className="text-gray-600 text-sm">June 20, 2024 | Recording Available</p>
                  <Button variant="text" size="sm" className="mt-1 p-0">
                    Watch Recording
                  </Button>
                </div>
              </li>
            </ul>
            <Button variant="outline" to="/webinars">
              View All Webinars
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
};

export default EventsSection;