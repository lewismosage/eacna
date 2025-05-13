import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ExternalLink, Download, BookOpen, ArrowLeft } from 'lucide-react';
import Section from '../components/common/Section';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

const AllPublicationsPage = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Sample publications data
  const allPublications = [
    {
      id: 1,
      title: "Epilepsy Management Guidelines for East Africa",
      authors: "Njeri S, Omondi B, et al.",
      journal: "East African Medical Journal",
      year: "2023",
      abstract: "This paper presents comprehensive guidelines for the management of epilepsy in East Africa, considering local resources and challenges. The guidelines provide practical approaches to diagnosis, treatment, and follow-up care.",
      topics: ["Epilepsy", "Clinical Guidelines", "Treatment"],
      link: "/read-publication/:1"
    },
    {
      id: 2,
      title: "Prevalence of Neurodevelopmental Disorders in Eastern Africa: A Systematic Review",
      authors: "Mueni F, Kimathi L, et al.",
      journal: "Journal of Child Neurology",
      year: "2022",
      abstract: "This systematic review examines the prevalence of various neurodevelopmental disorders across Eastern Africa. The study analyzes data from multiple countries and identifies patterns, risk factors, and gaps in current knowledge.",
      topics: ["Neurodevelopmental Disorders", "Epidemiology", "Systematic Review"],
      link: "/read-publication/2"
    },
    {
      id: 3,
      title: "Challenges in Diagnosing Pediatric Epilepsy in Resource-Limited Settings",
      authors: "Mwangi L, Njeri S, et al.",
      journal: "Seizure: European Journal of Epilepsy",
      year: "2023",
      abstract: "This paper explores the various challenges faced by healthcare providers in diagnosing pediatric epilepsy in resource-limited settings across East Africa. It highlights innovative approaches and workarounds developed by local practitioners.",
      topics: ["Epilepsy", "Diagnosis", "Resource-Limited Settings"],
      link: "/read-publication/3"
    },
    {
      id: 4,
      title: "Training Needs Assessment for Pediatric Neurology in East Africa",
      authors: "Omondi B, Mueni F, et al.",
      journal: "Annals of Global Health",
      year: "2022",
      abstract: "This study assesses the training needs for pediatric neurology professionals across East Africa. It identifies key gaps in knowledge and skills, and proposes a framework for improving training programs in the region.",
      topics: ["Medical Education", "Capacity Building", "Training Assessment"],
      link: "/read-publication/4"
    },
    {
      id: 5,
      title: "Cerebral Malaria and Long-term Neurodevelopmental Outcomes in East African Children",
      authors: "Kimathi L, Wanjala P, et al.",
      journal: "Malaria Journal",
      year: "2023",
      abstract: "This longitudinal study examines the long-term neurodevelopmental outcomes in East African children who recovered from cerebral malaria. It provides insights into cognitive, behavioral, and neurological sequelae.",
      topics: ["Cerebral Malaria", "Neurodevelopment", "Long-term Outcomes"],
      link: "/read-publication/5"
    },
    {
      id: 6,
      title: "Access to Antiepileptic Drugs in Rural East Africa: A Multi-Country Study",
      authors: "Wanjala P, Omondi B, et al.",
      journal: "Epilepsy & Behavior",
      year: "2023",
      abstract: "This multi-country study explores the availability, affordability, and quality of antiepileptic drugs in rural areas of East Africa. It highlights disparities in access and proposes strategies to improve drug supply chains.",
      topics: ["Epilepsy", "Drug Access", "Rural Healthcare"],
      link: "/read-publication/6"
    },
    {
      id: 7,
      title: "Neuroimaging in Pediatric Neurology: Adapting Practices for Resource-Limited Settings",
      authors: "Njeri S, Mueni F, et al.",
      journal: "Journal of Neuroimaging",
      year: "2022",
      abstract: "This paper discusses practical approaches to neuroimaging in pediatric neurology within resource-limited settings. It provides guidance on optimizing the use of available imaging resources and interpreting results with limited technological support.",
      topics: ["Neuroimaging", "Resource-Limited Settings", "Diagnostic Techniques"],
      link: "/read-publication/7"
    },
    {
      id: 8,
      title: "Telemedicine for Pediatric Neurology in East Africa: Opportunities and Challenges",
      authors: "Mwangi L, Wanjala P, et al.",
      journal: "Telemedicine and e-Health",
      year: "2023",
      abstract: "This study examines the application of telemedicine in pediatric neurology across East Africa. It evaluates existing programs, identifies key challenges, and proposes a framework for implementing sustainable telemedicine services.",
      topics: ["Telemedicine", "Healthcare Access", "Digital Health"],
      link: "/read-publication/8"
    }
  ];

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [filterTopic, setFilterTopic] = useState('all');

  // Extract all unique years and topics for filters
  const years = [...new Set(allPublications.map(pub => pub.year))];
  const allTopics = [...new Set(allPublications.flatMap(pub => pub.topics))];

  // Filtered publications
  const filteredPublications = allPublications.filter(pub => {
    const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pub.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pub.abstract.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = filterYear === 'all' || pub.year === filterYear;
    const matchesTopic = filterTopic === 'all' || pub.topics.includes(filterTopic);
    
    return matchesSearch && matchesYear && matchesTopic;
  });

  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary-800 text-white py-16">
        <div className="container-custom">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-4"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            Publications
          </motion.h1>
          
          <motion.p 
            className="text-lg max-w-2xl mb-6 text-white/90"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            Explore the latest research papers, case studies, and publications from EACNA members and partners 
            in the field of pediatric neurology.
          </motion.p>
        </div>
      </section>
      
      {/* Search & Filter Section */}
      <Section background="light">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Search */}
          <div className="w-full md:w-1/2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search publications..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Filters */}
          <div className="w-full md:w-1/2 flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Year</label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="all">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Topic</label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                >
                  <option value="all">All Topics</option>
                  {allTopics.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </Section>
      
      {/* Publications List */}
      <Section>
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary-800">
            {filteredPublications.length} {filteredPublications.length === 1 ? 'Publication' : 'Publications'} Found
          </h2>
        </div>
        
        <motion.div 
          className="space-y-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filteredPublications.length > 0 ? (
            filteredPublications.map((publication) => (
              <motion.div 
                key={publication.id}
                variants={fadeIn}
                className="bg-white rounded-lg shadow-card p-6 hover:shadow-card-hover transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold mb-2 text-primary-800">{publication.title}</h3>
                <p className="text-gray-600 mb-2">{publication.authors}</p>
                <p className="text-gray-500 text-sm mb-4">{publication.journal}, {publication.year}</p>
                
                <p className="text-gray-700 mb-4">{publication.abstract}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {publication.topics.map(topic => (
                    <span 
                      key={topic} 
                      className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <a 
                    href={publication.link}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <BookOpen className="mr-1 h-4 w-4" /> Read Paper
                  </a>
                  <a 
                    href="#"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Download className="mr-1 h-4 w-4" /> Download PDF
                  </a>
                  <a 
                    href="#"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <ExternalLink className="mr-1 h-4 w-4" /> View in Journal
                  </a>
                </div>
              </motion.div>
            ))
          ) : (
                            <div className="text-center py-16">
              <p className="text-xl text-gray-500">No publications found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setFilterYear('all');
                  setFilterTopic('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </motion.div>
        
        {/* Pagination */}
        {filteredPublications.length > 0 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="px-3">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="primary" size="sm" className="px-4">1</Button>
              <Button variant="outline" size="sm" className="px-4">2</Button>
              <Button variant="outline" size="sm" className="px-4">3</Button>
              <span className="px-2 text-gray-500">...</span>
              <Button variant="outline" size="sm" className="px-4">8</Button>
              <Button variant="outline" size="sm" className="px-3">
                <ArrowLeft className="h-4 w-4 transform rotate-180" />
              </Button>
            </nav>
          </div>
        )}
      </Section>
    </>
  );
};

export default AllPublicationsPage;