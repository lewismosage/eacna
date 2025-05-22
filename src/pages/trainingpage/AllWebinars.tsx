import React, { useState, useEffect } from 'react';
import { Calendar, Video, Search, Filter, Play, Clock, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Section from '../../components/common/Section';
import Button from '../../components/common/Button';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

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
  created_at: string;
  updated_at: string;
}

const AllWebinars = () => {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const webinarsPerPage = 6;

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('webinars')
        .select('*')
        .eq('status', 'published') // Only show published webinars
        .order('date', { ascending: true });

      if (error) throw error;
      setWebinars(data as Webinar[] || []);
    } catch (err) {
      console.error("Error fetching webinars:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatWebinarDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };

  // Format time range
  const formatTimeRange = (start: string, end: string) => {
    if (!start || !end) return '';
    return `${start} - ${end}`;
  };

  // Get webinar status (upcoming or past)
  const getWebinarStatus = (webinar: Webinar) => {
    const webinarDate = new Date(webinar.date);
    const today = new Date();
    return webinarDate >= today ? 'upcoming' : 'past';
  };

  // Filter webinars based on search term, status, and tag
  const filteredWebinars = webinars.filter(webinar => {
    const matchesSearch = webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         webinar.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webinar.speakers.some(speaker => speaker.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'upcoming' && getWebinarStatus(webinar) === 'upcoming') ||
                         (selectedStatus === 'past' && getWebinarStatus(webinar) === 'past');
    
    const matchesTag = selectedTag === 'all' || 
                      (webinar.tags && webinar.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase()));
    
    return matchesSearch && matchesStatus && matchesTag;
  });

  // Get unique tags for filter
  const tags = Array.from(
    new Set(webinars.flatMap(webinar => webinar.tags || []))
  ).sort();

  // Pagination
  const indexOfLastWebinar = currentPage * webinarsPerPage;
  const indexOfFirstWebinar = indexOfLastWebinar - webinarsPerPage;
  const currentWebinars = filteredWebinars.slice(indexOfFirstWebinar, indexOfLastWebinar);

  const totalPages = Math.ceil(filteredWebinars.length / webinarsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <>
      <Section>
        <div className="mb-8">
          <Link to="/events" className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-800">Webinars & Online Events</h1>
          <p className="text-gray-600 mt-4">
            Browse our upcoming and past webinars on topics in child neurology. Register for upcoming events 
            or access recordings of past sessions.
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
                placeholder="Search webinars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past Events</option>
              </select>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                value={selectedTag}
                onChange={(e) => {
                  setSelectedTag(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Topics</option>
                {tags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredWebinars.length} {filteredWebinars.length === 1 ? 'webinar' : 'webinars'}
              </p>
            </div>

            {/* Webinars Grid */}
            {filteredWebinars.length === 0 ? (
              <div className="bg-white rounded-lg shadow-card p-10 text-center">
                <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No webinars found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStatus('all');
                    setSelectedTag('all');
                  }}
                  variant="outline"
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {currentWebinars.map((webinar) => {
                  const status = getWebinarStatus(webinar);
                  return (
                    <div 
                      key={webinar.id} 
                      className="bg-white rounded-lg shadow-card overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="relative">
                        <img 
                          src={webinar.image_url || 'https://via.placeholder.com/400x200?text=No+Image'} 
                          alt={webinar.title} 
                          className="w-full h-48 object-cover"
                        />
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                          status === 'upcoming' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {status === 'upcoming' ? 'Upcoming' : 'Recording Available'}
                        </div>
                      </div>
                      
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center text-gray-500 text-sm mb-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatWebinarDate(webinar.date)}</span>
                          <span className="mx-2">•</span>
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{formatTimeRange(webinar.start_time, webinar.end_time)}</span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-primary-800 mb-2 line-clamp-2">
                          {webinar.title}
                        </h3>
                        
                        <div className="mb-3">
                          {webinar.speakers.map((speaker, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{speaker.name}</span>
                              {speaker.title && (
                                <span className="text-gray-600"> • {speaker.title}</span>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {webinar.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                          {webinar.tags?.map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="mt-2">
                          <Link 
                            to={`/webinar/${webinar.id}`} 
                            className="inline-flex items-center justify-center w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 mb-4">
                <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === number
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
};

export default AllWebinars;