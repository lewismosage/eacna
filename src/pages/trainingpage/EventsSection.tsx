// src/pages/EventsSection.tsx
import React, { useState, useEffect } from "react";
import {
  Calendar,ArrowRight,BookOpen,MapPin,Video,CheckCircle,Radio,} from "lucide-react";
import { format } from "date-fns";
import { createClient } from "@supabase/supabase-js";
import Section from "../../components/common/Section";
import Button from "../../components/common/Button";
import Card, { CardContent } from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TrainingEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image_url: string;
  start_time: string;
  end_time: string;
  status: "draft" | "published" | "completed";
}

interface Webinar {
  id: string;
  title: string;
  date: string;
  description: string;
  image_url: string;
  start_time: string;
  end_time: string;
  registration_link: string;
  webinar_link: string;
  recording_url: string;
  is_live: boolean;
  has_recording: boolean;
  status: "draft" | "published" | "completed";
}

const EventsSection = () => {
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [conferences, setConferences] = useState<any[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch training events (only published)
      const { data: eventsData, error: eventsError } = await supabase
        .from("training_events")
        .select("*")
        .eq("status", "published")
        .order("date", { ascending: true });

      // Fetch webinars (both published AND completed)
      const { data: webinarsData, error: webinarsError } = await supabase
        .from("webinars")
        .select("*")
        .or("status.eq.published,status.eq.completed")
        .order("date", { ascending: false });

      // Fetch conferences (most recent 3)
      const { data: conferencesData, error: conferencesError } = await supabase
        .from("conferences")
        .select("*")
        .order("year", { ascending: false })
        .limit(3);

      if (eventsError || webinarsError || conferencesError)
        throw eventsError || webinarsError || conferencesError;

      setEvents((eventsData as TrainingEvent[]) || []);
      setWebinars((webinarsData as Webinar[]) || []);
      setConferences(conferencesData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load events data");
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy");
  };

  const formatTimeRange = (start: string, end: string) => {
    if (!start || !end) return "";
    return `${start} - ${end}`;
  };

  // Helper function to determine webinar status
  const getWebinarStatus = (webinar: Webinar) => {
    if (webinar.status === "completed") {
      return {
        label: "Completed",
        className: "bg-gray-100 text-gray-800",
        icon: <CheckCircle className="h-4 w-4 mr-1" />,
      };
    }

    if (webinar.is_live) {
      return {
        label: "Live",
        className: "bg-red-100 text-red-800",
        icon: <Radio className="h-4 w-4 mr-1" />,
      };
    }

    if (webinar.recording_url && webinar.recording_url.trim() !== "") {
      return {
        label: "Recording Available",
        className: "bg-green-100 text-green-800",
        icon: <Video className="h-4 w-4 mr-1" />,
      };
    }

    return {
      label: "Upcoming",
      className: "bg-green-100 text-green-800",
      icon: <Calendar className="h-4 w-4 mr-1" />,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>;
  }

  // Get first 3 events
  const displayedEvents = events.slice(0, 3);
  // Get first 3 webinars
  const displayedWebinars = webinars.slice(0, 3);

  return (
    <>
      {/* Upcoming Events */}
      <Section id="upcoming-events">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">
            Upcoming Training Events
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join us for these upcoming training opportunities and conferences in
            child neurology.
          </p>
        </div>

        {displayedEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Calendar className="h-8 w-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              No Events Found
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              There are no upcoming events at the moment. Please check back
              later.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedEvents.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={
                      event.image_url ||
                      "https://via.placeholder.com/400x200?text=No+Image"
                    }
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardContent>
                  <div className="flex items-start mb-3">
                    <Calendar className="h-5 w-5 text-primary-600 mt-1 mr-2" />
                    <div>
                      <span className="text-primary-600 font-semibold">
                        {formatEventDate(event.date)}
                      </span>
                      <p className="text-gray-600 text-sm flex items-start">
                        <MapPin className="w-4 h-4 mr-1 mt-0.5" />
                        {event.location}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-primary-800">
                    {event.title}
                  </h3>
                  <Button
                    variant="text"
                    className="mt-2"
                    to={`/event/${event.id}`}
                  >
                    View Details <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {events.length > 3 && (
          <div className="mt-12 text-center">
            <Button variant="outline" to="/all-events">
              View All Events
            </Button>
          </div>
        )}
      </Section>

      {/* Webinars & Annual Meetings */}
      <Section id="conferences" background="light">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-800">
            Annual Meetings & Webinars
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Access our archive of past events and register for upcoming webinars
            and annual conferences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Annual Conferences - dynamic */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-800 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" /> Annual Conferences
            </h3>
            <p className="text-gray-700 mb-4">
              Our annual conferences bring together experts from across East
              Africa and beyond to share the latest research and best practices
              in peadiatric neurology.
            </p>
            {conferences.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">
                  No conferences found. Please check back later.
                </p>
              </div>
            ) : (
              <ul className="space-y-4 mb-6">
                {conferences.map((conf) => (
                  <li
                    key={conf.id}
                    className="flex items-start w-full justify-between"
                  >
                    <div className="flex items-start">
                      <span className="bg-secondary-100 text-secondary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2 mt-1">
                        {conf.year}
                      </span>
                      <div>
                        <h4 className="font-semibold">{conf.title}</h4>
                        <p className="text-gray-600 text-sm">
                          {conf.location} | {conf.dates}
                        </p>
                      </div>
                    </div>
                    {/* Registration Ongoing Button */}
                    {conf.registration_link && (
                      <a
                        href={conf.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4"
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
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outline" to="/conference-archives">
              View All Conference Archives
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-800 flex items-center">
              <Video className="h-5 w-5 mr-2" /> Webinars & Online Events
            </h3>
            <p className="text-gray-700 mb-4">
              Our monthly webinars feature presentations on various topics in
              peadiatric neurology from leading experts in the field.
            </p>

            {displayedWebinars.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">
                  No upcoming webinars at the moment. Please check back later.
                </p>
              </div>
            ) : (
              <ul className="space-y-4 mb-6">
                {displayedWebinars.map((webinar) => {
                  const status = getWebinarStatus(webinar);
                  return (
                    <li key={webinar.id} className="flex items-start">
                      <span
                        className={`${status.className} text-xs font-semibold px-2.5 py-0.5 rounded-full mr-2 mt-1`}
                      >
                        {status.label}
                      </span>
                      <div>
                        <h4 className="font-semibold">{webinar.title}</h4>
                        <p className="text-gray-600 text-sm">
                          {formatEventDate(webinar.date)} |{" "}
                          {formatTimeRange(
                            webinar.start_time,
                            webinar.end_time
                          )}
                        </p>
                        <Button
                          variant="text"
                          size="sm"
                          className="mt-1 p-0"
                          to={`/webinar/${webinar.id}`}
                        >
                          View Details <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {webinars.length > 3 && (
              <Button variant="outline" to="/webinars">
                View All Webinars
              </Button>
            )}
          </div>
        </div>
      </Section>
    </>
  );
};

export default EventsSection;
