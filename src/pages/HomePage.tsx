import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLink, Calendar, Users, BookOpen } from "lucide-react";
import Section from "../components/common/Section";
import Button from "../components/common/Button";
import Card, { CardContent } from "../components/common/Card";
import heroImg from "../assets/hero.webp";
import Yvonne from "../assets/Dr. Yvonne Nyakeri.jpg";
import Sebunya from "../assets/Dr. Sebunya Robert.jpg";
import annImg from "../assets/Dr. Ann Kamunya.jpg";
import maureenImg from "../assets/Dr. Maureen Njoroge.jpg";
import supaImg from "../assets/Dr. Supa Tunje.jpg";
import cateImg from "../assets/Dr. Care Oyieke.jpg";
import EventsSection from "./EventsSection";

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const HomePage = () => {
  // Leadership Team
  const leaders = [
    {
      id: 1,
      name: "Dr. Yvonne Nyakeri",
      position: "Chairperson",
      image: Yvonne,
      //bio: "Pediatric Neurologist with over 15 years of experience specializing in epilepsy management in children.",
    },
    {
      id: 2,
      name: "Dr. Sebunya Robert",
      position: "Vice Chairperson",
      image: Sebunya,
      //bio: "Clinical researcher focused on neurodevelopmental disorders in East African children.",
    },
    {
      id: 3,
      name: "Dr. Ann Kamunya",
      position: "Secretary",
      image: annImg,
      //bio: "Specialist in pediatric neuromuscular disorders and advocacy for children with neurological disabilities.",
    },
    {
      id: 4,
      name: "Dr. Maureen Njoroge",
      position: "Vice Secretary",
      image: maureenImg,
      //bio: "Neurologist with expertise in neurorehabilitation and policy development for child neurological care.",
    },
    {
      id: 5,
      name: "Dr. Supa Tunje",
      position: "Treasurer",
      image: supaImg,
      //bio: "Neurologist with expertise in neurorehabilitation and policy development for child neurological care.",
    },
    {
      id: 6,
      name: "Dr. Cate Oyieke",
      position: "Vice Treasurer",
      image: cateImg,
      //bio: "Neurologist with expertise in neurorehabilitation and policy development for child neurological care.",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-primary-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={heroImg}
            alt="EACNA Hero Background"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ zIndex: 0 }}
          />
        </div>

        <div className="container-custom relative min-h-[90vh] flex flex-col justify-center items-center py-20 text-center">
          <motion.h1
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-6 max-w-4xl leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Advancing Child Neurology in East Africa through Collaboration,
            Education, and Advocacy.
          </motion.h1>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              size="lg"
              to="/membership"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Join EACNA Today
            </Button>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <Section background="white">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-primary-800">
              About EACNA
            </h2>
            <p className="text-gray-700 mb-6">
              The East African Child Neurology Association (EACNA) was
              established in 2022 by professionals involved in the care of
              children with neurological and developmental disorders in Kenya,
              Uganda, Tanzania, Burundi, South Sudan and Rwanda.
            </p>
            <p className="text-gray-700 mb-6">
              EACNA brings together experts in clinical care, research, and
              advocacy to improve paediatric neurological outcomes across the
              East African region. As the regional professional body for child
              neurology in East Africa, EACNA advocates for policies that
              enhance paediatric neurological care and provide education and
              resources for medical professionals.
            </p>
            <Button to="/about" className="bg-purple-600 hover:bg-purple-700">
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
              <p className="font-semibold" style={{ color: "white" }}>
                "We believe every child in East Africa deserves access to
                quality neurological care."
              </p>
              <style>{`.bg-accent-500 { background-color: rgb(82, 42, 127) !important; }`}</style>
            </div>
          </div>
        </div>
      </Section>

      {/* Events Section */}
      <EventsSection />

      {/* Leadership Section */}
      <Section className="py-16 bg-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl font-bold mb-4"
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
            >
              Executive Committee
            </motion.h2>
            <motion.p
              className="text-purple-200 max-w-2xl mx-auto"
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              transition={{ delay: 0.1 }}
            >
              The East African Child Neurology Association (EACNA) is guided by
              a diverse and experienced leadership team committed to advancing
              child neurology across the region.
            </motion.p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {leaders.map((leader) => (
              <motion.div
                key={leader.id}
                variants={itemVariants}
                className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 mb-4">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold">{leader.name}</h3>
                  <p className="text-purple-100 font-medium mb-2">
                    {leader.position}
                  </p>
                  {/* Uncomment if you want to include bios
                  <p className="text-white/90 mt-2">
                    {leader.bio}
                  </p> */}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="white" className="text-center text-primary-800">
        <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join EACNA today and be part of our mission to improve neurological
          care for children in East Africa.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            size="lg"
            to="/membership"
            className="bg-purple-600 hover:bg-purple-700"
          >
            Join EACNA Today
          </Button>
        </div>
      </Section>
    </>
  );
};

export default HomePage;
