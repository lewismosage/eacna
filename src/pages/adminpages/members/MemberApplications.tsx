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
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  FileText,
  ShieldCheck,
} from "lucide-react";
import Card, { CardContent } from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import { createClient } from "@supabase/supabase-js";
import emailjs from "@emailjs/browser";
import AlertModal from "../../../components/common/AlertModal";
import Badge from "../.././../components/common/Badge";
import { format } from "date-fns";

// Initialize emailjs
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

type ApplicationStatus = "pending" | "approved" | "rejected";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

interface Application {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  medical_registration_number: string;
  profession: string;
  specialization: string;
  years_of_experience: number;
  current_employer: string;
  country: string;
  highest_qualification: string;
  institution_attended: string;
  year_of_graduation: string;
  credentials: string[];
  license_expiry_date: string;
  agree_to_ethics: boolean;
  consent_to_data_processing: boolean;
  application_date: string;
  application_status: ApplicationStatus;
  user_id?: string;
  membership_tier: string;
}

const professions = [
  "Doctor",
  "Nurse",
  "Surgeon",
  "Pharmacist",
  "Neurologist",
  "Lab Technician",
  "Radiologist",
  "Dentist",
  "General Practitioner",
];

const qualifications = [
  "MBChB",
  "MD",
  "BSc Nursing",
  "PharmD",
  "BSc Medicine",
  "MSc Medicine",
  "PhD",
  "Diploma in Clinical Medicine",
];

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    Application[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all"
  );
  const [professionFilter, setProfessionFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Application;
    direction: "ascending" | "descending";
  }>({ key: "application_date", direction: "descending" });
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  interface AlertState {
    open: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "confirm";
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    customContent?: React.ReactNode;
  }

  const [alert, setAlert] = useState<AlertState>({
    open: false,
    title: "",
    message: "",
    type: "info",
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [membershipTierFilter, setMembershipTierFilter] =
    useState<string>("all");

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("membership_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setApplications(data);
        setFilteredApplications(data);

        // Calculate stats
        setStats({
          total: data.length,
          pending: data.filter((app) => app.application_status === "pending")
            .length,
          approved: data.filter((app) => app.application_status === "approved")
            .length,
          rejected: data.filter((app) => app.application_status === "rejected")
            .length,
        });
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setNotification({
        type: "error",
        message: "Failed to load applications. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...applications];

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (app) => app.application_status === statusFilter
      );
    }

    if (professionFilter !== "all") {
      filtered = filtered.filter((app) => app.profession === professionFilter);
    }

    if (membershipTierFilter !== "all") {
      filtered = filtered.filter(
        (app) => app.membership_tier === membershipTierFilter
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.first_name.toLowerCase().includes(term) ||
          app.last_name.toLowerCase().includes(term) ||
          app.email.toLowerCase().includes(term) ||
          (app.current_employer &&
            app.current_employer.toLowerCase().includes(term)) ||
          (app.medical_registration_number &&
            app.medical_registration_number.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Handle null/undefined values by treating them as empty strings for comparison
        const aValue = a[sortConfig.key] ?? "";
        const bValue = b[sortConfig.key] ?? "";

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredApplications(filtered);
  }, [
    applications,
    searchTerm,
    statusFilter,
    professionFilter,
    membershipTierFilter,
    sortConfig,
  ]);

  const handleSort = (key: keyof Application) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sendApprovalEmail = async (application: Application) => {
    try {
      const templateParams = {
        to_name: `${application.first_name} ${application.last_name}`,
        to_email: application.email,
        subject: `Your EACNA Membership Application Has Been Approved`,
        message: `
          <p>Dear ${application.first_name},</p>
          <p>We are pleased to inform you that your application for ${application.membership_tier} with EACNA has been approved!</p>
          <p>Next steps:</p>
          <ol>
            <li>Complete your membership payment (you will receive payment instructions separately)</li>
            <li>Once payment is confirmed, you will receive your membership details</li>
            <li>Access member resources on our portal</li>
          </ol>
          <p>If you have any questions, please contact us at members@eacna.org.</p>
          <p>Welcome to EACNA!</p>
        `,
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      return true;
    } catch (error) {
      console.error("Error sending approval email:", error);
      return false;
    }
  };

  const sendRejectionEmail = async (
    application: Application,
    reason?: string
  ) => {
    try {
      const templateParams = {
        to_name: `${application.first_name} ${application.last_name}`,
        to_email: application.email,
        subject: `Your EACNA ${application.membership_tier} Membership Application Status`,
        message: `
          <p>Dear ${application.first_name},</p>
          <p>We regret to inform you that your application for ${
            application.profession
          } membership with EACNA could not be approved at this time.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <p>You may reapply after addressing the issues mentioned above.</p>
          <p>If you have any questions, please contact us at members@eacna.org.</p>
        `,
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      return true;
    } catch (error) {
      console.error("Error sending rejection email:", error);
      return false;
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: ApplicationStatus,
    reason?: string
  ) => {
    if (newStatus === "approved") {
      setAlert({
        open: true,
        title: "Approve Application",
        message:
          "This will approve the application and notify the applicant. Continue?",
        type: "confirm",
        confirmText: "Approve",
        cancelText: "Cancel",
        onConfirm: async () => {
          setIsProcessing(true);
          try {
            // Get the application first to access email
            const { data: applicationData } = await supabase
              .from("membership_applications")
              .select("*")
              .eq("id", id)
              .single();

            if (!applicationData) throw new Error("Application not found");

            // Update application status
            const { error } = await supabase
              .from("membership_applications")
              .update({
                application_status: "approved",
                updated_at: new Date().toISOString(),
              })
              .eq("id", id);

            if (error) throw error;

            // If user exists, update their role
            if (applicationData.user_id) {
              const { error: profileError } = await supabase
                .from("profiles")
                .update({ role: "member" })
                .eq("user_id", applicationData.user_id);

              if (profileError) throw profileError;
            }

            // Send approval email
            await sendApprovalEmail({
              ...applicationData,
              application_status: "approved",
            });

            // Refresh applications
            await fetchApplications();

            setNotification({
              type: "success",
              message: "Application approved and applicant notified!",
            });
          } catch (err) {
            console.error("Error approving application:", err);
            setNotification({
              type: "error",
              message: "Failed to approve application. Please try again.",
            });
          } finally {
            setIsProcessing(false);
            setAlert({ ...alert, open: false });
            setSelectedApplication(null);
          }
        },
        onCancel: () => setAlert({ ...alert, open: false }),
      });
    } else {
      // For rejections
      setAlert({
        open: true,
        title: "Reject Application",
        message: "Please provide a reason for rejection (optional):",
        type: "confirm",
        confirmText: "Reject",
        cancelText: "Cancel",
        customContent: (
          <textarea
            className="w-full mt-2 p-2 border border-gray-300 rounded-md"
            placeholder="Reason for rejection..."
            onChange={(e) =>
              setAlert((prev) => ({
                ...prev,
                message:
                  e.target.value ||
                  "Please provide a reason for rejection (optional):",
              }))
            }
          />
        ),
        onConfirm: async () => {
          setIsProcessing(true);
          try {
            const { data: applicationData } = await supabase
              .from("membership_applications")
              .select("*")
              .eq("id", id)
              .single();

            if (!applicationData) throw new Error("Application not found");

            const { error } = await supabase
              .from("membership_applications")
              .update({
                application_status: "rejected",
                updated_at: new Date().toISOString(),
              })
              .eq("id", id);

            if (error) throw error;

            // Send rejection email with reason
            await sendRejectionEmail(
              applicationData,
              alert.message !==
                "Please provide a reason for rejection (optional):"
                ? alert.message
                : undefined
            );

            // Refresh applications
            await fetchApplications();

            setNotification({
              type: "success",
              message: "Application has been rejected and applicant notified.",
            });
          } catch (err) {
            console.error("Error rejecting application:", err);
            setNotification({
              type: "error",
              message: "Failed to reject application. Please try again.",
            });
          } finally {
            setIsProcessing(false);
            setAlert({ ...alert, open: false });
            setSelectedApplication(null);
          }
        },
        onCancel: () => setAlert({ ...alert, open: false }),
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Approved</Badge>;
      case "rejected":
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  const handleExport = async () => {
    try {
      const headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Profession",
        "Membership Tier",
        "Specialization",
        "Current Employer",
        "Years of Experience",
        "Status",
        "Date Submitted",
      ].join(",");

      const csvRows = filteredApplications.map((app) =>
        [
          app.id,
          `"${app.first_name} ${app.last_name}"`,
          app.email,
          app.phone,
          app.profession,
          app.membership_tier,
          app.specialization,
          app.current_employer,
          app.years_of_experience,
          app.application_status,
          formatDate(app.application_date),
        ].join(",")
      );

      const csvContent = [headers, ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `eacna-applications-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotification({
        type: "success",
        message: "Applications exported successfully!",
      });
    } catch (err) {
      console.error("Error exporting data:", err);
      setNotification({
        type: "error",
        message: "Failed to export applications. Please try again.",
      });
    }
  };

  const getPublicUrl = (path: string) => {
    // If the path already starts with http, return it as-is
    if (path.startsWith("http")) {
      return path;
    }

    // Otherwise, construct the proper URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("member-documents").getPublicUrl(path);

    return publicUrl;
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Applications
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Loader2 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <X className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-md flex items-start justify-between mb-4 ${
            notification.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            )}
            <p>{notification.message}</p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <Card className="mb-8">
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Search by name, email, or registration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

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
                value={professionFilter}
                onChange={(e) => setProfessionFilter(e.target.value)}
              >
                <option value="all">All Professions</option>
                {professions.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={membershipTierFilter}
                onChange={(e) => setMembershipTierFilter(e.target.value)}
              >
                <option value="Full">Full Membership</option>
                <option value="Associate">Associate Membership</option>
                <option value="Student">Student Membership</option>
                <option value="Institutional">Institutional Membership</option>
                <option value="Honorary">Honorary Membership</option>
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
                          onClick={() => handleSort("last_name")}
                        >
                          <div className="flex items-center">
                            Name
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Contact
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("profession")}
                        >
                          <div className="flex items-center">
                            Profession
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("application_date")}
                        >
                          <div className="flex items-center">
                            Submitted On
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort("membership_tier")}
                        >
                          <div className="flex items-center">
                            Membership Tier
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
                              {application.first_name} {application.last_name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {application.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {application.profession}
                            </div>
                            <div className="text-xs text-gray-500">
                              {application.specialization}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(application.application_date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {application.membership_tier}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(application.application_status)}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() =>
                                  setSelectedApplication(application)
                                }
                                className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-gray-100"
                                title="View Details"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              {application.application_status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(
                                        application.id,
                                        "approved"
                                      )
                                    }
                                    className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-gray-100"
                                    title="Approve"
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
                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-gray-100"
                                    title="Reject"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() =>
                                  (window.location.href = `mailto:${application.email}`)
                                }
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-gray-100"
                                title="Send Email"
                              >
                                <Mail className="h-5 w-5" />
                              </button>
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto p-6 max-h-[90vh] overflow-y-auto">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Personal Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="font-medium">
                          {selectedApplication.first_name}{" "}
                          {selectedApplication.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Gender</p>
                        <p className="font-medium capitalize">
                          {selectedApplication.gender}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date of Birth</p>
                        <p className="font-medium">
                          {formatDate(selectedApplication.date_of_birth)}
                        </p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium break-all">
                          {selectedApplication.email}
                        </p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium">
                          {selectedApplication.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Professional Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">
                          Registration Number
                        </p>
                        <p className="font-medium">
                          {selectedApplication.medical_registration_number ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Profession</p>
                        <p className="font-medium">
                          {selectedApplication.profession}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Specialization</p>
                        <p className="font-medium">
                          {selectedApplication.specialization}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Years of Experience
                        </p>
                        <p className="font-medium">
                          {selectedApplication.years_of_experience}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Current Employer
                        </p>
                        <p className="font-medium">
                          {selectedApplication.current_employer}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Country</p>
                        <p className="font-medium">
                          {selectedApplication.country}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Membership Tier</p>
                        <p className="font-medium">
                          {selectedApplication.membership_tier}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Education and Certification
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">
                          Highest Qualification
                        </p>
                        <p className="font-medium">
                          {selectedApplication.highest_qualification}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Institution Attended
                        </p>
                        <p className="font-medium">
                          {selectedApplication.institution_attended}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Year of Graduation
                        </p>
                        <p className="font-medium">
                          {selectedApplication.year_of_graduation}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">License Expiry</p>
                        <p className="font-medium">
                          {selectedApplication.license_expiry_date
                            ? formatDate(
                                selectedApplication.license_expiry_date
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedApplication.credentials &&
                  selectedApplication.credentials.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Uploaded Credentials
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="grid grid-cols-1 gap-2">
                          {selectedApplication.credentials.map(
                            (credential, index) => {
                              const url = getPublicUrl(credential);
                              return (
                                <div key={index} className="col-span-1">
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-primary-600 hover:text-primary-800"
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Document {index + 1}
                                  </a>
                                  <p className="text-xs text-gray-500 mt-1 truncate">
                                    {url}
                                  </p>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Compliance
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        {selectedApplication.agree_to_ethics ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                        <span className="ml-2 text-sm">
                          Agreed to Code of Ethics
                        </span>
                      </div>
                      <div className="flex items-center">
                        {selectedApplication.consent_to_data_processing ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                        <span className="ml-2 text-sm">
                          Consent to Data Processing
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Application Status
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <div className="mt-1">
                          {getStatusBadge(
                            selectedApplication.application_status
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Submitted On</p>
                        <p className="font-medium">
                          {formatDate(selectedApplication.application_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  (window.location.href = `mailto:${selectedApplication.email}`)
                }
                className="flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Applicant
              </Button>

              {selectedApplication.application_status === "pending" && (
                <>
                  <Button
                    variant="danger"
                    onClick={() =>
                      handleStatusChange(selectedApplication.id, "rejected")
                    }
                    disabled={isProcessing}
                    className="flex items-center"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() =>
                      handleStatusChange(selectedApplication.id, "approved")
                    }
                    disabled={isProcessing}
                    className="flex items-center"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alert.open}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
        onClose={() => setAlert({ ...alert, open: false })}
      />
    </div>
  );
};

export default Applications;
