// src/pages/ConferenceArchives.tsx
import React, { useState, useEffect } from "react";
import {
  Calendar,BookOpen,MapPin,Users,Download, Search, ArrowLeft, ExternalLink, ImageIcon,} from "lucide-react";
import { Link } from "react-router-dom";
import Section from "../../components/common/Section";
import Button from "../../components/common/Button";
import { createClient } from "@supabase/supabase-js";

interface Conference {
  id: number;
  year: number;
  title: string;
  location: string;
  dates: string;
  theme: string;
  attendees?: number;
  keynoteSpeakers?: string[];
  description?: string;
  image?: string;
  proceedings?: string;
  presentations?: { title: string; presenter: string; link: string }[];
  photoGallery?: string;
  status: "upcoming" | "past";
  registration_link?: string;
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ConferenceArchives: React.FC = () => {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [expandedConference, setExpandedConference] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("conferences")
          .select("*")
          .order("year", { ascending: false });

        if (error) throw error;

        // Transform data to match our interface
        const formattedData = data.map((conference) => ({
          ...conference,
          keynoteSpeakers: conference.keynote_speakers,
          photoGallery: conference.photo_gallery,
          image: conference.image_url,
          id: conference.id, 
        }));

        setConferences(formattedData || []);
      } catch (error) {
        console.error("Error fetching conferences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConferences();
  }, [supabase]);

  // Filter conferences based on search term and selected year
  const filteredConferences = conferences.filter((conference) => {
    const matchesSearch =
      conference.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conference.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conference.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear =
      selectedYear === "all" || conference.year === selectedYear;

    return matchesSearch && matchesYear;
  });

  // Separate upcoming and past conferences
  const upcomingConferences = filteredConferences.filter(
    (c) => c.status === "upcoming"
  );
  const pastConferences = filteredConferences.filter(
    (c) => c.status === "past"
  );

  // Get unique years for filter
  const years = Array.from(
    new Set(conferences.map((conference) => conference.year))
  ).sort((a, b) => b - a);

  const toggleConferenceExpand = (id: number) => {
    if (expandedConference === id) {
      setExpandedConference(null);
    } else {
      setExpandedConference(id);
    }
  };

  return (
    <>
      <Section>
        <div className="mb-8">
          <Link
            to="/events"
            className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-800">
            Conference Archives
          </h1>
          <p className="text-gray-600 mt-4">
            Browse our past and upcoming EACNA conferences, access
            presentations, proceedings, and other resources.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-card p-6 mb-10">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search conferences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                value={selectedYear === "all" ? "all" : selectedYear.toString()}
                onChange={(e) =>
                  setSelectedYear(
                    e.target.value === "all" ? "all" : parseInt(e.target.value)
                  )
                }
              >
                <option value="all">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Upcoming Conferences Section */}
            {upcomingConferences.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-primary-800 mb-6">
                  Upcoming Conferences
                </h2>
                <div className="space-y-8">
                  {upcomingConferences.map((conference) => (
                    <div
                      key={conference.id}
                      className="bg-white rounded-lg shadow-card overflow-hidden border-l-4 border-primary-600"
                    >
                      <div className="grid md:grid-cols-3">
                        <div className="md:col-span-1">
                          {conference.image && (
                            <img
                              src={conference.image}
                              alt={conference.title}
                              className="w-full h-full object-cover"
                              style={{ height: "100%", minHeight: "200px" }}
                            />
                          )}
                        </div>
                        <div className="md:col-span-2 p-6">
                          <div className="flex flex-wrap items-center justify-between mb-2">
                            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                              Coming Soon • {conference.year}
                            </span>
                          </div>
                          <h2 className="text-2xl font-bold text-primary-800 mb-2">
                            {conference.title}
                          </h2>
                          <div className="flex flex-wrap items-center text-gray-600 mb-4 justify-between">
                            <div className="flex items-center mr-4 mb-2">
                              <Calendar className="h-4 w-4 mr-1" />{" "}
                              {conference.dates}
                            </div>
                            <div className="flex items-center mb-2">
                              <MapPin className="h-4 w-4 mr-1" />{" "}
                              {conference.location}
                            </div>
                            {/* Registration Ongoing Button */}
                            {conference.registration_link && (
                              <a
                                href={conference.registration_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  Registration Ongoing
                                </Button>
                              </a>
                            )}
                          </div>
                          <p className="text-gray-600 mb-4">
                            <span className="font-semibold">Theme:</span>{" "}
                            {conference.theme}
                          </p>

                          {expandedConference === conference.id && (
                            <div className="mt-4 space-y-4">
                              <p className="text-gray-700">
                                {conference.description}
                              </p>

                              {conference.keynoteSpeakers &&
                                conference.keynoteSpeakers.length > 0 && (
                                  <div>
                                    <h3 className="font-semibold text-gray-800">
                                      Featured Speakers:
                                    </h3>
                                    <ul className="list-disc ml-5 mt-2 text-gray-700">
                                      {conference.keynoteSpeakers.map(
                                        (speaker, index) => (
                                          <li key={index}>{speaker}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          )}
                          <div className="mt-4">
                            <Button
                              variant="text"
                              onClick={() =>
                                toggleConferenceExpand(conference.id)
                              }
                            >
                              {expandedConference === conference.id
                                ? "Show Less"
                                : "Learn More"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Conferences Section */}
            {pastConferences.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-primary-800 mb-6">
                  Past Conferences
                </h2>
                <div className="space-y-8">
                  {pastConferences.map((conference) => (
                    <div
                      key={conference.id}
                      className="bg-white rounded-lg shadow-card overflow-hidden"
                    >
                      <div className="grid md:grid-cols-3">
                        <div className="md:col-span-1">
                          {conference.image && (
                            <img
                              src={conference.image}
                              alt={conference.title}
                              className="w-full h-full object-cover"
                              style={{ height: "100%", minHeight: "200px" }}
                            />
                          )}
                        </div>
                        <div className="md:col-span-2 p-6">
                          <div className="flex flex-wrap items-center justify-between mb-2">
                            <span className="bg-primary-100 text-primary-800 text-sm font-semibold px-3 py-1 rounded-full">
                              {conference.year}
                            </span>
                            <div className="flex items-center text-gray-600 text-sm">
                              <Users className="h-4 w-4 mr-1" />{" "}
                              {conference.attendees} Attendees
                            </div>
                          </div>
                          <h2 className="text-2xl font-bold text-primary-800 mb-2">
                            {conference.title}
                          </h2>
                          <div className="flex flex-wrap items-center text-gray-600 mb-4">
                            <div className="flex items-center mr-4 mb-2">
                              <Calendar className="h-4 w-4 mr-1" />{" "}
                              {conference.dates}
                            </div>
                            <div className="flex items-center mb-2">
                              <MapPin className="h-4 w-4 mr-1" />{" "}
                              {conference.location}
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4">
                            <span className="font-semibold">Theme:</span>{" "}
                            {conference.theme}
                          </p>
                          {expandedConference === conference.id && (
                            <div className="mt-4 space-y-4">
                              <p className="text-gray-700">
                                {conference.description}
                              </p>

                              {conference.keynoteSpeakers &&
                                conference.keynoteSpeakers.length > 0 && (
                                  <div>
                                    <h3 className="font-semibold text-gray-800">
                                      Keynote Speakers:
                                    </h3>
                                    <ul className="list-disc ml-5 mt-2 text-gray-700">
                                      {conference.keynoteSpeakers.map(
                                        (speaker, index) => (
                                          <li key={index}>{speaker}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                              {conference.presentations &&
                                conference.presentations.length > 0 && (
                                  <div>
                                    <h3 className="font-semibold text-gray-800">
                                      Selected Presentations:
                                    </h3>
                                    <ul className="mt-2 space-y-2">
                                      {conference.presentations.map(
                                        (presentation, index) => (
                                          <li
                                            key={index}
                                            className="flex items-start"
                                          >
                                            <ExternalLink className="h-4 w-4 text-primary-600 mt-1 mr-2 flex-shrink-0" />
                                            <div>
                                              <a
                                                href={presentation.link}
                                                className="text-primary-600 hover:text-primary-800 hover:underline"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              >
                                                {presentation.title}
                                              </a>
                                              <p className="text-gray-600 text-sm">
                                                {presentation.presenter}
                                              </p>
                                            </div>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                              <div className="flex flex-wrap gap-3 mt-4">
                                {conference.proceedings && (
                                  <a
                                    href={conference.proceedings}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button size="sm" variant="outline">
                                      <Download className="h-4 w-4 mr-2" />
                                      Download Proceedings
                                    </Button>
                                  </a>
                                )}
                                {conference.photoGallery && (
                                  <a
                                    href={conference.photoGallery}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button size="sm" variant="outline">
                                      <ImageIcon className="h-4 w-4 mr-2" />
                                      View Photo Gallery
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="mt-4">
                            <Button
                              variant="text"
                              onClick={() =>
                                toggleConferenceExpand(conference.id)
                              }
                            >
                              {expandedConference === conference.id
                                ? "Show Less"
                                : "Show More"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Conferences Found */}
            {filteredConferences.length === 0 && (
              <div className="bg-white rounded-lg shadow-card p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <BookOpen className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No conferences found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  {searchTerm || selectedYear !== "all"
                    ? "No conferences match your current search criteria. Please try adjusting your filters."
                    : "There are no conference archives available at the moment. Please check back later."}
                </p>
                {(searchTerm || selectedYear !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedYear("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
};

export default ConferenceArchives;
