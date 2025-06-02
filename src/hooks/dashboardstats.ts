// hooks/dashboarddata.ts
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

export interface Member {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  membership_type: string;
  membership_id: string;
  member_since: string;
  expiry_date: string;
  status: "active" | "expired";
  institution: string;
  nationality?: string;
  country_of_residence?: string;
  current_profession: string;
}

interface Application {
  id: string;
  application_status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  payment_type: "application" | "renewal" | "upgrade" | "other";
  created_at: string;
  status: "pending" | "completed" | "failed" | "refunded";
}

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

interface PaymentStats {
  new_payments: number;
  renewals: number;
  upgrades: number;
  total_amount: number;
}

export const useDashboardData = () => {
  // State for all data
  const [dashboardData, setDashboardData] = useState({
    members: [] as Member[],
    totalMembers: 0,
    activeMembers: 0,
    pendingApplications: 0,
    newApplicationsThisMonth: 0,
    totalPaymentsAmount: 0,
    newPaymentsThisMonth: 0,
    renewalsThisMonth: 0,
    upgradesThisMonth: 0,
    totalSubscribers: 0,
    newSubscribersThisMonth: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Execute all queries in parallel
      const [
        { data: membersData, error: membersError },
        { data: pendingAppsData, error: pendingAppsError },
        { data: newAppsData, error: newAppsError },
        { data: paymentStatsData, error: paymentStatsError },
        { data: subscribersData, error: subscribersError },
        { data: newSubsData, error: newSubsError },
      ] = await Promise.all([
        supabase.from('membership_directory').select('*').order('member_since', { ascending: false }),
        supabase.from('membership_applications').select('id').eq('application_status', 'pending'),
        supabase.rpc('get_new_applications_this_month'),
        supabase.rpc('get_payment_stats_this_month'),
        supabase.from('subscribers').select('id').eq('is_active', true),
        supabase.rpc('get_new_subscribers_this_month'),
      ]);

      // Check for errors
      if (membersError || pendingAppsError || newAppsError || paymentStatsError || subscribersError || newSubsError) {
        throw membersError || pendingAppsError || newAppsError || paymentStatsError || subscribersError || newSubsError;
      }

      // Transform members data
      const members = membersData?.map((member): Member => ({
        id: member.user_id,
        user_id: member.user_id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone: member.phone,
        membership_type: member.membership_type,
        membership_id: member.membership_id,
        member_since: member.member_since,
        expiry_date: member.expiry_date,
        status: member.status,
        institution: member.institution,
        nationality: member.nationality,
        country_of_residence: member.country_of_residence,
        current_profession: member.current_profession
      })) || [];

      // Extract payment stats
      const paymentStats = paymentStatsData?.[0] as PaymentStats || {
        new_payments: 0,
        renewals: 0,
        upgrades: 0,
        total_amount: 0
      };

      // Update state
      setDashboardData({
        members,
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === "active").length,
        pendingApplications: pendingAppsData?.length || 0,
        newApplicationsThisMonth: newAppsData || 0,
        totalPaymentsAmount: paymentStats.total_amount || 0,
        newPaymentsThisMonth: paymentStats.new_payments || 0,
        renewalsThisMonth: paymentStats.renewals || 0,
        upgradesThisMonth: paymentStats.upgrades || 0,
        totalSubscribers: subscribersData?.length || 0,
        newSubscribersThisMonth: newSubsData || 0,
      });

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    ...dashboardData,
    loading,
    error,
    refreshAll: fetchDashboardData
  };
};