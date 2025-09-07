import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import Section from "../components/common/Section";
import Button from "../components/common/Button";
import { SupabaseClient } from "@supabase/supabase-js";

interface GalleryImage {
  id: string;
  src: string;
  caption: string;
  year: string;
  created_at: string;
}

interface GalleryPageProps {
  supabase: SupabaseClient;
}

const GalleryPage = ({ supabase }: GalleryPageProps) => {
  const { year } = useParams<{ year?: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [galleryYears, setGalleryYears] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<Record<string, GalleryImage[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGalleryData();
  }, []);

  useEffect(() => {
    if (year && galleryYears.includes(year)) {
      setSelectedYear(year);
    } else if (galleryYears.length > 0) {
      setSelectedYear(galleryYears[0]);
    }
  }, [year, galleryYears]);

  const fetchGalleryData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all gallery images
      const { data: imagesData, error: imagesError } = await supabase
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: false });

      if (imagesError) {
        console.error("Supabase error:", imagesError);
        throw new Error(`Failed to fetch gallery images: ${imagesError.message}`);
      }

      // Check if we have any data
      if (!imagesData || imagesData.length === 0) {
        setGalleryYears([]);
        setGalleryImages({});
        return;
      }

      // Group images by year
      const imagesByYear: Record<string, GalleryImage[]> = {};
      const yearsSet = new Set<string>();
      
      imagesData.forEach((image) => {
        if (!imagesByYear[image.year]) {
          imagesByYear[image.year] = [];
        }
        imagesByYear[image.year].push(image);
        yearsSet.add(image.year);
      });

      // Convert Set to array and sort years in descending order
      const years = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
      
      setGalleryYears(years);
      setGalleryImages(imagesByYear);
      
    } catch (error) {
      console.error("Error fetching gallery data:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const currentImages = selectedYear ? galleryImages[selectedYear] || [] : [];

  const openLightbox = (src: string, index: number) => {
    setSelectedImage(src);
    setCurrentImageIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = "auto";
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (!currentImages.length) return;
    
    let newIndex;
    if (direction === "next") {
      newIndex = (currentImageIndex + 1) % currentImages.length;
    } else {
      newIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    }
    
    setCurrentImageIndex(newIndex);
    setSelectedImage(currentImages[newIndex].src);
  };

  const fadeInStagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeInItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (isLoading) {
    return (
      <>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 text-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-50"></div>
          </div>
          <div className="container-custom relative py-24">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-6">Photo Gallery</h1>
              <p className="text-lg max-w-2xl mb-8 text-white/90 mx-auto">
                Browse through our collection of photos from EACNA events,
                conferences, and community outreach programs throughout the years.
              </p>
            </div>
          </div>
        </section>

        <Section>
          <div className="flex justify-center">
            <div className="animate-pulse bg-gray-200 h-10 w-64 rounded-md"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded mt-2"></div>
              </div>
            ))}
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="container-custom relative py-24">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-6">Photo Gallery</h1>
            <p className="text-lg max-w-2xl mb-8 text-white/90 mx-auto">
              Browse through our collection of photos from EACNA events,
              conferences, and community outreach programs throughout the years.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Filter */}
      <Section>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        )}

        {galleryYears.length > 0 ? (
          <>
            <div className="flex justify-center mb-10">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                {galleryYears.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setSelectedYear(year)}
                    className={`px-6 py-2 text-sm font-medium ${
                      selectedYear === year
                        ? "bg-primary-600 text-white"
                        : "bg-white text-gray-700 hover:text-primary-700 hover:bg-gray-50"
                    } border border-gray-200 focus:z-10 focus:ring-2 focus:ring-primary-500 focus:text-primary-700 ${
                      year === galleryYears[0] ? "rounded-l-lg" : ""
                    } ${
                      year === galleryYears[galleryYears.length - 1]
                        ? "rounded-r-lg"
                        : ""
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {currentImages.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                variants={fadeInStagger}
                initial="hidden"
                animate="visible"
              >
                {currentImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    variants={fadeInItem}
                    className="group cursor-pointer"
                    onClick={() => openLightbox(image.src, index)}
                  >
                    <div className="relative overflow-hidden rounded-lg shadow-md aspect-w-16 aspect-h-12">
                      <img
                        src={image.src}
                        alt={image.caption}
                        className="w-full h-64 object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          // Fallback for broken images
                          e.currentTarget.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <p className="text-white p-4">{image.caption}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  No images available for this year.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              No images available in the gallery yet.
            </p>
          </div>
        )}
      </Section>

      {/* Lightbox */}
      {selectedImage && currentImages.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl max-h-[90vh] w-full flex items-center justify-center">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-colors z-10"
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </button>

            {currentImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage("prev")}
                  className="absolute left-4 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>

                <button
                  onClick={() => navigateImage("next")}
                  className="absolute right-4 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-colors z-10"
                  aria-label="Next image"
                >
                  <ArrowRight className="h-6 w-6" />
                </button>
              </>
            )}

            <img
              src={selectedImage}
              alt={currentImages[currentImageIndex].caption}
              className="max-w-full max-h-[85vh] object-contain"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
              }}
            />
            
            <div className="absolute bottom-4 left-0 right-0 text-center text-white">
              <p className="bg-black bg-opacity-50 inline-block px-3 py-1 rounded">
                {currentImages[currentImageIndex].caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryPage;