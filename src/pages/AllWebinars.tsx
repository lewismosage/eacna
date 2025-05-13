// src/pages/AllWebinars.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Video, Search, Filter, Play, Clock, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Section from '../components/common/Section';
import Button from '../components/common/Button';

interface Webinar {
  id: number;
  title: string;
  date: string;
  status: 'upcoming' | 'past';
  duration: string;
  speakers: {
    name: string;
    title: string;
    image?: string;
  }[];
  description: string;
  topics?: string[];
  recordingUrl?: string;
  slidesUrl?: string;
  registrationLink?: string;
  thumbnail: string;
  tags?: string[];
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
    // In a real application, this would be an API call
    const fetchWebinars = async () => {
      try {
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock webinars data
        const webinarsData: Webinar[] = [
          {
            id: 1,
            title: "Management of Status Epilepticus in Children",
            date: "July 15, 2024",
            status: 'upcoming',
            duration: "1.5 hours",
            speakers: [
              { name: "Dr. Sarah Kimani", title: "Pediatric Neurologist, EACNA President" },
              { name: "Dr. James Mwangi", title: "Head of Neurology, Gertrude's Children's Hospital" }
            ],
            description: "This webinar will cover the latest guidelines and practical approaches to managing status epilepticus in children, with a focus on resource-limited settings in East Africa.",
            topics: ["Status epilepticus protocol", "Treatment alternatives", "Follow-up care"],
            registrationLink: "/register/webinar/status-epilepticus",
            thumbnail: "https://images.pexels.com/photos/3259624/pexels-photo-3259624.jpeg?auto=compress&cs=tinysrgb&w=600",
            tags: ["epilepsy", "emergency", "treatment"]
          },
          {
            id: 2,
            title: "Neurodevelopmental Outcomes in Children with Epilepsy",
            date: "August 12, 2024",
            status: 'upcoming',
            duration: "2 hours",
            speakers: [
              { name: "Dr. Rebecca Ouma", title: "Pediatric Neurologist, Kenyatta National Hospital" },
              { name: "Dr. Thomas Ngwiri", title: "Pediatric Neurology Fellow" }
            ],
            description: "This webinar will explore the latest research on neurodevelopmental outcomes in children with epilepsy and strategies for optimizing developmental outcomes.",
            topics: ["Cognitive impact of seizures", "Educational interventions", "Assessment tools"],
            registrationLink: "/register/webinar/neurodevelopmental-outcomes",
            thumbnail: "https://images.pexels.com/photos/3905764/pexels-photo-3905764.jpeg?auto=compress&cs=tinysrgb&w=600",
            tags: ["epilepsy", "neurodevelopment", "education"]
          },
          {
            id: 3,
            title: "Advances in Pediatric Epilepsy Surgery",
            date: "June 20, 2024",
            status: 'past',
            duration: "1.5 hours",
            speakers: [
              { name: "Prof. David Kariuki", title: "Neurosurgeon, University of Nairobi" },
              { name: "Dr. Florence Musubika", title: "EACNA Vice President" }
            ],
            description: "This webinar presented the latest advances in pediatric epilepsy surgery, including patient selection, pre-surgical evaluation, and surgical techniques.",
            topics: ["Surgical candidacy", "Pre-surgical workup", "Surgical techniques", "Post-operative care"],
            recordingUrl: "/webinars/recordings/epilepsy-surgery-2024",
            slidesUrl: "/webinars/slides/epilepsy-surgery-2024.pdf",
            thumbnail: "https://images.pexels.com/photos/4226256/pexels-photo-4226256.jpeg?auto=compress&cs=tinysrgb&w=600",
            tags: ["epilepsy", "surgery", "treatment"]
          },
          {
            id: 4,
            title: "Diagnosis and Management of Pediatric Headache",
            date: "May 10, 2024",
            status: 'past',
            duration: "1 hour",
            speakers: [
              { name: "Dr. Emmanuel Tusiime", title: "Head of Pediatrics, Mulago Hospital" }
            ],
            description: "This webinar covered the differential diagnosis and management approaches for headache in children and adolescents.",
            topics: ["Migraine", "Tension headache", "Secondary headaches", "Treatment approaches"],
            recordingUrl: "/webinars/recordings/pediatric-headache-2024",
            slidesUrl: "/webinars/slides/pediatric-headache-2024.pdf",
            thumbnail: "https://images.pexels.com/photos/3807738/pexels-photo-3807738.jpeg?auto=compress&cs=tinysrgb&w=600",
            tags: ["headache", "migraine", "pain"]
          },
          {
            id: 5,
            title: "Autism Spectrum Disorder: Early Recognition and Intervention",
            date: "April 15, 2024",
            status: 'past',
            duration: "2 hours",
            speakers: [
              { name: "Dr. Janet Mbugua", title: "Developmental Pediatrician" },
              { name: "Ms. Ruth Kamau", title: "Occupational Therapist" }
            ],
            description: "This webinar focused on the early recognition of autism spectrum disorder and evidence-based intervention strategies applicable in low-resource settings.",
            topics: ["Early warning signs", "Screening tools", "Family-centered interventions"],
            recordingUrl: "/webinars/recordings/autism-2024",
            slidesUrl: "/webinars/slides/autism-2024.pdf",
            thumbnail: "https://images.pexels.com/photos/8942991/pexels-photo-8942991.jpeg?auto=compress&cs=tinysrgb&w=600",
            tags: ["autism", "neurodevelopment", "therapy"]
          },
          {
            id: 6,
            title: "Pediatric Stroke: Recognition and Management",
            date: "March 5, 2024",
            status: 'past',
            duration: "1.5 hours",
            speakers: [
              { name: "Dr. Samuel Githinji", title: "Pediatric Neurologist" },
              { name: "Dr. Mary Wairimu", title: "Pediatric Hematologist" }
            ],
            description: "This webinar addressed the challenges in recognizing pediatric stroke and discussed acute management and secondary prevention strategies.",
            topics: ["Risk factors", "Clinical presentation", "Diagnostic approach", "Treatment"],
            recordingUrl: "/webinars/recordings/pediatric-stroke-2024",
            slidesUrl: "/webinars/slides/pediatric-stroke-2024.pdf",
            thumbnail: "https://images.pexels.com/photos/4225920/pexels-photo-4225920.jpeg?auto=compress&cs=tinysrgb&w=600",
            tags: ["stroke", "vascular", "emergency"]
          },
          {
            id: 7,
            title: "Neuroimaging in Pediatric Neurology",
            date: "February 20, 2024",
            status: 'past',
            duration: "2 hours",
            speakers: [
              { name: "Dr. Robert Karanja", title: "Pediatric Radiologist" },
              { name: "Dr. Sarah Kimani", title: "Pediatric Neurologist, EACNA President" }
            ],
            description: "This webinar provided an overview of neuroimaging modalities in pediatric neurology, focusing on when to order which test and how to interpret basic findings.",
            topics: ["CT vs MRI", "Common pathologies", "Functional imaging", "Case studies"],
            recordingUrl: "/webinars/recordings/neuroimaging-2024",
            slidesUrl: "/webinars/slides/neuroimaging-2024.pdf",
            thumbnail: "https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg?auto=compress&cs=tinysrgb&w=600",
            tags: ["neuroimaging", "radiology", "MRI"]
          },
          {
            id: 8,
            title: "Management of Spasticity in Children",
            date: "January 15, 2024",
            status: 'past',
            duration: "1.5 hours",
            speakers: [
              { name: "Dr. Peter Ndirangu", title: "Pediatric Neurologist" },
              { name: "Ms. Elizabeth Wangari", title: "Physiotherapist" }
            ],
            description: "This webinar covered the assessment and management of spasticity in children with cerebral palsy and other neurological conditions.",
            topics: ["Assessment tools", "Physical therapy", "Medication options", "Surgical interventions"],
            recordingUrl: "/webinars/recordings/spasticity-2024",
            slidesUrl: "/webinars/slides/spasticity-2024.pdf",
            thumbnail: "https://images.pexels.com/photos/8942855/pexels-photo-8942855.jpeg?auto=compress&cs=tinysrgb&w=600",
            tags: ["spasticity", "cerebral palsy", "therapy"]
          }
        ];
        
        setWebinars(webinarsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching webinars:", error);
        setLoading(false);
      }
    };

    fetchWebinars();
  }, []);

  // Filter webinars based on search term, status, and tag
  const filteredWebinars = webinars.filter(webinar => {
    const matchesSearch = webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          webinar.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          webinar.speakers.some(speaker => speaker.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || webinar.status === selectedStatus;
    
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
                {currentWebinars.map((webinar) => (
                  <div 
                    key={webinar.id} 
                    className="bg-white rounded-lg shadow-card overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative">
                      <img 
                        src={webinar.thumbnail} 
                        alt={webinar.title} 
                        className="w-full h-48 object-cover"
                      />
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                        webinar.status === 'upcoming' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {webinar.status === 'upcoming' ? 'Upcoming' : 'Recording Available'}
                      </div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-center text-gray-500 text-sm mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{webinar.date}</span>
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{webinar.duration}</span>
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
                        {webinar.status === 'upcoming' ? (
                          <Link 
                            to={webinar.registrationLink || '#'} 
                            className="inline-flex items-center justify-center w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                          >
                            Register Now
                          </Link>
                        ) : (
                          <div className="flex space-x-2">
                            <Link 
                              to={webinar.recordingUrl || '#'} 
                              className="inline-flex items-center justify-center flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-3 rounded-md transition-colors"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Watch
                            </Link>
                            {webinar.slidesUrl && (
                              <Link 
                                to={webinar.slidesUrl} 
                                className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-md transition-colors"
                              >
                                <Download className="h-4 w-4" />
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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