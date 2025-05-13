// src/pages/AllEvents.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Search, Filter, Calendar as CalendarIcon } from 'lucide-react';
import Section from '../components/common/Section';
import Button from '../components/common/Button';
import Card, { CardContent } from '../components/common/Card';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
  category?: string;
  tags?: string[];
  type?: 'conference' | 'workshop' | 'webinar' | 'training';
}

const AllEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    // In a real application, this would be an API call
    const fetchEvents = async () => {
      try {
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock events data
        const eventsData: Event[] = [
          {
            id: 1,
            title: "PET1 Training in Nairobi",
            date: "September 15-16, 2024",
            location: "Gertrude's Children's Hospital, Nairobi",
            image: "https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=600",
            category: "Training",
            tags: ["epilepsy", "pediatric neurology", "training"],
            type: "training"
          },
          {
            id: 2,
            title: "Annual EACNA Conference",
            date: "October 10-12, 2024",
            location: "Serena Hotel, Kampala, Uganda",
            image: "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=600",
            category: "Conference",
            tags: ["conference", "annual meeting", "research"],
            type: "conference"
          },
          {
            id: 3,
            title: "Pediatric Epilepsy Webinar",
            date: "November 5, 2024",
            location: "Virtual Event",
            image: "https://images.pexels.com/photos/8199190/pexels-photo-8199190.jpeg?auto=compress&cs=tinysrgb&w=600",
            category: "Webinar",
            tags: ["epilepsy", "online", "CME"],
            type: "webinar"
          },
          {
            id: 4,
            title: "Neuroimaging Workshop",
            date: "December 3-4, 2024",
            location: "Aga Khan University Hospital, Nairobi",
            image: "https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg?auto=compress&cs=tinysrgb&w=600",
            category: "Workshop",
            tags: ["neuroimaging", "MRI", "practical skills"],
            type: "workshop"
          },
          {
            id: 5,
            title: "PET2 Advanced Epilepsy Training",
            date: "January 20-22, 2025",
            location: "Muhimbili University, Dar es Salaam",
            image: "https://images.pexels.com/photos/6129500/pexels-photo-6129500.jpeg?auto=compress&cs=tinysrgb&w=600",
            category: "Training",
            tags: ["epilepsy", "advanced", "training"],
            type: "training"
          },
          {
            id: 6,
            title: "Neurodevelopmental Disorders Webinar",
            date: "February 15, 2025",
            location: "Virtual Event",
            image: "https://images.pexels.com/photos/5053731/pexels-photo-5053731.jpeg?auto=compress&cs=tinysrgb&w=600",
            category: "Webinar",
            tags: ["neurodevelopment", "autism", "ADHD"],
            type: "webinar"
          }
        ];
        
        setEvents(eventsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on search term and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || event.category?.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesType = selectedType === 'all' || event.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Categories for filter
  const categories = ['all', ...Array.from(new Set(events.map(event => event.category?.toLowerCase() || '')))];
  
  // Event types for filter
  const eventTypes = ['all', 'conference', 'workshop', 'webinar', 'training'];

  return (
    <>
      <Section background="light">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary-800">All Events</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse our upcoming training opportunities, conferences, webinars, and workshops 
            in child neurology across East Africa.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-card p-6 mb-10">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.filter(cat => cat !== 'all').map((category, index) => (
                  <option key={index} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Event Types</option>
                {eventTypes.filter(type => type !== 'all').map((type, index) => (
                  <option key={index} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(event => (
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
                  {event.category && (
                    <span className="inline-block bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3">
                      {event.category}
                    </span>
                  )}
                  <Link to={`/events/${event.id}`}>
                    <Button variant="text" className="mt-2">
                      View Details <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-card p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Calendar className="h-8 w-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Events Found</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchTerm || selectedCategory !== 'all' || selectedType !== 'all' 
                ? "No events match your current search criteria. Please try adjusting your filters."
                : "There are no upcoming events at the moment. Please check back later for new events."}
            </p>
            {(searchTerm || selectedCategory !== 'all' || selectedType !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedType('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Pagination - for when you have many events */}
        {filteredEvents.length > 0 && (
          <div className="flex justify-center mt-12">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-primary-50 text-sm font-medium text-primary-600 hover:bg-primary-100"
              >
                1
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                2
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                3
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </nav>
          </div>
        )}
      </Section>
    </>
  );
};

export default AllEvents;