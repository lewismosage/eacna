import { useState } from "react";
import {
  Users,
  UserPlus,
  CreditCard,
  RefreshCw,
  Mail,
} from "lucide-react";
import MemberEngagement from "./MemberEngagement";
import RecentActivity from "./RecentActivity";
import Card, { CardContent } from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useDashboardData } from "../../hooks/dashboardstats";

const AdminDashboard = () => {
  const {
    totalMembers,
    activeMembers,
    pendingApplications,
    newApplicationsThisMonth,
    totalPaymentsAmount,
    newPaymentsThisMonth,
    renewalsThisMonth,
    upgradesThisMonth,
    totalSubscribers,
    newSubscribersThisMonth,
    loading,
    refreshAll,
  } = useDashboardData();

  const [stats] = useState({
    pendingRenewals: 8,
    pendingUpgrade: 4,
    paymentsmade: 12450,
    pendingPublications: 7,
    unreadMessages: 15,
    newsletterSubscribers: 567,
    paymentsMade: 12450,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex items-center">
          <p className="text-gray-500 mr-4">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <button
            onClick={refreshAll}
            className="text-gray-500 hover:text-gray-700 flex items-center"
            title="Refresh data"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-primary-100 p-3">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalMembers}
              </p>
              <p className="text-sm text-gray-500">{activeMembers} active</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-secondary-100 p-3">
              <UserPlus className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Pending Applications
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {pendingApplications}
              </p>
              <p className="text-sm text-gray-500">
                +{newApplicationsThisMonth} new applications this month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-accent-100 p-3">
              <CreditCard className="h-6 w-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Payments Received
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalPaymentsAmount.toLocaleString("en-US", {
                  style: "currency",
                  currency: "KSH",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-sm text-gray-500">
                +{newPaymentsThisMonth} new payments this month
              </p>
              <p className="text-sm text-gray-500">
                {renewalsThisMonth} renewals & {upgradesThisMonth} upgrades
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-green-100 p-3">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Newsletter Subscribers
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalSubscribers}
              </p>
              <p className="text-sm text-green-600">
                +{newSubscribersThisMonth} this month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <MemberEngagement />
      </div>
    </div>
  );
};

export default AdminDashboard;