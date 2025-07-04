import React from "react";
import Section from "../../components/common/Section";
import { motion } from "framer-motion";
import ourReachImage from "../../assets/our-reach.png";

const OurReach = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const countries = [
    "Kenya",
    "Uganda",
    "Tanzania",
    "Burundi",
    "Rwanda",
    "South Sudan",
    "Ethiopia",
    "Somalia"
  ];

  return (
    <Section background="light" className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4 text-primary-800">
           Our Reach
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            EACNA serves the entire East African region with a growing network of professionals.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Countries List */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-8"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-2xl font-semibold mb-6 text-primary-700">
              Member Countries
            </h3>
            <ul className="space-y-3">
              {countries.map((country, index) => (
                <motion.li 
                  key={index}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <span className="w-3 h-3 rounded-full bg-purple-600 flex-shrink-0"></span>
                  <span className="text-lg text-gray-700">{country}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Map Image */}
          <motion.div
            className="rounded-xl overflow-hidden shadow-lg bg-white"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.3 }}
          >
            <div className="p-2">
              <img
                src={ourReachImage}
                alt="EACNA regional coverage map"
                className="w-full h-auto rounded-lg object-cover"
              />
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-center text-gray-600">
                Active in {countries.length} East African countries
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
};

export default OurReach;