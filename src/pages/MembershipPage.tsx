import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, BookOpen, Award, CheckCircle, Users, GraduationCap } from 'lucide-react';
import Section from '../components/common/Section';
import Button from '../components/common/Button';
import Accordion from '../components/common/Accordion';
import MembershipForm from './MembershipForm';
import PaymentComponent from './PaymentModal';

interface MembershipPageProps {
  setShowPaymentModal: (value: boolean) => void;
}
const MembershipPage = ({ setShowPaymentModal }: MembershipPageProps) => {
  const membershipCategories = [
    { 
      id: 'full',
      title: 'Full Membership',
      content: (
        <div>
          <h4 className="font-semibold mb-2">Eligibility:</h4>
          <p className="mb-4">
            Open to trained paediatric neurologists practicing in an EACNA member country. Members have full voting 
            rights in annual general meetings and elections. Certified members will revert to associate status if 
            certification currency expires or lapses.
          </p>
          <p><span className="font-semibold">Annual Fee:</span> KSH 15,000</p>
        </div>
      )
    },
    { 
      id: 'associate',
      title: 'Associate Membership',
      content: (
        <div>
          <h4 className="font-semibold mb-2">Eligibility:</h4>
          <p className="mb-4">
            Open to trainees in child neurology, practicing child neurologists outside the EACNA region, or 
            medical doctors/clinical scientists with an interest in pediatric neurology. Requires a reference 
            from an Ordinary Member. Associate members may serve in EACNA committees but do not have voting rights.
          </p>
          <p><span className="font-semibold">Annual Fee:</span> KSH 10,000</p>
        </div>
      )
    },
    { 
      id: 'student',
      title: 'Student Membership',
      content: (
        <div>
          <h4 className="font-semibold mb-2">Eligibility:</h4>
          <p className="mb-4">
            Open to medical students or neurology trainees with a demonstrated interest in pediatric neurology. 
            Requires proof of enrollment in a recognized medical or neurology training institution. Student members 
            do not have voting rights but can participate in EACNA activities and mentorship programs.
          </p>
          <p><span className="font-semibold">Annual Fee:</span> KSH 5,000</p>
        </div>
      )
    },
    { 
      id: 'institutional',
      title: 'Institutional Membership',
      content: (
        <div>
          <h4 className="font-semibold mb-2">Eligibility:</h4>
          <p className="mb-4">
            Open to universities, hospitals, research centers, and organizations actively engaged in pediatric 
            neurology research, education, or clinical practice. Institutional members may nominate representatives 
            to participate in EACNA activities but do not have voting rights.
          </p>
          <p><span className="font-semibold">Annual Fee:</span> KSH 5,000</p>
        </div>
      )
    },
    { 
      id: 'honorary',
      title: 'Honorary Membership',
      content: (
        <div>
          <h4 className="font-semibold mb-2">Eligibility:</h4>
          <p className="mb-4">
            Reserved for individuals who have made outstanding contributions to pediatric neurology or EACNA's mission. 
            Membership is granted by invitation only. Honorary members do not have voting rights but may serve as 
            advisors or advocates for the association.
          </p>
          <p><span className="font-semibold">Annual Fee:</span> No fee</p>
        </div>
      )
    }
  ];

  // Member benefits
  const benefits = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Access to Research & Knowledge",
      description: "Complimentary access to leading paediatric neurology journals and case-based learning platforms."
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Career Growth & Development",
      description: "Mentorship opportunities and professional development at every career stage."
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Scholarships & Research Support",
      description: "Support for research and learning through scholarships and sponsored programs."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Updates & Networking",
      description: "Quarterly e-newsletter and social media updates on the latest developments."
    }
  ];

  // FAQs
  const faqs = [
    { 
      id: 'faq1',
      title: 'Who can join EACNA?',
      content: <p>Any individual or institution involved or interested in child neurology within East Africa.</p>
    },
    { 
      id: 'faq2',
      title: 'What\'s the difference between full and associate membership?',
      content: <p>Full members are certified specialists; associates are allied health workers or professionals in related fields.</p>
    },
    { 
      id: 'faq3',
      title: 'How long does approval take?',
      content: <p>Typically, 5–7 working days after you complete application and payment.</p>
    },
    { 
      id: 'faq4',
      title: 'Can I change my membership type later?',
      content: <p>Yes, you can request an upgrade by submitting updated documents.</p>
    },
    { 
      id: 'faq5',
      title: 'How do I know which membership category I qualify for?',
      content: <p>We provide descriptions for each category on the membership category page. 
        If unsure, contact our Membership Team at admin@eacna.co.ke.</p>
    },
    { 
      id: 'faq6',
      title: 'Is membership open to professionals outside East Africa?',
      content: <p>Yes. While our primary focus is on East Africa, we welcome collaborators, 
        researchers, and pediatrics neurology advocates from across the globe.</p>
    },
    { 
      id: 'faq7',
      title: 'Can I apply for membership as a student?',
      content: <p>Yes, as long as you're enrolled in a recognized health or 
        medical training program, you’re eligible for student membership.</p>
    },
    { 
      id: 'faq8',
      title: 'How long is the membership valid?',
      content: <p>Membership is valid for one year from the date of approval and is renewable annually.</p>
    },
    { 
      id: 'faq9',
      title: 'Will I get a membership certificate?',
      content: <p>Yes, once your application is approved and payment confirmed, 
        you’ll receive an official EACNA membership certificate.</p>
    },
    { 
      id: 'faq10',
      title: 'Can institutions enroll multiple staff under one membership?',
      content: <p>Institutional membership includes benefits for multiple representatives. 
        Every individual, will be registered under the institution’s account.</p>
    },
    { 
      id: 'faq11',
      title: 'Can I cancel my membership and get a refund?',
      content: <p>We do not offer refunds once payment is made. 
        However, you may choose not to renew the following year.</p>
    },
    { 
      id: 'faq12',
      title: 'How do I pay for my membership?',
      content: <p>You can pay via mobile money (Mpesa), bank transfer, or card payment. Details are provided on the registration form.</p>
    }
  ];

  const handleFormComplete = (data: any) => {
    console.log('Form data:', data);
    // Handle form submission (send to API, etc.)
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-accent-500">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, #4A154B, #2E1A47, #1E3A8A)',
              opacity: 0.8,
            }}
          ></div>
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center mix-blend-overlay"></div>
        </div>

        <div className="container-custom relative py-20 lg:py-28">
          <motion.h1
            className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Join EACNA
          </motion.h1>
          <motion.p
            className="text-lg max-w-2xl mb-8 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            By joining our network, you become part of a community of paediatric neurologists, researchers, and allied
            health professionals dedicated to improving neurological care for children across East Africa.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button variant="primary" size="lg" href="#membership-form">
              Apply for Membership <UserPlus className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button variant="secondary" size="sm" href="renew-membership" className="mt-4">
              Renew Membership
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Membership Categories */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">Membership Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            EACNA offers various membership categories to accommodate professionals at different career stages and institutions.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion items={membershipCategories} />
        </div>
      </Section>

      {/* How to Join */}
      <Section background="light" id="membership-form">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">How to Join</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complete the membership application form for verification. Once verified, you can proceed with payment to finalize your membership.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute left-0 md:left-1/2 h-full w-px bg-gray-200 transform md:translate-x-0"></div>
            
            <div className="space-y-12">
              <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                <div className="md:col-span-2 md:text-right order-2 md:order-1">
                  <h3 className="text-lg font-semibold text-primary-700">Complete the Application</h3>
                  <p className="text-gray-600">Fill out the online membership application form with accurate personal and professional details.</p>
                </div>
                
                <div className="flex justify-center order-1 md:order-2">
                  <div className="relative w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold text-lg">
                    1
                  </div>
                </div>
                
                <div className="hidden md:block md:col-span-2 order-3"></div>
              </div>
              
              <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                <div className="hidden md:block md:col-span-2 order-1"></div>
                
                <div className="flex justify-center order-1 md:order-2">
                  <div className="relative w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold text-lg">
                    2
                  </div>
                </div>
                
                <div className="md:col-span-2 order-2 md:order-3">
                  <h3 className="text-lg font-semibold text-primary-700">Submit Supporting Documents</h3>
                  <p className="text-gray-600">Provide proof of qualifications or enrollment depending on your membership type.</p>
                </div>
              </div>
              
              <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                <div className="md:col-span-2 md:text-right order-2 md:order-1">
                  <h3 className="text-lg font-semibold text-primary-700">Application Review</h3>
                  <p className="text-gray-600">Our membership committee will review your application within 5 business days.</p>
                </div>
                
                <div className="flex justify-center order-1 md:order-2">
                  <div className="relative w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold text-lg">
                    3
                  </div>
                </div>
                
                <div className="hidden md:block md:col-span-2 order-3"></div>
              </div>
              
              <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                <div className="hidden md:block md:col-span-2 order-1"></div>
                
                <div className="flex justify-center order-1 md:order-2">
                  <div className="relative w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold text-lg">
                    4
                  </div>
                </div>
                
                <div className="md:col-span-2 order-2 md:order-3">
                  <h3 className="text-lg font-semibold text-primary-700">Payment Processing</h3>
                  <p className="text-gray-600">Once approved, complete the payment to activate your membership.</p>
                </div>
              </div>
              
              <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                <div className="md:col-span-2 md:text-right order-2 md:order-1">
                  <h3 className="text-lg font-semibold text-primary-700">Welcome to EACNA!</h3>
                  <p className="text-gray-600">Receive your membership confirmation and begin accessing member benefits.</p>
                </div>
                
                <div className="flex justify-center order-1 md:order-2">
                  <div className="relative w-10 h-10 rounded-full bg-accent-500 text-primary-900 flex items-center justify-center font-semibold text-lg">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
                
                <div className="hidden md:block md:col-span-2 order-3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Membership Form */}
        <div className="max-w-3xl mx-auto">
          <MembershipForm onComplete={handleFormComplete} />
        </div>
        {/* Payment modal */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Your application must be approved before payment can be processed.</p>
          <Button 
            variant="outline" 
            onClick={() => setShowPaymentModal(true)}
          >
            Proceed to Payment
          </Button>
        </div>
      </Section>

      {/* Member Benefits */}
      <Section className="bg-teal-800 text-white !bg-teal-800">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Member Benefits</h2>
          <p className="text-white/90 max-w-2xl mx-auto">
            As a member of EACNA, you gain access to a wide range of opportunities...
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 hover:bg-white/20 transition-all"
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 text-white">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-white/80">{benefit.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQs */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about EACNA membership.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion items={faqs} />
        </div>
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Need more information?</p>
          <Button variant="outline" href="mailto:admin@eacna.co.ke">
            Contact Membership Services
          </Button>
        </div>
      </Section>
    </>
  );
};

export default MembershipPage;