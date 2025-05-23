// components/admin/Applications.tsx
import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Check,
  X,
  ArrowUpDown,
} from "lucide-react";
import Card, { CardContent } from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Application status types
// Application status types
type ApplicationStatus = "pending" | "approved" | "rejected";

// Application data structure based on your MembershipForm
interface Application {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipType: string;
  nationality: string;
  currentProfession: string;
  institution: string;
  submittedAt: string; // ISO date string
  status: ApplicationStatus;
}

const Applications = () => {
  // State for applications data
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    Application[]
  >([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all"
  );
  const [membershipFilter, setMembershipFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Application | null;
    direction: "ascending" | "descending";
  }>({ key: "submittedAt", direction: "descending" });

  // State for selected application to view details
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  // Mock data - in a real application, this would come from an API
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("membership_applications")
          .select(
            `
            id,
            first_name,
            last_name,
            email,
            phone,
            membership_type,
            nationality,
            current_profession,
            institution,
            created_at,
            status
          `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        setApplications(
          data.map((app) => ({
            id: app.id,
            firstName: app.first_name,
            lastName: app.last_name,
            email: app.email,
            phone: app.phone,
            membershipType: app.membership_type,
            nationality: app.nationality,
            currentProfession: app.current_profession,
            institution: app.institution,
            submittedAt: app.created_at,
            status: app.status,
          }))
        );
      } catch (err) {
        console.error("Error fetching applications:", err);
        // Handle error
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...applications];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((app) => app.status === statusFilter);
    }

    // Apply membership type filter
    if (membershipFilter !== "all") {
      result = result.filter((app) => app.membershipType === membershipFilter);
    }

    // Apply search
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (app) =>
          app.firstName.toLowerCase().includes(lowerCaseSearchTerm) ||
          app.lastName.toLowerCase().includes(lowerCaseSearchTerm) ||
          app.email.toLowerCase().includes(lowerCaseSearchTerm) ||
          app.institution.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Apply sorting
    if (sortConfig.key !== null) {
      result.sort((a, b) => {
        const key = sortConfig.key as keyof Application;
        if (a[key] < b[key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[key] > b[key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredApplications(result);
  }, [applications, searchTerm, statusFilter, membershipFilter, sortConfig]);

  // Handle sorting column click
  const handleSort = (key: keyof Application) => {
    let direction: "ascending" | "descending" = "ascending";

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    setSortConfig({ key, direction });
  };

  // Handle status change
  const handleStatusChange = async (
    id: string,
    newStatus: ApplicationStatus
  ) => {
    try {
      const { data, error } = await supabase
        .from("membership_applications")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      const updatedApplications = applications.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app
      );

      setApplications(updatedApplications);

      if (selectedApplication && selectedApplication.id === id) {
        setSelectedApplication({
          ...selectedApplication,
          status: newStatus,
        });
      }
    } catch (err) {
      console.error("Error updating application status:", err);
      // Show error to user
    }
  };

  // Handle view application
  const handleViewApplication = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("membership_applications")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setSelectedApplication({
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        membershipType: data.membership_type,
        nationality: data.nationality,
        currentProfession: data.current_profession,
        institution: data.institution,
        submittedAt: data.created_at,
        status: data.status,
        // Add other fields as needed
      });
    } catch (err) {
      console.error("Error fetching application details:", err);
      // Handle error
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status color class
  const getStatusClass = (status: ApplicationStatus) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Update the getMembershipLabel helper function to show "Full Member" for "ordinary"
  const getMembershipLabel = (type: string) => {
    if (type === "ordinary") return "Full Member";
    // Add more mappings if needed
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Handle export to CSV
  const handleExport = () => {
    // In a real app, this would generate and download a CSV file
    alert("Export functionality would be implemented here");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-800">
          Membership Applications
        </h1>
        <Button onClick={handleExport} className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            {/* Search box */}
            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">Filters:</span>
              </div>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ApplicationStatus | "all")
                }
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={membershipFilter}
                onChange={(e) => setMembershipFilter(e.target.value)}
              >
                <option value="all">All Memberships</option>
                <option value="ordinary">Full Member</option>
                <option value="associate">Associate</option>
                <option value="student">Student</option>
                <option value="institutional">Institutional</option>
                <option value="honorary">Honorary</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {filteredApplications.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500">
                    No applications found matching your filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("lastName")}
                        >
                          <div className="flex items-center">
                            Name
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("membershipType")}
                        >
                          <div className="flex items-center">
                            Membership Type
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Profession
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("submittedAt")}
                        >
                          <div className="flex items-center">
                            Submitted On
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredApplications.map((application) => (
                        <tr key={application.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {application.firstName} {application.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 capitalize">
                              {getMembershipLabel(application.membershipType)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {application.currentProfession}
                            </div>
                            <div className="text-xs text-gray-500">
                              {application.institution}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(application.submittedAt)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                                application.status
                              )}`}
                            >
                              {application.status.charAt(0).toUpperCase() +
                                application.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() =>
                                  handleViewApplication(application.id)
                                }
                                className="text-primary-600 hover:text-primary-900"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              {application.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(
                                        application.id,
                                        "approved"
                                      )
                                    }
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <Check className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(
                                        application.id,
                                        "rejected"
                                      )
                                    }
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-primary-800">
                Application Details
              </h3>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Personal Information
                </h4>
                <p className="font-semibold text-lg">
                  {selectedApplication.firstName} {selectedApplication.lastName}
                </p>
                <p className="text-gray-600">
                  Email: {selectedApplication.email}
                </p>
                <p className="text-gray-600">
                  Phone: {selectedApplication.phone}
                </p>
                <p className="text-gray-600">
                  Nationality:{" "}
                  <span className="capitalize">
                    {selectedApplication.nationality}
                  </span>
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Application Details
                </h4>
                <p className="text-gray-600">
                  Membership Type:{" "}
                  <span className="capitalize">
                    {getMembershipLabel(selectedApplication.membershipType)}
                  </span>
                </p>
                <p className="text-gray-600">
                  Submitted On: {formatDate(selectedApplication.submittedAt)}
                </p>
                <p className="text-gray-600">
                  Current Status:
                  <span
                    className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                      selectedApplication.status
                    )}`}
                  >
                    {selectedApplication.status.charAt(0).toUpperCase() +
                      selectedApplication.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Professional Information
              </h4>
              <p className="text-gray-800">
                Current Profession: {selectedApplication.currentProfession}
              </p>
              <p className="text-gray-800">
                Institution: {selectedApplication.institution}
              </p>
            </div>

            {/* We would show more fields here in a real application */}

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </Button>

              {selectedApplication.status === "pending" && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      handleStatusChange(selectedApplication.id, "rejected");
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleStatusChange(selectedApplication.id, "approved");
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
