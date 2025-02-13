import React from "react";
import {
  Calendar,
  FileText,
  Users,
  Award,
  BookOpen,
  Settings,
} from "lucide-react";

const menuItems = [
  { icon: FileText, label: "My Documents", href: "/portal/documents" },
  { icon: Calendar, label: "My Events", href: "/portal/events" },
  { icon: Users, label: "Network", href: "/portal/network" },
  { icon: Award, label: "Certifications", href: "/portal/certifications" },
  { icon: BookOpen, label: "Learning", href: "/portal/learning" },
  { icon: Settings, label: "Settings", href: "/portal/settings" },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Welcome back, Dr. Sarah
            </h2>
          </div>
        </div>

        <div className="mt-8 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className="bg-white overflow-hidden rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.label}
                      </h3>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <div className="mt-8 grid gap-8 grid-cols-1 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {[
                  {
                    action: "Registered for Annual Conference",
                    date: "2 days ago",
                  },
                  { action: "Completed Epilepsy Course", date: "1 week ago" },
                  { action: "Updated Profile", date: "2 weeks ago" },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-600">{activity.action}</span>
                    <span className="text-sm text-gray-500">
                      {activity.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Upcoming Events
              </h3>
              <div className="space-y-4">
                {[
                  { title: "Annual Conference", date: "June 15-17, 2024" },
                  { title: "Research Symposium", date: "July 8, 2024" },
                  { title: "Workshop Series", date: "August 22-23, 2024" },
                ].map((event, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-600">{event.title}</span>
                    <span className="text-sm text-gray-500">{event.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
