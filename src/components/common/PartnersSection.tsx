import React from "react";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";

// Define partner interface
interface Partner {
  id: number;
  name: string;
  logo: string;
}

// Define component props interface
interface PartnersSectionProps {
  partners: Partner[];
}

const PartnersSection: React.FC<PartnersSectionProps> = ({ partners }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const cardWidth = isMobile ? 120 : 200;
  const gap = isMobile ? 8 : 16;
  const totalWidth = (cardWidth + gap) * partners.length;

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <motion.div
          className="text-center mb-12"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">
            Our Partners
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We collaborate with leading organizations to advance pediatric neurology care in East Africa.
          </p>
        </motion.div>

        <div className="relative overflow-hidden">
          <div className="flex items-center justify-start overflow-x-hidden">
            <motion.div
              className="flex gap-4 md:gap-6"
              animate={{
                x: [-totalWidth / 2, 0],
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
              {[...partners, ...partners].map((partner, index) => (
                <div
                  key={`${partner.id}-${index}`}
                  className="flex-shrink-0 bg-white rounded-lg shadow-card p-4 w-32 md:w-48 flex flex-col items-center justify-center"
                  style={{ 
                    width: cardWidth,
                    height: isMobile ? 100 : 160 
                  }}
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-12 md:h-16 w-auto mb-2 md:mb-4 object-contain"
                  />
                  <p className="text-xs md:text-sm text-gray-700 text-center font-medium">
                    {partner.name}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;