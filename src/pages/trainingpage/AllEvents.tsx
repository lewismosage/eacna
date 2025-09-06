// src/pages/AllEvents.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Search, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { createClient } from '@supabase/supabase-js';
import Section from '../../components/common/Section';
import Button from '../../components/common/Button';
import Card, { CardContent } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
  start_time: string;
  end_time: string;
  status: 'draft' | 'published' | 'completed';
  category?: string;
  type?: 'conference' | 'workshop' | 'webinar' | 'training';
}

const AllEvents = () => {
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('training_events')
        .select('*')
        .eq('status', 'published')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data as TrainingEvent[] || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };

  const formatTimeRange = (start: string, end: string) => {
    if (!start || !end) return '';
    return `${start} - ${end}`;
  };

  // Filter events based on search term and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                          (event.category && event.category.toLowerCase() === selectedCategory.toLowerCase());
    
    const matchesType = selectedType === 'all' || 
                       (event.type && event.type === selectedType);
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Categories for filter (extracted from existing events)
  const categories = ['all', ...Array.from(new Set(events
    .map(event => event.category?.toLowerCase())
    .filter(cat => cat !== undefined && cat !== null) as string[]
  ))];
  
  // Event types for filter (extracted from existing events)
  const eventTypes = ['all', ...Array.from(new Set(events
    .map(event => event.type)
    .filter(type => type !== undefined && type !== null) as string[]
  ))];

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
            
            {categories.length > 1 && (
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
            )}
            
            {eventTypes.length > 1 && (
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
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(event => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={event.image_url || 'https://via.placeholder.com/400x200?text=No+Image'} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardContent>
                  <div className="flex items-start mb-3">
                    <Calendar className="h-5 w-5 text-primary-600 mt-1 mr-2" />
                    <div>
                      <span className="text-primary-600 font-semibold">{formatEventDate(event.date)}</span>
                      <p className="text-gray-600 text-sm">{event.location}</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-primary-800">{event.title}</h3>
                  {event.category && (
                    <span className="inline-block bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3">
                      {event.category}
                    </span>
                  )}
                  <Link to={`/event/${event.id}`}>
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
                : "There are no upcoming events at the moment. Please check back later."}
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
      </Section>
    </>
  );
};

export default AllEvents;