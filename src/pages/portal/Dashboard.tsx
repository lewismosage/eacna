import React, { useEffect, useState } from "react";
import {
  Calendar,
  FileText,
  Users,
  Award,
  LogOut,
} from "lucide-react";
import { supabase } from "../../../supabaseClient";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { icon: FileText, label: "My Documents", href: "/portal/documents" },
  { icon: Award, label: "Certifications", href: "/portal/certifications" },
];

const quickAccessLinks = [
  { label: "Research Library", href: "/portal/research-library" },
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
  const [showLibrary, setShowLibrary] = useState(false);
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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Welcome back, {user ? user.user_metadata.full_name : "User"}!
            </h2>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut className="mr-2 h-5 w-5" /> Log Out
          </button>
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
                  <button
                    key={index}
                    onClick={() => setShowLibrary(true)}
                    className="block text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showLibrary && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Top Neurology Research Libraries
              </h3>
              <ul className="space-y-2">
                <li>
                  <strong>Johns Hopkins University</strong> –{" "}
                  <a
                    href="https://guides.library.jhu.edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Visit Guide
                  </a>
                </li>
                <li>
                  <strong>Yale University</strong> –{" "}
                  <a
                    href="https://guides.library.yale.edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Visit Guide
                  </a>
                </li>
                <li>
                  <strong>Mayo Clinic Libraries</strong> –{" "}
                  <a
                    href="https://libraryguides.mayo.edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Visit Guide
                  </a>
                </li>
                <li>
                  <strong>University of Miami</strong> –{" "}
                  <a
                    href="https://guides.library.miami.edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Visit Guide
                  </a>
                </li>
                <li>
                  <strong>University of Chicago</strong> –{" "}
                  <a
                    href="https://guides.lib.uchicago.edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Visit Guide
                  </a>
                </li>
              </ul>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowLibrary(false)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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