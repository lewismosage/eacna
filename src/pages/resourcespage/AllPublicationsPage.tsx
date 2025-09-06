import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  ExternalLink,
  Download,
  BookOpen,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Section from "../../components/common/Section";
import Button from "../../components/common/Button";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface Publication {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  journal?: string;
  year?: number;
  keywords: string[];
  status: string;
  created_at: string;
  updated_at: string;
  sections: any[];
  publication_references: string[];
  user_id: string;
  submitted_by?: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

const AllPublicationsPage = () => {
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

  // State for publications and loading
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  const [filterTopic, setFilterTopic] = useState("all");

  // Fetch publications from Supabase
  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from("publications")
          .select(
            `
            *,
            profiles:user_id (first_name, last_name)
          `
          )
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (supabaseError) throw supabaseError;

        // Map the data to include the submitter's name
        const publicationsWithSubmitter = data.map((pub: any) => ({
          ...pub,
          submitted_by: pub.profiles
            ? `${pub.profiles.first_name} ${pub.profiles.last_name}`
            : "Unknown Author",
        }));

        setPublications(publicationsWithSubmitter || []);
      } catch (err) {
        console.error("Error fetching publications:", err);
        setError("Failed to load publications. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublications();
  }, []);

  // Extract all unique years and topics for filters
  const years = [
    ...new Set(publications.map((pub) => pub.year?.toString())),
  ].filter(Boolean);
  const allTopics = [
    ...new Set(publications.flatMap((pub) => pub.keywords || [])),
  ].filter(Boolean);

  // Filtered publications
  const filteredPublications = publications.filter((pub) => {
    const matchesSearch =
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.abstract.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear =
      filterYear === "all" || pub.year?.toString() === filterYear;
    const matchesTopic =
      filterTopic === "all" ||
      (pub.keywords && pub.keywords.includes(filterTopic));

    return matchesSearch && matchesYear && matchesTopic;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
        <span className="ml-2">Loading publications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Section>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading publications</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="container-custom relative py-16">
          <motion.h1
            className="text-3xl md:text-4xl font-bold mb-4"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            Publications
          </motion.h1>
          <motion.p
            className="text-lg max-w-2xl mb-6 text-white/90"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            Explore the latest research papers, case studies, and publications
            from EACNA members and partners in the field of peadiatric neurology.
          </motion.p>
        </div>
      </section>

      {/* Search & Filter Section */}
      <Section background="light">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Search */}
          <div className="w-full md:w-1/2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search publications..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Filters */}
          <div className="w-full md:w-1/2 flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Year
              </label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="all">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Topic
              </label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                >
                  <option value="all">All Topics</option>
                  {allTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Publications List */}
      <Section>
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary-800">
            {filteredPublications.length}{" "}
            {filteredPublications.length === 1 ? "Publication" : "Publications"}{" "}
            Found
          </h2>
        </div>

        <motion.div
          className="space-y-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {publications.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500">
                There are no publication articles at the moment. Please check
                back later.
              </p>
            </div>
          ) : filteredPublications.length > 0 ? (
            filteredPublications.map((publication) => (
              <motion.div
                key={publication.id}
                variants={fadeIn}
                className="bg-white rounded-lg shadow-card p-6 hover:shadow-card-hover transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold mb-2 text-primary-800">
                  {publication.title}
                </h3>
                <p className="text-gray-600 mb-2">{publication.authors}</p>
                <p className="text-gray-500 text-sm mb-4">
                  {publication.journal && `${publication.journal}, `}
                  {publication.year}
                </p>

                <p className="text-gray-700 mb-4">{publication.abstract}</p>

                {publication.keywords && publication.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {publication.keywords.map((topic) => (
                      <span
                        key={topic}
                        className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/read-publication/${publication.id}`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <BookOpen className="mr-1 h-4 w-4" /> Read Paper
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-500">
                No publications found matching your criteria.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setFilterYear("all");
                  setFilterTopic("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {filteredPublications.length > 0 && publications.length > 0 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="px-3">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="primary" size="sm" className="px-4">
                1
              </Button>
              <Button variant="outline" size="sm" className="px-4">
                2
              </Button>
              <Button variant="outline" size="sm" className="px-4">
                3
              </Button>
              <span className="px-2 text-gray-500">...</span>
              <Button variant="outline" size="sm" className="px-4">
                8
              </Button>
              <Button variant="outline" size="sm" className="px-3">
                <ArrowLeft className="h-4 w-4 transform rotate-180" />
              </Button>
            </nav>
          </div>
        )}
      </Section>
    </>
  );
};

export default AllPublicationsPage;
