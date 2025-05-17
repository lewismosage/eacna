import { useState } from 'react';
import { 
  Users, 
  FileText, 
  UserPlus,
  CreditCard,
  RefreshCw,
  Mail
} from 'lucide-react';
import MemberEngagement from './MemberEngagement';
import Card, { CardContent } from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [stats] = useState({
    totalMembers: 245,
    activeMembers: 198,
    pendingApplications: 12,
    pendingRenewals: 8,
    pendingUpgrade: 4,
    paymentsmade: 12450,
    pendingPublications: 7,
    unreadMessages: 15,
    newsletterSubscribers: 567,
    paymentsMade: 12450,
  });

  const [loading] = useState(false); 

  const recentActivities = [
    {
      id: 1,
      type: 'member_application',
      title: 'New Member Application',
      description: 'Dr. Sarah Mwangi submitted a membership application',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'renewal',
      title: 'Membership Renewal',
      description: 'Dr. James Okello renewed their membership',
      time: '3 hours ago'
    },
    {
      id: 3,
      type: 'publication',
      title: 'New Publication Submission',
      description: 'Research paper submitted for review',
      time: '5 hours ago'
    }
  ];

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
        <p className="text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.totalMembers}</p>
              <p className="text-sm text-gray-500">{stats.activeMembers} active</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-secondary-100 p-3">
              <UserPlus className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingApplications}</p>
              <p className="text-sm text-gray-500">+5 new applications this month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-accent-100 p-3">
              <CreditCard className="h-6 w-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Payments Made</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.paymentsmade.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'KSH',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </p>
              <p className="text-sm text-gray-500">+18 new payments this month</p>
              <p className="text-sm text-gray-500">{stats.pendingRenewals} renewals & {stats.pendingUpgrade} upgrade</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full bg-green-100 p-3">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Newsletter Subscribers</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.newsletterSubscribers}</p>
              <p className="text-sm text-green-600">+23 this month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'member_application' && (
                      <UserPlus className="h-5 w-5 text-primary-600" />
                    )}
                    {activity.type === 'renewal' && (
                      <RefreshCw className="h-5 w-5 text-secondary-600" />
                    )}
                    {activity.type === 'publication' && (
                      <FileText className="h-5 w-5 text-accent-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <section>
        <MemberEngagement />
      </section>
      </div>
    </div>
  );
};

export default AdminDashboard;