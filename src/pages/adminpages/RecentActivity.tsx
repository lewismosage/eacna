import { FileText, UserPlus, User, CreditCard } from "lucide-react";
import Card, { CardContent } from "../../components/common/Card";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

interface Activity {
  id: string;
  type: "member_application" | "specialist_application" | "payment" | "publication";
  title: string;
  description: string;
  timestamp: string;
}

const RecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        setLoading(true);
        
        // Fetch the latest activity from each table
        const [
          { data: memberApplications, error: memberError },
          { data: specialistApplications, error: specialistError },
          { data: payments, error: paymentError },
          { data: publications, error: publicationError },
        ] = await Promise.all([
          supabase
            .from("membership_applications")
            .select("id, first_name, last_name, application_date")
            .order("application_date", { ascending: false })
            .limit(1),
          supabase
            .from("specialist_applications")
            .select("id, first_name, last_name, created_at")
            .order("created_at", { ascending: false })
            .limit(1),
          supabase
            .from("payments")
            .select("id, amount, currency, created_at")
            .order("created_at", { ascending: false })
            .limit(1),
          supabase
            .from("publications")
            .select("id, title, created_at")
            .order("created_at", { ascending: false })
            .limit(1),
        ]);

        if (memberError || specialistError || paymentError || publicationError) {
          throw new Error(
            memberError?.message ||
            specialistError?.message ||
            paymentError?.message ||
            publicationError?.message ||
            "Failed to fetch activities"
          );
        }

        const mappedActivities: Activity[] = [];

        // Map each activity type if data exists
        if (memberApplications && memberApplications.length > 0) {
          const app = memberApplications[0];
          mappedActivities.push({
            id: app.id,
            type: "member_application",
            title: "New Member Application",
            description: `${app.first_name} ${app.last_name} submitted a membership application`,
            timestamp: app.application_date, 
          });
        }

        if (specialistApplications && specialistApplications.length > 0) {
          const app = specialistApplications[0];
          mappedActivities.push({
            id: app.id,
            type: "specialist_application",
            title: "New Specialist Application",
            description: `${app.first_name} ${app.last_name} submitted a specialist application`,
            timestamp: app.created_at,
          });
        }

        if (payments && payments.length > 0) {
          const payment = payments[0];
          mappedActivities.push({
            id: payment.id,
            type: "payment",
            title: "New Payment Received",
            description: `Payment of ${payment.currency} ${payment.amount} received`,
            timestamp: payment.created_at,
          });
        }

        if (publications && publications.length > 0) {
          const pub = publications[0];
          mappedActivities.push({
            id: pub.id,
            type: "publication",
            title: "New Publication Submission",
            description: `${pub.title} submitted for review`,
            timestamp: pub.created_at,
          });
        }

        // Sort activities by timestamp (newest first)
        mappedActivities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setActivities(mappedActivities);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError(err instanceof Error ? err.message : "Failed to load activities");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();

    // Set up real-time subscription for new activities
    const subscription = supabase
      .channel("recent_activities")
      .on(
        "system",
        {
          event: "*",
          schema: "public",
          table: /^(membership_applications|specialist_applications|payments|publications)$/,
        },
        () => fetchRecentActivities()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-40">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-red-500 text-center p-4">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <p className="text-gray-500 text-center py-4">
            No recent activities found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={`${activity.type}-${activity.id}`}
              className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0">
                {activity.type === "member_application" && (
                  <UserPlus className="h-5 w-5 text-primary-600" />
                )}
                {activity.type === "specialist_application" && (
                  <User className="h-5 w-5 text-blue-600" />
                )}
                {activity.type === "payment" && (
                  <CreditCard className="h-5 w-5 text-green-600" />
                )}
                {activity.type === "publication" && (
                  <FileText className="h-5 w-5 text-accent-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;