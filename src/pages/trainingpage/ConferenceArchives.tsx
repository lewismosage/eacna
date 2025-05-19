// src/pages/ConferenceArchives.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, MapPin, Users, Download, Search, ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Section from '../../components/common/Section';
import Button from '../../components/common/Button';

interface Conference {
  id: number;
  year: number;
  title: string;
  location: string;
  dates: string;
  theme: string;
  attendees?: number;
  keynoteSpeakers?: string[];
  description?: string;
  image?: string;
  proceedings?: string;
  presentations?: { title: string; presenter: string; link: string }[];
  photoGallery?: string;
}

const ConferenceArchives = () => {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [expandedConference, setExpandedConference] = useState<number | null>(null);

  useEffect(() => {
    // In a real application, this would be an API call
    const fetchConferences = async () => {
      try {
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock conferences data
        const conferencesData: Conference[] = [
          {
            id: 1,
            year: 2023,
            title: "3rd Annual EACNA Conference",
            location: "Kigali, Rwanda",
            dates: "December 5-7, 2023",
            theme: "Innovations in Pediatric Neurology: Research to Practice",
            attendees: 230,
            keynoteSpeakers: [
              "Prof. Michael Johnson, University College London",
              "Dr. Catherine Muthoni, Kenyatta National Hospital",
              "Prof. Richard Idro, Makerere University"
            ],
            description: "The 3rd Annual EACNA Conference brought together experts from across East Africa and beyond to share the latest research and best practices in pediatric neurology. The conference focused on translating research findings into clinical practice in resource-limited settings.",
            image: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=600",
            proceedings: "/downloads/proceedings-2023.pdf",
            presentations: [
              { title: "Long-term Outcomes of Childhood Epilepsy Surgery", presenter: "Dr. James Kariuki", link: "/presentations/2023/kariuki-epilepsy-surgery.pdf" },
              { title: "Neuroimaging in Pediatric Epilepsy", presenter: "Dr. Sarah Musoke", link: "/presentations/2023/musoke-neuroimaging.pdf" },
              { title: "Neurodevelopmental Outcomes in Children with Sickle Cell Disease", presenter: "Dr. Emmanuel Tusiime", link: "/presentations/2023/tusiime-sickle-cell.pdf" }
            ],
            photoGallery: "/gallery/2023"
          },
          {
            id: 2,
            year: 2022,
            title: "2nd Annual EACNA Conference",
            location: "Dar es Salaam, Tanzania",
            dates: "November 10-12, 2022",
            theme: "Building Capacity in Pediatric Neurology Across East Africa",
            attendees: 185,
            keynoteSpeakers: [
              "Prof. Elizabeth Molyneux, University of Malawi",
              "Dr. Jo Wilmshurst, Red Cross Children's Hospital, South Africa",
              "Prof. Charles Newton, KEMRI-Wellcome Trust"
            ],
            description: "The 2nd Annual EACNA Conference focused on capacity building in pediatric neurology across the East African region. The conference included workshops on EEG interpretation, neuroimaging, and management of status epilepticus.",
            image: "https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?auto=compress&cs=tinysrgb&w=600",
            proceedings: "/downloads/proceedings-2022.pdf",
            presentations: [
              { title: "Training Models for Pediatric Neurology in Low-Resource Settings", presenter: "Dr. Florence Musubika", link: "/presentations/2022/musubika-training-models.pdf" },
              { title: "Epilepsy Management Guidelines for East Africa", presenter: "Dr. Thomas Ngwiri", link: "/presentations/2022/ngwiri-epilepsy-guidelines.pdf" },
              { title: "Telemedicine in Pediatric Neurology", presenter: "Dr. Rebecca Ouma", link: "/presentations/2022/ouma-telemedicine.pdf" }
            ],
            photoGallery: "/gallery/2022"
          },
          {
            id: 3,
            year: 2021,
            title: "Inaugural EACNA Conference",
            location: "Nairobi, Kenya",
            dates: "October 15-17, 2021",
            theme: "Collaborative Approaches to Child Neurology in East Africa",
            attendees: 150,
            keynoteSpeakers: [
              "Prof. Fenella Kirkham, UCL Institute of Child Health",
              "Dr. Sam Raimundo, World Health Organization",
              "Prof. Edward Kija, Muhimbili University of Health and Allied Sciences"
            ],
            description: "The Inaugural EACNA Conference marked the establishment of the East African Child Neurology Association. The conference focused on collaborative approaches to improving child neurology care across the region.",
            image: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=600",
            proceedings: "/downloads/proceedings-2021.pdf",
            presentations: [
              { title: "The Burden of Pediatric Neurological Disorders in East Africa", presenter: "Dr. Sarah Kimani", link: "/presentations/2021/kimani-burden.pdf" },
              { title: "Epilepsy Training Programs: Current Status and Future Directions", presenter: "Dr. James Mwangi", link: "/presentations/2021/mwangi-training.pdf" },
              { title: "EEG Services in East Africa: Challenges and Opportunities", presenter: "Prof. Elizabeth Odera", link: "/presentations/2021/odera-eeg-services.pdf" }
            ],
            photoGallery: "/gallery/2021"
          }
        ];
        
        setConferences(conferencesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching conferences:", error);
        setLoading(false);
      }
    };

    fetchConferences();
  }, []);

  // Filter conferences based on search term and selected year
  const filteredConferences = conferences.filter(conference => {
    const matchesSearch = conference.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         conference.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conference.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = selectedYear === 'all' || conference.year === selectedYear;
    
    return matchesSearch && matchesYear;
  });

  // Get unique years for filter
  const years = Array.from(new Set(conferences.map(conference => conference.year))).sort((a, b) => b - a);

  const toggleConferenceExpand = (id: number) => {
    if (expandedConference === id) {
      setExpandedConference(null);
    } else {
      setExpandedConference(id);
    }
  };

  return (
    <>
      <Section>
        <div className="mb-8">
          <Link to="/events" className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-800">Conference Archives</h1>
          <p className="text-gray-600 mt-4">
            Browse our past EACNA conferences, access presentations, proceedings, and other resources.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-card p-6 mb-10">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search conferences..."
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
                value={selectedYear === 'all' ? 'all' : selectedYear.toString()}
                onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              >
                <option value="all">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredConferences.length > 0 ? (
          <div className="space-y-8">
            {filteredConferences.map(conference => (
              <div key={conference.id} className="bg-white rounded-lg shadow-card overflow-hidden">
                <div className="grid md:grid-cols-3">
                  <div className="md:col-span-1">
                    {conference.image && (
                      <img 
                        src={conference.image} 
                        alt={conference.title} 
                        className="w-full h-full object-cover"
                        style={{ height: '100%', minHeight: '200px' }}
                      />
                    )}
                  </div>
                  <div className="md:col-span-2 p-6">
                    <div className="flex flex-wrap items-center justify-between mb-2">
                      <span className="bg-primary-100 text-primary-800 text-sm font-semibold px-3 py-1 rounded-full">
                        {conference.year}
                      </span>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Users className="h-4 w-4 mr-1" /> {conference.attendees} Attendees
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-primary-800 mb-2">{conference.title}</h2>
                    <div className="flex flex-wrap items-center text-gray-600 mb-4">
                      <div className="flex items-center mr-4 mb-2">
                        <Calendar className="h-4 w-4 mr-1" /> {conference.dates}
                      </div>
                      <div className="flex items-center mb-2">
                        <MapPin className="h-4 w-4 mr-1" /> {conference.location}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      <span className="font-semibold">Theme:</span> {conference.theme}
                    </p>
                    {(expandedConference === conference.id) && (
                      <div className="mt-4 space-y-4">
                        <p className="text-gray-700">{conference.description}</p>
                        
                        {conference.keynoteSpeakers && conference.keynoteSpeakers.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-gray-800">Keynote Speakers:</h3>
                            <ul className="list-disc ml-5 mt-2 text-gray-700">
                              {conference.keynoteSpeakers.map((speaker, index) => (
                                <li key={index}>{speaker}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {conference.presentations && conference.presentations.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-gray-800">Selected Presentations:</h3>
                            <ul className="mt-2 space-y-2">
                              {conference.presentations.map((presentation, index) => (
                                <li key={index} className="flex items-start">
                                  <ExternalLink className="h-4 w-4 text-primary-600 mt-1 mr-2 flex-shrink-0" />
                                  <div>
                                    <a 
                                      href={presentation.link} 
                                      className="text-primary-600 hover:text-primary-800 hover:underline"
                                    >
                                      {presentation.title}
                                    </a>
                                    <p className="text-gray-600 text-sm">{presentation.presenter}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-3 mt-4">
                          {conference.proceedings && (
                            <a href={conference.proceedings}>
                              <Button size="sm">
                                <Download className="mr-1 h-4 w-4" /> Proceedings
                              </Button>
                            </a>
                          )}
                          {conference.photoGallery && (
                            <a href={conference.photoGallery}>
                              <Button size="sm" variant="outline">
                                Photo Gallery
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="mt-4">
                      <Button 
                        variant="text" 
                        onClick={() => toggleConferenceExpand(conference.id)}
                      >
                        {expandedConference === conference.id ? 'Show Less' : 'Show More'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-card p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <BookOpen className="h-8 w-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Conferences Found</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchTerm || selectedYear !== 'all'
                ? "No conferences match your current search criteria. Please try adjusting your filters."
                : "There are no conference archives available at the moment. Please check back later."}
            </p>
            {(searchTerm || selectedYear !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedYear('all');
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

export default ConferenceArchives;