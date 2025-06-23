import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Filter,
  Star,
} from "lucide-react";
import Section from "../../components/common/Section";
import Button from "../../components/common/Button";
import Card, { CardContent } from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

type SpecialistType = {
  id: number;
  uuid: string;
  prefix: string | null;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  specialization: string | null;
  location: {
    city: string | null;
    country: string | null;
  };
  hospital: string | null;
  contact: {
    phone: string | null;
    email: string | null;
  };
  languages: Record<string, boolean>;
  photo_url: string | null;
  rating: number;
  reviewCount: number;
};

const getActiveLanguages = (languages: Record<string, boolean>): string[] => {
  return Object.entries(languages)
    .filter(([_, isActive]) => isActive)
    .map(([language]) => language);
};

const FindSpecialistPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [specialists, setSpecialists] = useState<SpecialistType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const specialistsPerPage = 6;
  const navigate = useNavigate();

  // Static arrays for countries and specializations
  const countries = [
    "Kenya",
    "Uganda",
    "Tanzania",
    "Burundi",
    "Ethiopia",
    "Somalia",
    "South Sudan",
    "Rwanda",
  ];

  const specializations = [
    "Pediatric Neurology",
    "Developmental Pediatrics",
    "Child Psychology",
    "Pediatric Neurosurgery",
    "Pediatric Epileptology",
    "Pediatric Neurogenetics",
    "Pediatric Neuroimmunology",
    "Pediatric Neurorehabilitation",
    "Pediatric Movement Disorders",
    "Pediatric Headache & Migraine Management",
    "Pediatric Sleep Medicine",
    "Child and Adolescent Psychiatry",
    "Developmental-Behavioral Pediatrics",
    "Pediatric Speech and Language Therapy",
    "Pediatric Occupational Therapy",
    "Pediatric Physical Therapy",
    "Pediatric Autism Spectrum Services",
    "Pediatric Cognitive Rehabilitation",
    "Pediatric Pain Management",
    "Pediatric Clinical Neuropsychology",
    "Pediatric Social Work",
    "Pediatric Neuro-Oncology",
    "Pediatric Neurophysiology",
    "Pediatric Radiology (Neuroimaging)",
    "Pediatric Genetics Counseling",
    "Special Needs Education and Support",
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  // Fetch specialists from Supabase
  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        setLoading(true);
        // First fetch all specialists
        const { data: specialistsData, error: specialistsError } =
          await supabase.from("specialists").select("*");

        if (specialistsError) throw specialistsError;

        // Then fetch reviews for all specialists
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("*");

        if (reviewsError) throw reviewsError;

        // Transform the data to match our SpecialistType
        const formattedData = specialistsData.map((specialist: any) => {
          // Handle languages field - it's an object with language: boolean pairs
          let languagesObj: Record<string, boolean> = {};
          if (
            typeof specialist.languages === "object" &&
            specialist.languages !== null
          ) {
            languagesObj = specialist.languages;
          } else if (typeof specialist.languages === "string") {
            try {
              languagesObj = JSON.parse(specialist.languages);
            } catch {
              languagesObj = {};
            }
          }

          // Calculate rating and review count for this specialist
          const specialistReviews = reviewsData.filter(
            (review) => review.specialist_id === specialist.id
          );
          const reviewCount = specialistReviews.length;
          let rating = 0;

          if (reviewCount > 0) {
            const totalRating = specialistReviews.reduce(
              (sum, review) => sum + review.rating,
              0
            );
            rating = parseFloat((totalRating / reviewCount).toFixed(1));
          }

          return {
            id: specialist.id,
            uuid: specialist.uuid,
            prefix: specialist.prefix,
            first_name: specialist.first_name,
            last_name: specialist.last_name,
            title: specialist.title,
            specialization: specialist.specialization,
            location: {
              city: specialist.city,
              country: specialist.country,
            },
            hospital: specialist.hospital,
            contact: {
              phone: specialist.phone,
              email: specialist.email,
            },
            languages: languagesObj,
            photo_url:
              specialist.photo_url ||
              "https://images.pexels.com/photos/5214956/pexels-photo-5214956.jpeg?auto=compress&cs=tinysrgb&w=600",
            rating,
            reviewCount,
          };
        });

        setSpecialists(formattedData);
      } catch (err) {
        console.error("Error fetching specialists:", err);
        setError("Failed to load specialists. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialists();
  }, []);

  // Filter specialists based on search term and selected filters
  const filteredSpecialists = specialists.filter((specialist) => {
    const fullName = `${specialist.first_name || ""} ${
      specialist.last_name || ""
    }`.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      fullName.includes(searchTerm.toLowerCase()) ||
      (specialist.specialization &&
        specialist.specialization
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (specialist.hospital &&
        specialist.hospital.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCountry =
      selectedCountry === "" ||
      (specialist.location.country &&
        specialist.location.country === selectedCountry);

    const matchesSpecialization =
      selectedSpecialization === "" ||
      (specialist.specialization &&
        specialist.specialization === selectedSpecialization);

    return matchesSearch && matchesCountry && matchesSpecialization;
  });

  // Calculate the specialists to display on the current page
  const indexOfLastSpecialist = currentPage * specialistsPerPage;
  const indexOfFirstSpecialist = indexOfLastSpecialist - specialistsPerPage;
  const currentSpecialists = filteredSpecialists.slice(
    indexOfFirstSpecialist,
    indexOfLastSpecialist
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredSpecialists.length / specialistsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <Section>
        <div className="text-center py-12">
          <LoadingSpinner />
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-secondary-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary-900 to-secondary-700 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7089616/pexels-photo-7089616.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center mix-blend-overlay"></div>
        </div>

        <div className="container-custom relative py-20 lg:py-24">
          <motion.h1
            className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            Find a Specialist
          </motion.h1>

          <motion.p
            className="text-lg max-w-2xl mb-8 text-white/90"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            Connect with pediatric neurology specialists across East Africa for
            consultations, referrals, and collaboration.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            className="max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden mt-8 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center p-4">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search by name, specialization, or hospital..."
                className="flex-grow text-gray-800 placeholder-gray-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="primary" size="sm" className="ml-2">
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Directory Section */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary-800">
                    Filters
                  </h3>
                  <Filter className="h-5 w-5 text-primary-600" />
                </div>

                {/* Country Filter */}
                <div className="mb-6">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="country"
                  >
                    Country
                  </label>
                  <select
                    id="country"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-primary-200 focus:border-primary-500"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                  >
                    <option value="">All Countries</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specialization Filter */}
                <div className="mb-6">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-2"
                    htmlFor="specialization"
                  >
                    Specialization
                  </label>
                  <select
                    id="specialization"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-primary-200 focus:border-primary-500"
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                  >
                    <option value="">All Specializations</option>
                    {specializations.map((specialization) => (
                      <option key={specialization} value={specialization}>
                        {specialization}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset Filters */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSelectedCountry("");
                    setSelectedSpecialization("");
                    setSearchTerm("");
                  }}
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>

            {/* Need Support Box */}
            <div className="mt-6 bg-primary-50 rounded-lg p-6 border border-primary-100">
              <h3 className="text-lg font-semibold mb-3 text-primary-800">
                Need Assistance?
              </h3>
              <p className="text-gray-700 mb-4 text-sm">
                If you need help finding a specialist or have specific
                requirements, our team is here to assist you.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => navigate("/contact")}
              >
                Contact Us for Help
              </Button>
            </div>
          </div>

          {/* Specialists List */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary-800">
                Available Specialists
              </h2>
              <p className="text-gray-600">
                {filteredSpecialists.length} specialist
                {filteredSpecialists.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {currentSpecialists.length > 0 ? (
              <div className="grid gap-6">
                {currentSpecialists.map((specialist) => (
                  <Card key={specialist.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 lg:w-1/5">
                        <img
                          src={
                            specialist.photo_url ||
                            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80"
                          }
                          alt={`${specialist.first_name} ${specialist.last_name}`}
                          className="w-full h-full object-cover aspect-square md:aspect-auto"
                        />
                      </div>
                      <CardContent className="flex-1 md:p-6">
                        <div className="flex flex-wrap justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {specialist.prefix && `${specialist.prefix} `}
                              {specialist.first_name} {specialist.last_name}
                            </h3>
                            <p className="text-secondary-700 font-medium">
                              {specialist.title}
                            </p>
                            {specialist.specialization && (
                              <p className="text-primary-600 text-sm mt-1">
                                Specialization:{" "}
                                <span className="font-semibold">
                                  {specialist.specialization}
                                </span>
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 bg-primary-50 rounded-full px-3 py-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">
                              {specialist.rating}
                            </span>
                            <span className="text-gray-500 text-xs">
                              ({specialist.reviewCount})
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-2">
                          <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              {specialist.hospital && (
                                <p className="text-gray-600">
                                  {specialist.hospital}
                                </p>
                              )}
                              <p className="text-gray-500 text-sm">
                                {specialist.location.city &&
                                  `${specialist.location.city}, `}
                                {specialist.location.country}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-gray-600 text-sm">
                              <span className="font-medium">Languages:</span>{" "}
                              {Object.keys(specialist.languages || {}).length >
                              0
                                ? Object.entries(specialist.languages)
                                    .filter(([_, isActive]) => isActive)
                                    .map(([language]) => language)
                                    .join(", ")
                                : "Not specified"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3 justify-between items-center">
                          <div className="flex items-center space-x-4">
                            {specialist.contact.phone && (
                              <div className="flex items-center text-gray-600 text-sm">
                                <Phone className="h-4 w-4 text-gray-400 mr-1" />
                                <span>{specialist.contact.phone}</span>
                              </div>
                            )}
                            {specialist.contact.email && (
                              <div className="flex items-center text-gray-600 text-sm">
                                <Mail className="h-4 w-4 text-gray-400 mr-1" />
                                <span>{specialist.contact.email}</span>
                              </div>
                            )}
                          </div>

                          <Link to={`/specialist/${specialist.id}`}>
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">
                  No specialists found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCountry("");
                    setSelectedSpecialization("");
                    setSearchTerm("");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {filteredSpecialists.length > specialistsPerPage && (
              <div className="flex justify-center mt-12">
                <nav
                  className="inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                        currentPage === index + 1
                          ? "bg-primary-50 text-primary-600"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Join Directory CTA */}
      <section className="relative bg-white text-primary-800">
        {/* Background Image and Overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-black opacity-35"></div>
        </div>

        {/* Content */}
        <div className="relative container-custom py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl text-white font-bold mb-4">
                Are You a Specialist?
              </h2>
              <p className="text-lg mb-6 text-white/90">
                If you're a pediatric neurology specialist or related healthcare
                professional in East Africa, join our directory to increase your
                visibility and connect with patients and colleagues.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="primary" size="lg" href="join-directory">
                  Join Our Directory
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Medical professional"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FindSpecialistPage;
