// src/pages/TrainingPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, FileText, Download } from 'lucide-react';
import Section from '../../components/common/Section';
import Button from '../../components/common/Button';
import Accordion from '../../components/common/Accordion';
import EventsSection from '../../pages/trainingpage/EventsSection';

const TrainingPage = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  // PET Course descriptions for accordion
  const petCourses = [
    { 
      id: 'pet1',
      title: 'PET1',
      content: (
        <div>
          <p className="mb-4">
            A 1-day course recommended for all doctors and nurses who contribute to the initial or ongoing 
            care of a child experiencing paroxysmal disorders in the acute and community setting.
          </p>
          <p>
            This foundational course covers the basics of pediatric epilepsy diagnosis and management, 
            focusing on common presentations and first-line approaches.
          </p>
        </div>
      )
    },
    { 
      id: 'pet2',
      title: 'PET2',
      content: (
        <div>
          <p className="mb-4">
            A 2-day course that covers general aspects of epilepsy (history taking, differential diagnosis, 
            investigation etc) and concentrates on epilepsies in infants and young children.
          </p>
          <p>
            Recommended for all doctors and nurses who care for young children with epilepsies. This course 
            expands on PET1 with in-depth exploration of early childhood epilepsy syndromes.
          </p>
        </div>
      )
    },
    { 
      id: 'pet3',
      title: 'PET3',
      content: (
        <div>
          <p className="mb-4">
            A 2-day course concentrating on the epilepsies presenting in older children and adolescents and 
            transition to adult services.
          </p>
          <p>
            Recommended for all doctors and nurses who care for older children, adolescents and young adults with epilepsy. 
            This course addresses unique challenges in adolescent epilepsy and transition care.
          </p>
        </div>
      )
    },
    { 
      id: 'pet4ward',
      title: 'PET4ward',
      content: (
        <div>
          <p className="mb-4">
            The newly developed PET4ward course has been introduced to follow on from PET123 for those wishing to be kept 
            up to date with new and breaking topics in paediatric epilepsy.
          </p>
          <p>
            Anyone wishing to attend the PET4ward course must have attended the PET123 courses. This advanced course 
            covers cutting-edge developments and complex case management.
          </p>
        </div>
      )
    }
  ];

  
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-secondary-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary-900 to-secondary-700 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center mix-blend-overlay"></div>
        </div>
        
        <div className="container-custom relative py-20 lg:py-28">
          <motion.h1 
            className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            Training & Conferences
          </motion.h1>
          
          <motion.p 
            className="text-lg max-w-2xl mb-8 text-white/90"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            EACNA offers comprehensive training programs and educational events to enhance pediatric neurology 
            expertise across East Africa.
          </motion.p>
          
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <Button 
              variant="accent" 
              size="lg" 
              href="#upcoming-events"
            >
              View Upcoming Events
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* PET Courses Section */}
      <Section>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary-800">Paediatric Epilepsy Training (PET)</h2>
            <p className="text-gray-700 mb-4">
              Paediatric Epilepsy Training (PET) is a series of 1 and 2-day courses developed by the British Paediatric 
              Neurology Association (BPNA) in response to concerns about standards of care for children with epilepsy 
              in the UK.
            </p>
            <p className="text-gray-700 mb-4">
              PET has been running in the UK since 2005 and is now being established worldwide. It aims to improve the 
              diagnosis of epileptic and non-epileptic events; improve the standard of care; and raise awareness of 
              when to liaise with a Paediatric Neurologist, a children's epilepsy expert.
            </p>
            <p className="text-gray-700 mb-6">
              The International League Against Epilepsy (ILAE) endorses PET. The ILAE identified PET as an effective, 
              sustainable format to teach safe standard epilepsy practice to clinicians across all levels of healthcare.
            </p>
            
            <Button variant="primary" href="#pet-courses">
              Explore PET Courses
            </Button>
          </div>
          
          <div>
            <img 
              src="https://images.pexels.com/photos/5327584/pexels-photo-5327584.jpeg?auto=compress&cs=tinysrgb&w=600" 
              alt="Healthcare professionals in training" 
              className="rounded-lg shadow-xl w-full h-auto"
            />
          </div>
        </div>
      </Section>
      
      {/* PET Courses Details */}
      <Section background="light" id="pet-courses">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">PET Courses</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Each PET course is designed to build upon the previous one, providing a comprehensive education in 
            pediatric epilepsy management.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion items={petCourses} />
        </div>
        
        <div className="mt-12 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-primary-800">Course Format</h3>
          <p className="text-gray-700 mb-4">
            Each PET course has interactive large and small group sessions. There are many opportunities within 
            each course to consider difficult cases, share 'experience in the real world', and debate 'the evidence'. 
            The size of small groups is limited to 8 attendees, to ensure everyone is able to contribute and gain the 
            most from the learning experience.
          </p>
          <p className="text-gray-700">
            Each course has standardised course materials that are taught to the same high standard worldwide by a 
            trained local faculty of experienced paediatric neurologists and paediatricians with an expertise in 
            epilepsy. A course handbook is provided to attendees.
          </p>
        </div>
      </Section>
      
      {/* Imported Events Section */}
      <EventsSection />
      
      {/* Call for Abstracts */}
      <Section background="primary" className="bg-gradient-to-br from-primary-700 to-primary-800 text-white">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-3">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Call for Abstracts & Research Presentations</h2>
              <p className="text-lg mb-6 text-white/90">
                EACNA invites abstract submissions for the upcoming 4th Annual Conference in Nairobi, Kenya. 
                This is an excellent opportunity to showcase your research and connect with colleagues in the field.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="accent" 
                  size="lg" 
                  className="text-primary-900" 
                  href="#"
                >
                  Submit Your Abstract
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary-700"
                  href="#"
                >
                  Download Guidelines <Download className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="md:col-span-2 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-4">Key Dates</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <div className="bg-accent-500 text-primary-900 rounded-full p-1.5">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Abstract Submission Deadline</p>
                    <p className="text-white/80 text-sm">August 15, 2024</p>
                  </div>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="bg-accent-500 text-primary-900 rounded-full p-1.5">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Notification of Acceptance</p>
                    <p className="text-white/80 text-sm">September 1, 2024</p>
                  </div>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="bg-accent-500 text-primary-900 rounded-full p-1.5">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Early Registration Deadline</p>
                    <p className="text-white/80 text-sm">September 15, 2024</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </Section>
    </>
  );
};

export default TrainingPage;