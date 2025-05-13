import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import Section from '../components/common/Section';
import Button from '../components/common/Button';

const GalleryPage = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState('2024');
  
  const galleryYears = ['2024', '2023', '2022'];
  
  // Gallery images by year
  const galleryImages = {
    '2024': [
      { id: 1, src: 'https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', caption: 'Annual Conference Opening Ceremony' },
      { id: 2, src: 'https://images.pexels.com/photos/8942985/pexels-photo-8942985.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'PET Training Workshop' },
      { id: 3, src: 'https://images.pexels.com/photos/8942989/pexels-photo-8942989.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Leadership Committee Meeting' },
      { id: 4, src: 'https://images.pexels.com/photos/4226754/pexels-photo-4226754.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Research Presentation Session' },
      { id: 5, src: 'https://images.pexels.com/photos/8942991/pexels-photo-8942991.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Pediatric Neurology Symposium' },
      { id: 6, src: 'https://images.pexels.com/photos/3992933/pexels-photo-3992933.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Community Outreach Program' },
      { id: 7, src: 'https://images.pexels.com/photos/4226755/pexels-photo-4226755.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Award Ceremony' },
      { id: 8, src: 'https://images.pexels.com/photos/8942930/pexels-photo-8942930.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Networking Event' }
    ],
    '2023': [
      { id: 9, src: 'https://images.pexels.com/photos/8942938/pexels-photo-8942938.jpeg?auto=compress&cs=tinysrgb&w=600', caption: '2nd Annual Conference Opening' },
      { id: 10, src: 'https://images.pexels.com/photos/8942941/pexels-photo-8942941.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Epilepsy Training Workshop' },
      { id: 11, src: 'https://images.pexels.com/photos/4226218/pexels-photo-4226218.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Panel Discussion on Child Neurology' },
      { id: 12, src: 'https://images.pexels.com/photos/8942991/pexels-photo-8942991.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'PET Course Graduation' }
    ],
    '2022': [
      { id: 13, src: 'https://images.pexels.com/photos/3992939/pexels-photo-3992939.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Inaugural Conference' },
      { id: 14, src: 'https://images.pexels.com/photos/4226195/pexels-photo-4226195.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'First PET Training Session' },
      { id: 15, src: 'https://images.pexels.com/photos/8942985/pexels-photo-8942985.jpeg?auto=compress&cs=tinysrgb&w=600', caption: 'Founding Members Meeting' }
    ]
  };
  
  const currentImages = galleryImages[selectedYear as keyof typeof galleryImages] || [];
  
  const openLightbox = (src: string) => {
    setSelectedImage(src);
    document.body.style.overflow = 'hidden';
  };
  
  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };
  
  const fadeInStagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const fadeInItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-primary-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-700 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/5427671/pexels-photo-5427671.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center mix-blend-overlay"></div>
        </div>
        
        <div className="container-custom relative py-20 lg:py-28">
          <motion.h1 
            className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Photo Gallery
          </motion.h1>
          
          <motion.p 
            className="text-lg max-w-2xl mb-8 text-white/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Browse through our collection of photos from EACNA events, conferences, and community outreach 
            programs throughout the years.
          </motion.p>
        </div>
      </section>
      
      {/* Gallery Filter */}
      <Section>
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {galleryYears.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                className={`px-6 py-2 text-sm font-medium ${
                  selectedYear === year 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-700 hover:text-primary-700 hover:bg-gray-50'
                } border border-gray-200 focus:z-10 focus:ring-2 focus:ring-primary-500 focus:text-primary-700 ${
                  year === galleryYears[0] ? 'rounded-l-lg' : ''
                } ${
                  year === galleryYears[galleryYears.length - 1] ? 'rounded-r-lg' : ''
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={fadeInStagger}
          initial="hidden"
          animate="visible"
        >
          {currentImages.map((image) => (
            <motion.div 
              key={image.id}
              variants={fadeInItem}
              className="group cursor-pointer"
              onClick={() => openLightbox(image.src)}
            >
              <div className="relative overflow-hidden rounded-lg shadow-md aspect-w-16 aspect-h-12">
                <img 
                  src={image.src} 
                  alt={image.caption} 
                  className="w-full h-64 object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <p className="text-white p-4">{image.caption}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Empty state */}
        {currentImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No images available for this year.</p>
          </div>
        )}
      </Section>
      
      {/* CTA - Submit Photos */}
      <Section background="light">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">Have Photos to Share?</h2>
          <p className="text-gray-600 mb-8">
            If you've attended an EACNA event and have photos that you'd like to share on our gallery, 
            we'd love to feature them! Please submit your high-quality images using the link below.
          </p>
          <Button variant="primary" size="lg">
            Submit Your Photos
          </Button>
        </div>
      </Section>
      
      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-[90vh] w-full flex items-center justify-center">
            <button 
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-colors z-10"
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </button>
            
            <button 
              className="absolute left-4 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-colors z-10"
              aria-label="Previous image"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            
            <img 
              src={selectedImage} 
              alt="Enlarged view" 
              className="max-w-full max-h-[85vh] object-contain"
            />
            
            <button 
              className="absolute right-4 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-colors z-10"
              aria-label="Next image"
            >
              <ArrowRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryPage;