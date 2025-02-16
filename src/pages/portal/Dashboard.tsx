import React, { useEffect, useState } from "react";
import {
  Calendar,
  FileText,
  Users,
  Award,
  BookOpen,
  Settings,
  Folder,
} from "lucide-react";
import { supabase } from "../../../supabaseClient";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { icon: FileText, label: "My Documents", href: "/portal/documents" },
  { icon: Award, label: "Certifications", href: "/portal/certifications" },
  { icon: BookOpen, label: "Learning", href: "/portal/learning" },
];

const quickAccessLinks = [
  { label: "Research Library", href: "/portal/research-library" },
  { label: "Resource Sharing", href: "/portal/resource-sharing" },
];

interface User {
  user_metadata: {
    full_name: string;
  };
}

interface Project {
  title: string;
  status: string;
  deadline: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user data:", error);
      } else {
        setUser({
          user_metadata: {
            full_name: userData.user.user_metadata.full_name,
          },
        });
      }
    };

    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .limit(3);
      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        setProjects(data);
      }
    };

    fetchUser();
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Welcome back, {user ? user.user_metadata.full_name : "User"}!
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
          {/* My Projects */}
          <div
            className="bg-white rounded-lg shadow cursor-pointer"
            onClick={() => navigate("/portal/myprojects")}
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                My Projects
              </h3>
              <div className="space-y-4">
                {projects.length > 0 ? (
                  projects.map((project, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <span className="text-gray-600">{project.title}</span>
                        <span className="block text-sm text-gray-500">
                          {project.status}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {project.deadline}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No projects available</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Access Links */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Access
              </h3>
              <div className="space-y-4">
                {quickAccessLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="block text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 grid-cols-1 lg:grid-cols-2"></div>

        {/* Research Container */}
        <div className="mt-8">
          <a
            href="/research"
            className="block bg-blue-600 text-white text-center py-4 rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            Go to Articles & Resources
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
