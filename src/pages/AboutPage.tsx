import { motion } from 'framer-motion';
import { ShieldCheck, Users, Scale, GraduationCap, Lightbulb } from 'lucide-react';
import Section from '../components/common/Section';
import Button from '../components/common/Button';
import OurReach from '../components/common/OurReach';
import ACNA from "../assets/ACNA.jpg";
import ILAE from "../assets/ILAE.png";
import kpa from "../assets/kpa.jpg";
import BPNA from "../assets/BPNA.webp";
import gertrudes from "../assets/Gertrudes.webp";
import GHP from "../assets/GHP.png";


const AboutPage = () => {
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

  const partners = [
    {
      id: 1,
      name: "Kenya Pediatric Association (KPA)",
      logo: kpa,
    },
    {
      id: 2,
      name: "Gertrudes Children Hospital",
      logo: gertrudes,
    },
    {
      id: 3,
      name: "British Paediatric Neurology Association",
      logo: BPNA,
    },
    {
      id: 4,
      name: "Africa Child Neurology Association",
      logo: ACNA,
    },
    {
      id: 5,
      name: "Global Health Partnerships",
      logo: GHP,
    },
    {
      id: 6,
      name: "International League Against Epilepsy",
      logo: ILAE,
    },
  ];

  const values = [
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Excellence",
      description: "We strive for the highest standards in paediatric neurological care, research, and education."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Collaboration",
      description: "We foster partnerships and shared learning across borders, disciplines, and communities."
    },
    {
      icon: <Scale className="h-6 w-6" />,
      title: "Integrity",
      description: "We uphold honesty, transparency, and accountability in everything we do."
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Capacity Building",
      description: "We invest in developing skilled professionals to strengthen child neurology across East Africa."
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Innovation",
      description: "We embrace new ideas, technologies, and research to improve outcomes in child neurology."
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-primary-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-700 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-right mix-blend-overlay"></div>
        </div>
        
        <div className="container-custom relative py-20 lg:py-32">
          <motion.h1 
            className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            About EACNA
          </motion.h1>
          
          <motion.div 
            className="bg-white/10 backdrop-blur-sm p-6 rounded-lg max-w-3xl border border-white/20"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <p className="text-lg text-white/90">
              The East African Child Neurology Association (EACNA) brings together child neurologists, 
              developmental paediatricians, physicians, psychiatrists and allied professionals involved 
              in child neurological care through education, advocacy and collaboration.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Organization Info Section */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary-800">Our Organization</h2>
            <p className="text-gray-700 mb-4">
              The East African Child Neurology Association (EACNA) brings together child neurologists, 
              developmental paediatricians, physicians, psychiatrists and allied professionals involved 
              in child neurological care through education, advocacy and collaboration.
            </p>
            <p className="text-gray-700 mb-6">
              Established in 2022, EACNA serves as the primary professional organization for those dedicated 
              to pediatric neurology across Kenya, Uganda, Tanzania, Burundi, South Sudan, and Rwanda.
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-primary-700">Our Mandate</h3>
            <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
              <li>Supporting capacity development in child neurology care in the East African region.</li>
              <li>Supporting research in paediatric neurology.</li>
              <li>Advocating better health policies for children with neurological conditions.</li>
              <li>Connecting professionals for shared learning and partnerships.</li>
              <li>Raising awareness on childhood neurological disorders in East Africa.</li>
            </ul>
            
            <Button variant="primary" to="/membership">
              Join Our Association
            </Button>
          </div>
          
          <div className="relative">
          <img 
              src="https://www.shutterstock.com/image-photo/pediatrician-doctor-consulting-black-kid-600nw-2197738017.jpg" 
              alt="Pediatrician consulting child" 
              className="rounded-lg shadow-xl w-full h-auto"
            />
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-xs">
              <p className="text-sm md:text-base text-primary-700 font-medium">
                "Our goal is to build a network of skilled professionals across East Africa to address the unique 
                neurological needs of children in our region."
              </p>
            </div>
          </div>
        </div>
      </Section>
      
      {/* Values Section */}
      <Section background="light">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">Our Core Values</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            These principles guide our work and define our commitment to improving neurological care for children across East Africa.
          </p>
        </div>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {values.map((value, index) => (
            <motion.div 
              key={index}
              variants={fadeIn}
              className="bg-white rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4 text-primary-600">
                {value.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary-800">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>
      
      {/* Partners Section - Horizontal Scrolling */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">Our Partners</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We collaborate with leading healthcare institutions, associations, and organizations across East Africa.
          </p>
        </div>
        
        <div className="relative overflow-hidden py-4">
          <motion.div
            className="flex"
            animate={{
              x: [0, -1000],
              transition: {
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              },
            }}
          >
            {/* Duplicate the partners array to create seamless loop */}
            {[...partners, ...partners].map((partner, index) => (
              <div 
                key={`${partner.id}-${index}`}
                className="flex-shrink-0 mx-4 w-40 h-32 flex flex-col items-center justify-center"
              >
                <div className="h-20 w-full flex items-center justify-center mb-2">
                  <img 
                    src={partner.logo} 
                    alt={partner.name} 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <p className="text-center text-sm text-gray-700">{partner.name}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </Section>
      
      {/* Our Reach Section - Replacing the CTA/Join Our Mission section */}
      <OurReach />
      
      {/* Add a small call to action at the bottom */}
      <div className="bg-primary-800 py-8 text-center text-white">
        <div className="container mx-auto px-4">
          <Button 
            variant="accent" 
            size="lg" 
            to="/membership"
            className="mx-auto"
          >
            Become a Member
          </Button>
        </div>
      </div>
    </>
  );
};

export default AboutPage;