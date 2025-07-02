import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Book,
  Link as LinkIcon,
  Download,
  ExternalLink,
  Play,
} from "lucide-react";
import Section from "../../components/common/Section";
import Button from "../../components/common/Button";
import Card, { CardContent } from "../../components/common/Card";
import { createClient } from "@supabase/supabase-js";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EducationalVideos from "./EducationalVideos";

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

const ResourcesPage = () => {
  const location = useLocation();
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  // State for publications
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          .order("created_at", { ascending: false })
          .limit(4); // Limit to 4 most recent publications

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

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Clinical Resources (unchanged)
  const clinicalResources = [
    {
      id: 1,
      title: "East African Pediatric Neurology Handbook",
      type: "Clinical Guide",
      description:
        "A comprehensive guide to diagnosis and management of common pediatric neurological disorders in East Africa.",
      icon: <Book className="h-6 w-6" />,
    },
    {
      id: 2,
      title: "Epilepsy Management Protocol",
      type: "Protocol",
      description:
        "Step-by-step protocol for managing epilepsy in resource-limited settings.",
      icon: <FileText className="h-6 w-6" />,
    },
    {
      id: 3,
      title: "Pediatric Neurodevelopmental Disorder Assessment Tools",
      type: "Assessment Tools",
      description:
        "Validated assessment tools for screening and diagnosing neurodevelopmental disorders.",
      icon: <FileText className="h-6 w-6" />,
    },
    {
      id: 4,
      title: "Telemedicine Guide for Pediatric Neurology",
      type: "Guide",
      description:
        "Best practices for remote consultation and follow-up of pediatric neurology patients.",
      icon: <LinkIcon className="h-6 w-6" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
        <span className="ml-2">Loading resources...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Section>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
          <div>
            <p className="font-medium">Error loading resources</p>
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

        <div className="container-custom relative py-20 lg:py-28">
          <motion.h1
            className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            Resources & Publications
          </motion.h1>

          <motion.p
            className="text-lg max-w-2xl mb-8 text-white/90"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            Access the latest research, clinical guidelines, educational
            materials, and publications in pediatric neurology.
          </motion.p>
        </div>
      </section>

      {/* Publications Section */}
      <Section id="publications">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">
              Latest Publications
            </h2>
            <p className="text-gray-700 mb-6">
              Explore the latest research papers, case studies, and publications
              from EACNA members and partners in the field of pediatric
              neurology.
            </p>

            <Link to={`/all-publications`}>
              <Button variant="primary">View All Publications</Button>
            </Link>
          </div>

          <div className="lg:col-span-2">
            <motion.div
              className="space-y-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {publications.map((publication) => (
                <motion.div
                  key={publication.id}
                  variants={fadeIn}
                  className="bg-white rounded-lg shadow-card p-5 hover:shadow-card-hover transition-shadow duration-300"
                >
                  <h3 className="text-lg font-semibold mb-2 text-primary-800">
                    {publication.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{publication.authors}</p>
                  <p className="text-gray-500 text-sm mb-3">
                    {publication.journal && `${publication.journal}, `}
                    {publication.year}
                  </p>
                  <Link
                    to={`/read-publication/${publication.id}`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Read Paper <ExternalLink className="ml-1 h-4 w-4" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </Section>

      {/* Clinical Resources */}
      <div id="clinical-resources">
        <Section background="light">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">
              Clinical Resources
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Evidence-based tools and guidelines for clinical practice in
              pediatric neurology designed for the East African context.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clinicalResources.map((resource) => (
              <Card key={resource.id}>
                <CardContent>
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                      {resource.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-primary-800 text-center">
                    {resource.title}
                  </h3>
                  <p className="text-secondary-600 text-sm text-center mb-3">
                    {resource.type}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 text-center">
                    {resource.description}
                  </p>
                  <div className="flex justify-center">
                    <Button variant="outline" size="sm">
                      <Download className="mr-1 h-4 w-4" /> Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/all-resources">
              <Button variant="primary">View All Resources</Button>
            </Link>
          </div>
        </Section>
      </div>

      {/* Educational Videos */}
      <EducationalVideos />

      {/* Additional Resources */}
      <Section id="reading" background="light">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-primary-800">
              Recommended Reading
            </h2>
            <ul className="space-y-4">
              <li className="flex">
                <Book className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1 mr-3" />
                <div>
                  <h3 className="font-semibold">
                    Pediatric Neurology Principles & Practice, 6th Edition
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Kenneth F. Swaiman, et al.
                  </p>
                </div>
              </li>
              <li className="flex">
                <Book className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1 mr-3" />
                <div>
                  <h3 className="font-semibold">
                    Volpe's Neurology of the Newborn, 6th Edition
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Joseph J. Volpe, et al.
                  </p>
                </div>
              </li>
              <li className="flex">
                <Book className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1 mr-3" />
                <div>
                  <h3 className="font-semibold">
                    Pediatric Epilepsy: Diagnosis and Therapy, 4th Edition
                  </h3>
                  <p className="text-gray-600 text-sm">
                    John M. Pellock, et al.
                  </p>
                </div>
              </li>
              <li className="flex">
                <Book className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1 mr-3" />
                <div>
                  <h3 className="font-semibold">
                    Clinical Neurophysiology in Pediatrics
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Gloria Galloway, et al.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 text-primary-800">
              Useful Links
            </h2>
            <ul className="space-y-4">
              <li className="flex">
                <LinkIcon className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1 mr-3" />
                <div>
                  <a
                    href="#"
                    className="font-semibold text-primary-700 hover:underline"
                  >
                    World Health Organization (WHO) - Neurological Disorders
                  </a>
                  <p className="text-gray-600 text-sm">
                    Resources on neurological disorders affecting children
                    globally
                  </p>
                </div>
              </li>
              <li className="flex">
                <LinkIcon className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1 mr-3" />
                <div>
                  <a
                    href="#"
                    className="font-semibold text-primary-700 hover:underline"
                  >
                    International League Against Epilepsy (ILAE)
                  </a>
                  <p className="text-gray-600 text-sm">
                    Resources and guidelines for epilepsy management
                  </p>
                </div>
              </li>
              <li className="flex">
                <LinkIcon className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1 mr-3" />
                <div>
                  <a
                    href="#"
                    className="font-semibold text-primary-700 hover:underline"
                  >
                    Child Neurology Foundation
                  </a>
                  <p className="text-gray-600 text-sm">
                    Educational resources for healthcare providers and families
                  </p>
                </div>
              </li>
              <li className="flex">
                <LinkIcon className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1 mr-3" />
                <div>
                  <a
                    href="#"
                    className="font-semibold text-primary-700 hover:underline"
                  >
                    African Child Neurology Association
                  </a>
                  <p className="text-gray-600 text-sm">
                    Collaborative platform for child neurology professionals
                    across Africa
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
};

export default ResourcesPage;
