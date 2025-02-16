import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FileText, Calendar, Settings, LogOut } from "lucide-react";
import { RequireAuth } from "../../components/admin/RequireAuth";

const sidebarItems = [
  { icon: FileText, label: "Manage Resources", path: "/admin/resources" },
  { icon: Calendar, label: "Manage Events", path: "/admin/events" },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear authentication (adjust as needed for your auth logic)
    localStorage.removeItem("authToken");
    
    // Redirect to the admin login page
    navigate("/admin/login");
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-100 pt-16">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-lg flex flex-col justify-between">
            <div>
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Settings className="h-8 w-8 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">Admin Panel</span>
                </div>
              </div>
              <nav className="mt-6">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-6 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                        isActive ? "bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="flex items-center px-6 py-4 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
