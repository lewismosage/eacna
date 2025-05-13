import React from 'react';
import Section from '../common/Section';
import { motion } from 'framer-motion';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import { GeoJsonProperties, Geometry } from 'geojson';

interface Country {
  name: string;
  iso: string;
  coordinates: [number, number]; // Added coordinates for country labels
}

const OurReach = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  // List of countries in EACNA's network with coordinates for labels
  const countries: Country[] = [
    { name: "Kenya", iso: "KEN", coordinates: [36.8219, -1.2921] }, // Nairobi
    { name: "Uganda", iso: "UGA", coordinates: [32.5825, 0.3476] }, // Kampala
    { name: "Tanzania", iso: "TZA", coordinates: [39.2083, -6.7924] }, // Dar es Salaam
    { name: "Burundi", iso: "BDI", coordinates: [29.9189, -3.3614] }, // Bujumbura
    { name: "Ethiopia", iso: "ETH", coordinates: [38.7578, 9.0300] }, // Addis Ababa
    { name: "Somalia", iso: "SOM", coordinates: [45.3182, 2.0469] }, // Mogadishu
    { name: "South Sudan", iso: "SSD", coordinates: [31.5820, 4.85] }, // Juba
    { name: "Rwanda", iso: "RWA", coordinates: [30.0606, -1.9441] } // Kigali
  ];

  // Get all ISO codes as an array for easy checking
  const eastAfricanISOCodes = countries.map(country => country.iso);

  return (
    <Section background="light">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-10"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">OUR REACH</h2>
          <p className="text-gray-700 max-w-3xl mx-auto text-lg">
            EACNA connects child neurology professionals across East Africa, building a strong network that spans multiple countries, health facilities, and communities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div 
            className="bg-white rounded-lg shadow-card p-6"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-primary-700">Countries in our Network</h3>
            <ul className="grid grid-cols-2 gap-4">
              {countries.map((country, index) => (
                <li 
                  key={index} 
                  className="flex items-center text-gray-700"
                >
                  <span className="w-3 h-3 rounded-full bg-primary-600 mr-2"></span>
                  {country.name}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            className="rounded-lg overflow-hidden shadow-card"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 450,
                  center: [18, 5] // Centered on Africa
                }}
                style={{
                  width: "100%",
                  height: "auto"
                }}
              >
                <ZoomableGroup zoom={1}>
                  <Geographies 
                    geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"
                  >
                    {({ geographies }: { geographies: Array<{ properties: GeoJsonProperties; rsmKey: string; geometry: Geometry }> }) =>
                      geographies.map(geo => {
                        // Check if this country is in our East African list
                        const isEastAfrican = geo.properties?.ISO_A3 && eastAfricanISOCodes.includes(geo.properties.ISO_A3 as string);
                        
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={isEastAfrican ? "#3B82F6" : "#E5E7EB"}
                            stroke="#FFFFFF"
                            strokeWidth={0.5}
                            style={{
                              default: { outline: "none" },
                              hover: { 
                                fill: isEastAfrican ? "#2563EB" : "#D1D5DB",
                                outline: "none",
                                cursor: "pointer"
                              },
                              pressed: { outline: "none" }
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                  
                  {/* Add Markers for country labels */}
                  {countries.map((country, index) => (
                    <Marker key={index} coordinates={country.coordinates}>
                      <text
                        textAnchor="middle"
                        style={{
                          fontFamily: "Arial, sans-serif",
                          fontSize: 10,
                          fill: "#111827",
                          pointerEvents: "none"
                        }}
                      >
                        {country.name}
                      </text>
                    </Marker>
                  ))}
                </ZoomableGroup>
              </ComposableMap>
            </div>
            <div className="p-4 bg-white">
              <p className="text-sm text-gray-600 italic text-center">
                EACNA's presence across East African countries
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
};

export default OurReach;