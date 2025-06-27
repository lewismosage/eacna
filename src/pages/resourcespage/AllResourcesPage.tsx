import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  FileText,
  Book,
  Link as LinkIcon,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Section from "../../components/common/Section";
import Button from "../../components/common/Button";
import { Link } from "react-router-dom";
import Card, { CardContent } from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";

interface Resource {
  id: number;
  title: string;
  type: string;
  description: string;
  icon: JSX.Element;
  downloadUrl?: string;
}

const AllResourcesPage = () => {
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

  // Mock data for resources (replace with actual data fetching if needed)
  const allResources: Resource[] = [
    {
      id: 1,
      title: "East African Pediatric Neurology Handbook",
      type: "Clinical Guide",
      description:
        "A comprehensive guide to diagnosis and management of common pediatric neurological disorders in East Africa.",
      icon: <Book className="h-6 w-6" />,
      downloadUrl: "#",
    },
    {
      id: 2,
      title: "Epilepsy Management Protocol",
      type: "Protocol",
      description:
        "Step-by-step protocol for managing epilepsy in resource-limited settings.",
      icon: <FileText className="h-6 w-6" />,
      downloadUrl: "#",
    },
    {
      id: 3,
      title: "Pediatric Neurodevelopmental Disorder Assessment Tools",
      type: "Assessment Tools",
      description:
        "Validated assessment tools for screening and diagnosing neurodevelopmental disorders.",
      icon: <FileText className="h-6 w-6" />,
      downloadUrl: "#",
    },
    {
      id: 4,
      title: "Telemedicine Guide for Pediatric Neurology",
      type: "Guide",
      description:
        "Best practices for remote consultation and follow-up of pediatric neurology patients.",
      icon: <LinkIcon className="h-6 w-6" />,
      downloadUrl: "#",
    },
    {
      id: 5,
      title: "Cerebral Palsy Management Guidelines",
      type: "Guidelines",
      description:
        "Comprehensive guidelines for the management of cerebral palsy in children.",
      icon: <FileText className="h-6 w-6" />,
      downloadUrl: "#",
    },
    {
      id: 6,
      title: "Neonatal Seizure Recognition Handbook",
      type: "Handbook",
      description:
        "Illustrated guide to recognizing and managing neonatal seizures.",
      icon: <Book className="h-6 w-6" />,
      downloadUrl: "#",
    },
    {
      id: 7,
      title: "Neuroimaging Referral Guidelines",
      type: "Guidelines",
      description:
        "When and how to refer pediatric patients for neuroimaging studies.",
      icon: <FileText className="h-6 w-6" />,
      downloadUrl: "#",
    },
    {
      id: 8,
      title: "Community Health Worker Training Manual",
      type: "Training Manual",
      description:
        "Manual for training community health workers in pediatric neurology basics.",
      icon: <Book className="h-6 w-6" />,
      downloadUrl: "#",
    },
  ];

  // State for loading and error
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Extract all unique types for filters
  const types = [...new Set(allResources.map((res) => res.type))];

  // Filtered resources
  const filteredResources = allResources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || res.type === filterType;

    return matchesSearch && matchesType;
  });

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
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
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
        <div className="container-custom relative py-16">
          <motion.h1
            className="text-3xl md:text-4xl font-bold mb-4"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            Clinical Resources
          </motion.h1>
          <motion.p
            className="text-lg max-w-2xl mb-6 text-white/90"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            Evidence-based tools and guidelines for clinical practice in pediatric
            neurology designed for the East African context.
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
                placeholder="Search resources..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Filters */}
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Type
            </label>
            <div className="relative">
              <select
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </Section>

      {/* Resources List */}
      <Section>
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary-800">
            {filteredResources.length}{" "}
            {filteredResources.length === 1 ? "Resource" : "Resources"} Found
          </h2>
        </div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <motion.div key={resource.id} variants={fadeIn}>
                <Card>
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
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-xl text-gray-500">
                No resources found matching your criteria.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {filteredResources.length > 0 && (
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

export default AllResourcesPage;