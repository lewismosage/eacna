import React, { useState, useEffect } from "react";
import { Calendar, ArrowRight, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { createClient } from "@supabase/supabase-js";
import Section from "../components/common/Section";
import Button from "../components/common/Button";
import Card, { CardContent } from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import medicalBg from "../assets/medical background.avif";

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

const EventsSection = () => {
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from("training_events")
        .select("*")
        .eq("status", "published")
        .order("date", { ascending: true });

      if (eventsError) throw eventsError;

      setEvents((eventsData as TrainingEvent[]) || []);
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

  return (
    <Section id="upcoming-events" className="relative overflow-hidden">
      <img
        src={medicalBg}
        alt="Medical background"
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
        style={{ opacity: 0.25 }}
      />
      <div className="relative z-10">
        <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary-800 relative">
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
                      {event.start_time && event.end_time && (
                        <p className="text-gray-600 text-sm flex items-start">
                          <Clock className="w-4 h-4 mr-1 mt-0.5" />
                          {formatTimeRange(event.start_time, event.end_time)}
                        </p>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-primary-800">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>
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
      </div>
    </Section>
  );
};

export default EventsSection;