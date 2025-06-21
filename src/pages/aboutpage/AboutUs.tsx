import { motion } from "framer-motion";
import {
  ShieldCheck,
  Users,
  Scale,
  GraduationCap,
  Lightbulb,
} from "lucide-react";
import Section from "../../components/common/Section";
import Button from "../../components/common/Button";
import OurReach from "./OurReach";
import ACNA from "../../assets/ACNA.jpg";
import ILAE from "../../assets/ILAE.png";
import kpa from "../../assets/kpa.jpg";
import BPNA from "../../assets/BPNA.webp";
import gertrudes from "../../assets/Gertrudes.webp";
import GHP from "../../assets/GHP.png";

const AboutPage = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const partners = [
    {
      id: 1,
      //name: "Kenya Pediatric Association",
      logo: kpa,
    },
    {
      id: 2,
      //name: "Gertrudes Children Hospital",
      logo: gertrudes,
    },
    {
      id: 3,
      //name: "British Paediatric Neurology Association",
      logo: BPNA,
    },
    {
      id: 4,
      name: "Africa Child Neurology Association",
      logo: ACNA,
    },
    {
      id: 5,
      //name: "Global Health Partnerships",
      logo: GHP,
    },
    {
      id: 6,
      //name: "International League Against Epilepsy",
      logo: ILAE,
    },
  ];

  const values = [
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Excellence",
      description:
        "We strive for the highest standards in paediatric neurological care, research, and education.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Collaboration",
      description:
        "We foster partnerships and shared learning across borders, disciplines, and communities.",
    },
    {
      icon: <Scale className="h-6 w-6" />,
      title: "Integrity",
      description:
        "We uphold honesty, transparency, and accountability in everything we do.",
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Capacity Building",
      description:
        "We invest in developing skilled professionals to strengthen child neurology across East Africa.",
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Innovation",
      description:
        "We embrace new ideas, technologies, and research to improve outcomes in child neurology.",
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* Organization Info Section */}
      <Section className="pt-16 pb-12">
        <div className="text-center mb-16">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4 text-primary-800"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            About EACNA
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            The East African Child Neurology Association brings together
            professionals dedicated to advancing pediatric neurological care.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-primary-800">
              Our Organization
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              The East African Child Neurology Association (EACNA) is a
              professional organization uniting child neurologists,
              developmental pediatricians, physicians, psychiatrists, and allied
              health professionals committed to improving neurological care for
              children across East Africa.
            </p>
            <p className="text-gray-700 mb-8 leading-relaxed">
              Established in 2022, EACNA serves as the primary professional body
              for pediatric neurology across Kenya, Uganda, Tanzania, Burundi,
              South Sudan, and Rwanda, working to elevate standards of care
              through education, research, and advocacy.
            </p>

            <Button
              variant="primary"
              to="/membership"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Join Our Association
            </Button>
          </div>

          <div className="relative h-full min-h-[400px]">
            <img
              src="https://www.shutterstock.com/image-photo/pediatrician-doctor-consulting-black-kid-600nw-2197738017.jpg"
              alt="Pediatrician consulting child"
              className="rounded-xl shadow-lg w-full h-full object-cover"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl max-w-xs border border-gray-100">
              <p className="text-primary-700 font-medium">
                "Our goal is to build a network of skilled professionals across
                East Africa to address the unique neurological needs of children
                in our region."
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Vision & Mission Section */}
      <Section className="py-16 bg-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vision Card */}
            <motion.div
              className="bg-white/10 p-8 rounded-xl backdrop-blur-sm border border-white/20"
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
                    <path d="M8.5 8.5v.01"></path>
                    <path d="M16 15.5v.01"></path>
                    <path d="M12 12v.01"></path>
                    <path d="M11 17v.01"></path>
                    <path d="M7 14v.01"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Our Vision</h3>
              </div>
              <p className="leading-relaxed">
                To be the leading force in transforming pediatric neurological
                care across East Africa, ensuring every child has access to
                world-class diagnosis, treatment, and support for neurological
                conditions.
              </p>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              className="bg-white/10 p-8 rounded-xl backdrop-blur-sm border border-white/20"
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Our Mission</h3>
              </div>
              <p className="leading-relaxed">
                To advance pediatric neurology in East Africa through
                professional development, research, advocacy, and collaboration,
                while improving access to quality care for children with
                neurological disorders.
              </p>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* Values Section */}
      <Section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Title Card */}
            <motion.div
              className="bg-[#f8f9fa] p-8 rounded-lg shadow-sm border border-gray-200"
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
            >
              <h2 className="text-3xl font-bold mb-6 text-primary-800">
                Our Values
              </h2>
              <p className="text-gray-600">
                The fundamental principles that guide our organization's work
                and culture.
              </p>
            </motion.div>

            {/* Value Cards */}
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                transition={{ delay: 0.1 * index }}
                className="bg-[#f8f9fa] p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mr-4 text-purple-600">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-primary-800 mt-2">
                    {value.title}
                  </h3>
                </div>
                <p className="text-gray-600 pl-16">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Partners Section */}
      <Section background="light" className="py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-primary-800">
            Our Partners
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We collaborate with leading organizations to advance pediatric
            neurology in East Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 h-48"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-32 max-w-full object-contain mb-4"
              />
              <p className="text-center text-gray-700 font-medium text-sm">
                {partner.name}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Our Reach Section */}
      <OurReach />
    </div>
  );
};

export default AboutPage;
