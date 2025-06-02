// components/EventsSidebar.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

interface TrainingEvent {
  id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  registration_link: string | null;
  is_full: boolean;
}

const EventsSidebar = () => {
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("training_events")
          .select(
            "id, title, date, start_time, end_time, location, registration_link, is_full"
          )
          .order("date", { ascending: true })
          .limit(3);

        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDateTime = (dateStr: string, timeStr: string | null) => {
    const date = new Date(dateStr);
    let formatted = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (timeStr) {
      const time = new Date(`1970-01-01T${timeStr}`);
      formatted += ` at ${time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return formatted;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Upcoming Events</h3>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Upcoming Events</h3>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Upcoming Events</h3>
        <p className="text-gray-500 text-sm">No upcoming events scheduled</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
      <h3 className="font-semibold text-gray-800 mb-3">Upcoming Events</h3>
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-3"
        >
          <h4 className="font-semibold text-primary-800">{event.title}</h4>
          <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDateTime(event.date, event.start_time)}</span>
          </div>
          {event.location && (
            <div className="text-gray-600 text-sm mt-1">{event.location}</div>
          )}
          <Link
            to={`/event/${event.id}`}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 mt-2 inline-block"
          >
            Register Now
          </Link>
        </div>
      ))}
      <Link
        to="/all-events"
        className="text-sm font-medium text-primary-600 hover:text-primary-700 block text-center mt-2"
      >
        View All Events
      </Link>
    </div>
  );
};

export default EventsSidebar;