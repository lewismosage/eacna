import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Book, Link as LinkIcon, Download, ExternalLink, Play } from 'lucide-react';
import Section from '../../components/common/Section';
import Button from '../../components/common/Button';
import Card, { CardContent } from '../../components/common/Card';

const ResourcesPage = () => {
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

  // Publications
  const publications = [
    {
      id: 1,
      title: "Epilepsy Management Guidelines for East Africa",
      authors: "Njeri S, Omondi B, et al.",
      journal: "East African Medical Journal",
      year: "2023",
      link: "/read-publication/:1"
    },
    {
      id: 2,
      title: "Prevalence of Neurodevelopmental Disorders in Eastern Africa: A Systematic Review",
      authors: "Mueni F, Kimathi L, et al.",
      journal: "Journal of Child Neurology",
      year: "2022",
      link: "/read-publication/:2"
    },
    {
      id: 3,
      title: "Challenges in Diagnosing Pediatric Epilepsy in Resource-Limited Settings",
      authors: "Mwangi L, Njeri S, et al.",
      journal: "Seizure: European Journal of Epilepsy",
      year: "2023",
      link: "/read-publication/:3"
    },
    {
      id: 4,
      title: "Training Needs Assessment for Pediatric Neurology in East Africa",
      authors: "Omondi B, Mueni F, et al.",
      journal: "Annals of Global Health",
      year: "2022",
      link: "/read-publication/:4"
    }
  ];

  // Clinical Resources
  const clinicalResources = [
    {
      id: 1,
      title: "East African Pediatric Neurology Handbook",
      type: "Clinical Guide",
      description: "A comprehensive guide to diagnosis and management of common pediatric neurological disorders in East Africa.",
      icon: <Book className="h-6 w-6" />
    },
    {
      id: 2,
      title: "Epilepsy Management Protocol",
      type: "Protocol",
      description: "Step-by-step protocol for managing epilepsy in resource-limited settings.",
      icon: <FileText className="h-6 w-6" />
    },
    {
      id: 3,
      title: "Pediatric Neurodevelopmental Disorder Assessment Tools",
      type: "Assessment Tools",
      description: "Validated assessment tools for screening and diagnosing neurodevelopmental disorders.",
      icon: <FileText className="h-6 w-6" />
    },
    {
      id: 4,
      title: "Telemedicine Guide for Pediatric Neurology",
      type: "Guide",
      description: "Best practices for remote consultation and follow-up of pediatric neurology patients.",
      icon: <LinkIcon className="h-6 w-6" />
    }
  ];

  // Educational Videos
  const videos = [
    {
      id: 1,
      title: "Pediatric Seizure Recognition and Management",
      duration: "45 min",
      thumbnail: "https://images.pexels.com/photos/8942991/pexels-photo-8942991.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: 2,
      title: "Neurological Examination in Children",
      duration: "30 min",
      thumbnail: "https://images.pexels.com/photos/4226122/pexels-photo-4226122.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: 3,
      title: "Developmental Milestones Assessment",
      duration: "35 min",
      thumbnail: "https://images.pexels.com/photos/6823802/pexels-photo-6823802.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-primary-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-700 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/159670/brain-cage-think-outside-the-159670.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center mix-blend-overlay"></div>
        </div>
        
        <div className="container-custom relative py-20 lg:py-28">
          <motion.h1 
            className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            Resources & Publications
          </motion.h1>
          
          <motion.p 
            className="text-lg max-w-2xl mb-8 text-white/90"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            Access the latest research, clinical guidelines, educational materials, and publications 
            in pediatric neurology.
          </motion.p>
        </div>
      </section>
      
      {/* Publications Section */}
      <Section>
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">Latest Publications</h2>
            <p className="text-gray-700 mb-6">
              Explore the latest research papers, case studies, and publications from EACNA members and partners 
              in the field of pediatric neurology.
            </p>

            <Link to={`/all-publications`}>
            <Button variant="primary">
              View All Publications
            </Button>
            </Link>
          </div>
          
          <div className="lg:col-span-2">
            <motion.div 
              className="space-y-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {publications.map((publication) => (
                <motion.div 
                  key={publication.id}
                  variants={fadeIn}
                  className="bg-white rounded-lg shadow-card p-5 hover:shadow-card-hover transition-shadow duration-300"
                >
                  <h3 className="text-lg font-semibold mb-2 text-primary-800">{publication.title}</h3>
                  <p className="text-gray-600 mb-2">{publication.authors}</p>
                  <p className="text-gray-500 text-sm mb-3">{publication.journal}, {publication.year}</p>
                  <a 
                    href={publication.link}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Read Paper <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </Section>
      
      {/* Clinical Resources */}
      <Section background="light">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">Clinical Resources</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Evidence-based tools and guidelines for clinical practice in pediatric neurology designed for 
            the East African context.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clinicalResources.map((resource) => (
            <Card key={resource.id}>
              <CardContent>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    {resource.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1 text-primary-800 text-center">{resource.title}</h3>
                <p className="text-secondary-600 text-sm text-center mb-3">{resource.type}</p>
                <p className="text-gray-600 text-sm mb-4 text-center">{resource.description}</p>
                <div className="flex justify-center">
                  <Button variant="outline" size="sm">
                    <Download className="mr-1 h-4 w-4" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button variant="secondary">View All Resources</Button>
        </div>
      </Section>
      
      {/* Educational Videos */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">Educational Videos</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Watch instructional videos on various topics in pediatric neurology, created specifically for 
            healthcare professionals in East Africa.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="relative">
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <button className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center transition-transform hover:scale-110">
                    <Play className="h-5 w-5 text-primary-700 ml-1" />
                  </button>
                </div>
                <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs font-medium py-1 px-2 rounded">
                  {video.duration}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-primary-800">{video.title}</h3>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button variant="primary">View All Videos</Button>
        </div>
      </Section>
      
      {/* Additional Resources */}
      <Section background="light">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-primary-800">Recommended Reading</h2>
            <ul className="space-y-4">
              <li className="flex">
                <Book className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1 mr-3" />
                <div>
                  <h3 className="font-semibold">Pediatric Neurology Principles & Practice, 6th Edition</h3>
                  <p className="text-gray-600 text-sm">Kenneth F. Swaiman, et al.</p>
                </div>
              </li>
              <li className="flex">
                <Book className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1 mr-3" />
                <div>
                  <h3 className="font-semibold">Volpe's Neurology of the Newborn, 6th Edition</h3>
                  <p className="text-gray-600 text-sm">Joseph J. Volpe, et al.</p>
                </div>
              </li>
              <li className="flex">
                <Book className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1 mr-3" />
                <div>
                  <h3 className="font-semibold">Pediatric Epilepsy: Diagnosis and Therapy, 4th Edition</h3>
                  <p className="text-gray-600 text-sm">John M. Pellock, et al.</p>
                </div>
              </li>
              <li className="flex">
                <Book className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1 mr-3" />
                <div>
                  <h3 className="font-semibold">Clinical Neurophysiology in Pediatrics</h3>
                  <p className="text-gray-600 text-sm">Gloria Galloway, et al.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6 text-primary-800">Useful Links</h2>
            <ul className="space-y-4">
              <li className="flex">
                <LinkIcon className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1 mr-3" />
                <div>
                  <a href="#" className="font-semibold text-primary-700 hover:underline">World Health Organization (WHO) - Neurological Disorders</a>
                  <p className="text-gray-600 text-sm">Resources on neurological disorders affecting children globally</p>
                </div>
              </li>
              <li className="flex">
                <LinkIcon className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1 mr-3" />
                <div>
                  <a href="#" className="font-semibold text-primary-700 hover:underline">International League Against Epilepsy (ILAE)</a>
                  <p className="text-gray-600 text-sm">Resources and guidelines for epilepsy management</p>
                </div>
              </li>
              <li className="flex">
                <LinkIcon className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1 mr-3" />
                <div>
                  <a href="#" className="font-semibold text-primary-700 hover:underline">Child Neurology Foundation</a>
                  <p className="text-gray-600 text-sm">Educational resources for healthcare providers and families</p>
                </div>
              </li>
              <li className="flex">
                <LinkIcon className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1 mr-3" />
                <div>
                  <a href="#" className="font-semibold text-primary-700 hover:underline">African Child Neurology Association</a>
                  <p className="text-gray-600 text-sm">Collaborative platform for child neurology professionals across Africa</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
};

export default ResourcesPage;