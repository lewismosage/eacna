import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Play,
  Clock,
  ArrowLeft,
  AlertCircle,
  X,
} from "lucide-react";
import Section from "../../components/common/Section";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import YouTube from "react-youtube";
import { videos, Video } from "./videos";

const AllVideosPage = () => {
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

  // State for loading and error
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Extract all unique categories for filters
  const categories = [...new Set(videos.map((video) => video.category))];

  // Filtered videos
  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.description &&
        video.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      filterCategory === "all" || video.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // State for currently playing video
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
        <span className="ml-2">Loading videos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Section>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading videos</p>
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
            Educational Videos
          </motion.h1>
          <motion.p
            className="text-lg max-w-2xl mb-6 text-white/90"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            Watch instructional videos on various topics in pediatric neurology,
            created specifically for healthcare professionals in East Africa.
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
                placeholder="Search videos..."
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
              Filter by Category
            </label>
            <div className="relative">
              <select
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </Section>

      {/* Videos List */}
      <Section>
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary-800">
            {filteredVideos.length}{" "}
            {filteredVideos.length === 1 ? "Video" : "Videos"} Found
          </h2>
        </div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video) => (
              <motion.div
                key={video.id}
                variants={fadeIn}
                className="rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div className="relative w-full h-48">
                  {playingVideoId === video.youtubeId && video.youtubeId ? (
                    <>
                      <YouTube
                        videoId={video.youtubeId}
                        opts={{
                          height: "100%",
                          width: "100%",
                          playerVars: { autoplay: 1 },
                        }}
                        className="w-full h-full"
                      />
                      <button
                        onClick={() => setPlayingVideoId(null)}
                        className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1 text-white hover:bg-opacity-80 z-10"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </>
                  ) : (
                    <>
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                      {video.youtubeId && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <button
                            onClick={() => setPlayingVideoId(video.youtubeId!)}
                            className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center transition-transform hover:scale-110"
                          >
                            <Play className="h-5 w-5 text-primary-700 ml-1" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-primary-800">
                      {video.title}
                    </h3>
                    <span className="text-gray-500 text-sm">
                      {video.duration}
                    </span>
                  </div>
                  {video.category && (
                    <span className="inline-block bg-primary-50 text-primary-700 px-2 py-1 rounded-full text-xs font-medium mb-2">
                      {video.category}
                    </span>
                  )}
                  {video.description && (
                    <p className="text-gray-600 text-sm mt-2">
                      {video.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-xl text-gray-500">
                No videos found matching your criteria.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {filteredVideos.length > 0 && (
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

export default AllVideosPage;
