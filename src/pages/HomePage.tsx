import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Users, BookOpen } from 'lucide-react';
import Section from '../components/common/Section';
import Button from '../components/common/Button';
import Card, { CardContent } from '../components/common/Card';

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const HomePage = () => {
  // Leadership Team
  const leaders = [
    {
      id: 1,
      name: 'Dr. Samantha Njeri',
      position: 'President',
      image: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=600',
      bio: 'Pediatric Neurologist with over 15 years of experience specializing in epilepsy management in children.'
    },
    {
      id: 2,
      name: 'Dr. Benjamin Omondi',
      position: 'Vice President',
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=600',
      bio: 'Clinical researcher focused on neurodevelopmental disorders in East African children.'
    },
    {
      id: 3,
      name: 'Dr. Faith Mueni',
      position: 'Secretary General',
      image: 'https://images.pexels.com/photos/5214959/pexels-photo-5214959.jpeg?auto=compress&cs=tinysrgb&w=600',
      bio: 'Specialist in pediatric neuromuscular disorders and advocacy for children with neurological disabilities.'
    },
    {
      id: 4,
      name: 'Dr. Lawrence Mwangi',
      position: 'Treasurer',
      image: 'https://images.pexels.com/photos/5329163/pexels-photo-5329163.jpeg?auto=compress&cs=tinysrgb&w=600',
      bio: 'Neurologist with expertise in neurorehabilitation and policy development for child neurological care.'
    }
  ];

  // Partner logos
  const partners = [
    { id: 1, name: "Gertrude's Hospital", logo: "https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: 2, name: "Kenya Paediatric Association", logo: "https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: 3, name: "British Paediatric Neurology Association", logo: "https://images.pexels.com/photos/5407214/pexels-photo-5407214.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: 4, name: "Africa Child Neurology Association", logo: "https://images.pexels.com/photos/5407222/pexels-photo-5407222.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: 5, name: "Global Health Partnerships", logo: "https://images.pexels.com/photos/5407214/pexels-photo-5407214.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: 6, name: "International League Against Epilepsy", logo: "https://images.pexels.com/photos/5407222/pexels-photo-5407222.jpeg?auto=compress&cs=tinysrgb&w=600" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-primary-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-700 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center mix-blend-overlay"></div>
        </div>
        
        <div className="container-custom relative min-h-[90vh] flex flex-col justify-center items-center py-20 text-center">
          <motion.h1 
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-6 max-w-4xl leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Advancing Child Neurology in East Africa through Collaboration, Education, and Advocacy.
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl font-light max-w-2xl mb-10 text-primary-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join us as we enhance our profession to ensure quality paediatric neurology care
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button variant="accent" size="lg" to="/membership">
             Join EACNA Today
            </Button>
            <Button variant="outline" size="lg" to="/about" className="border-white text-white hover:bg-white hover:text-primary-800">
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <Section background="white">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-primary-800">About EACNA</h2>
            <p className="text-gray-700 mb-6">
              The East African Child Neurology Association (EACNA) was established in 2022 by professionals involved
              in the care of children with neurological and developmental disorders in Kenya, Uganda, Tanzania, 
              Burundi, South Sudan and Rwanda.
            </p>
            <p className="text-gray-700 mb-6">
              EACNA brings together experts in clinical care, research, and advocacy to improve paediatric 
              neurological outcomes across the East African region. As the regional professional body for 
              child neurology in East Africa, EACNA advocates for policies that enhance paediatric neurological 
              care and provide education and resources for medical professionals.
            </p>
            <Button variant="primary" to="/about">
              Read More About Us
            </Button>
          </div>
          <div className="relative h-full min-h-[400px]">
          <img 
            src="https://pikwizard.com/pw/medium/470c104ec96ab6f6283147eff9dfdd0c.jpg" 
            alt="Doctor examining a child patient at clinic" 
            className="rounded-lg shadow-xl object-cover h-full w-full"
           />
            <div className="absolute -bottom-6 -left-6 bg-accent-500 rounded-lg p-6 shadow-lg max-w-xs">
              <p className="text-primary-900 font-semibold">
                "We believe every child in East Africa deserves access to quality neurological care."
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Leadership Section */}
      <Section background="light">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-primary-800">Our Leadership</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The East African Child Neurology Association (EACNA) is guided by a diverse and experienced 
            leadership team committed to advancing child neurology across the region.
          </p>
        </div>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {leaders.map((leader) => (
            <motion.div key={leader.id} variants={itemVariants}>
              <Card>
                <div className="aspect-w-3 aspect-h-4 relative">
                  <img 
                    src={leader.image} 
                    alt={leader.name} 
                    className="w-full h-64 object-cover object-center"
                  />
                </div>
                <CardContent>
                  <h3 className="text-xl font-bold text-primary-800">{leader.name}</h3>
                  <p className="text-secondary-600 font-medium mb-2">{leader.position}</p>
                  <p className="text-gray-600 text-sm">{leader.bio}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Vision Section */}
      <Section background="primary" className="text-center">
        <h2 className="text-3xl font-bold mb-8">Our Vision</h2>
        <p className="text-xl max-w-3xl mx-auto leading-relaxed">
          To equip medical professionals across East Africa with the expertise and resources needed to ensure 
          every child receives the exceptional neurological care they deserve.
        </p>
      </Section>

      {/* Key Services Section */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-primary-800">What We Do</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            EACNA is committed to improving neurological care for children in East Africa through various initiatives and programs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardContent className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-100 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary-800">Training Programs</h3>
              <p className="text-gray-600 mb-4">
                Specialized training in pediatric neurology through PET courses, workshops, and annual conferences.
              </p>
              <Button variant="text" to="/training">
                Learn More
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-100 flex items-center justify-center">
                <Users className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary-800">Professional Network</h3>
              <p className="text-gray-600 mb-4">
                Connect with pediatric neurology experts across East Africa for collaboration and mentorship.
              </p>
              <Button variant="text" to="/membership">
                Join Us
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary-800">Resources & Research</h3>
              <p className="text-gray-600 mb-4">
                Access to latest research, clinical guidelines, and educational materials in pediatric neurology.
              </p>
              <Button variant="text" to="/resources">
                Explore Resources
              </Button>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="white" className="text-center text-primary-800">
        <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join EACNA today and be part of our mission to improve neurological care for children in East Africa.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            variant="accent" 
            size="lg" 
            to="/membership"
          >
            Join EACNA Today
          </Button>
          
        </div>
      </Section>
    </>
  );
};

export default HomePage;