import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card, { CardContent } from "../../components/common/Card";
import { createClient } from "@supabase/supabase-js";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MemberEngagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forumPostsCount, setForumPostsCount] = useState(0);
  const [eventSignupsCount, setEventSignupsCount] = useState(0);
  const [loginData, setLoginData] = useState(
    days.map((day) => ({ day, logins: 0 }))
  );

  const getWeeklyLoginData = async (): Promise<number[]> => {
    try {
      // Get current week range (Monday to Sunday)
      const now = new Date();
      const today = now.getDay(); // 0=Sunday, 1=Monday, etc.
      const diff = today === 0 ? 6 : today - 1; // Days since Monday
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Query your custom logins table
      const { data, error } = await supabase
        .from("user_logins")
        .select("login_at")
        .gte("login_at", startOfWeek.toISOString())
        .lte("login_at", endOfWeek.toISOString())
        .order("login_at", { ascending: true }); // Important for accurate counting

      if (error) {
        console.error("Supabase error:", {
          message: error.message,
          details: error.details,
          code: error.code,
        });
        throw error;
      }

      // Debug log
      console.log(
        "Fetched logins:",
        data?.map((d) => ({
          date: new Date(d.login_at).toLocaleString(),
          day: new Date(d.login_at).getDay(),
        }))
      );

      // Initialize counts for each day
      const loginCounts = Array(7).fill(0);

      // Count logins per day
      data?.forEach((login) => {
        const loginDate = new Date(login.login_at);
        const dayOfWeek = loginDate.getDay(); // 0=Sunday, 1=Monday, etc.
        // Convert to our Mon-Sun format (0=Monday)
        const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        loginCounts[index]++;
      });

      return loginCounts;
    } catch (error) {
      console.error("Error in getWeeklyLoginData:", error);
      return Array(7).fill(0);
    }
  };

  useEffect(() => {
    const fetchEngagementData = async () => {
      try {
        setLoading(true);

        // Fetch forum posts count
        const { count: postsCount, error: postsError } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true });

        if (postsError) throw postsError;

        // Fetch event signups (webinar + event registrations)
        const [
          { count: webinarRegistrations, error: webinarError },
          { count: eventRegistrations, error: eventError },
        ] = await Promise.all([
          supabase
            .from("webinar_registrations")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("event_registrations")
            .select("*", { count: "exact", head: true }),
        ]);

        if (webinarError || eventError) {
          throw webinarError || eventError;
        }

        // Fetch login data
        const loginCounts = await getWeeklyLoginData();

        setForumPostsCount(postsCount || 0);
        setEventSignupsCount(
          (webinarRegistrations || 0) + (eventRegistrations || 0)
        );
        setLoginData(
          days.map((day, i) => ({
            day,
            logins: loginCounts[i] || 0,
          }))
        );
      } catch (err) {
        console.error("Error fetching engagement data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchEngagementData();

    // Set up real-time subscriptions
    const postsSubscription = supabase
      .channel("posts_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => fetchEngagementData()
      )
      .subscribe();

    const registrationsSubscription = supabase
      .channel("registrations_changes")
      .on(
        "system",
        {
          event: "*",
          schema: "public",
          table: /^(webinar|event)_registrations$/,
        },
        () => fetchEngagementData()
      )
      .subscribe();

    // Subscribe to auth log changes (if needed)
    const loginsSubscription = supabase
      .channel("user_logins_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_logins",
        },
        (payload) => {
          console.log("New login detected:", payload);
          fetchEngagementData(); // Refresh data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(registrationsSubscription);
      supabase.removeChannel(loginsSubscription);
    };
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="text-red-500 text-center p-4">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Member Engagement
        </h2>

        <div className="flex flex-col space-y-6">
          {/* Stats Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    Forum Posts
                  </h3>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {forumPostsCount}
                  </p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Event Signups
                  </h3>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {eventSignupsCount}
                  </p>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Logins This Week
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loginData}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: "6px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="logins"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberEngagement;
