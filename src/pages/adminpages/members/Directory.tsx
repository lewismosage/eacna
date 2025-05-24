// components/admin/AdminMembershipDirectory.tsx
import { useState, useEffect } from "react";
import {
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  FileText,
  UserPlus,
  Trash2,
} from "lucide-react";
import Card from "../../../components/common/Card";
import { createClient } from "@supabase/supabase-js";
import { MembershipTier, membershipTiers } from "../../../types/membership";

// Define the Member interface
interface Member {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  membership_type: MembershipTier;
  member_since: string;
  expiry_date: string;
  status: "active" | "expired";
  institution: string;
  nationality?: string;
  country_of_residence?: string;
  current_profession: string;
}

// Define the status options
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
] as const;

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to format date string
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

// Calculate days until expiry
const getDaysUntilExpiry = (expiryDate: string) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const MembershipStatusBadge = ({ status }: { status: Member["status"] }) => {
  const bgColor = status === "active" ? "bg-green-100" : "bg-red-100";
  const textColor = status === "active" ? "text-green-800" : "text-red-800";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ExpiryBadge = ({ expiryDate }: { expiryDate: string }) => {
  const daysUntil = getDaysUntilExpiry(expiryDate);

  if (daysUntil < 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Expired
      </span>
    );
  } else if (daysUntil <= 30) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        {daysUntil} days left
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        {daysUntil} days left
      </span>
    );
  }
};

const MembershipTypeLabel = ({ type }: { type: MembershipTier }) => {
  const membershipType = membershipTiers[type];
  return membershipType ? membershipType.name : type;
};

type SortableMemberKeys =
  | "first_name"
  | "last_name"
  | "email"
  | "membership_type"
  | "member_since"
  | "expiry_date"
  | "status";

const AdminMembershipDirectory = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembershipType, setSelectedMembershipType] = useState<
    MembershipTier | ""
  >("");
  const [selectedStatus, setSelectedStatus] = useState<
    "active" | "expired" | ""
  >("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortableMemberKeys;
    direction: "ascending" | "descending";
  } | null>(null);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [dropdownMenu, setDropdownMenu] = useState<string | null>(null);

  // Fetch members from Supabase
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);

        // Get completed payments for membership applications or renewals
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("*")
          .eq("status", "completed")
          .in("payment_type", ["application", "renewal"])
          .order("verified_at", { ascending: false });

        if (paymentsError) throw paymentsError;

        // Then get the associated membership applications
        const userIds = paymentsData.map((payment) => payment.user_id);
        const { data: applicationsData, error: applicationsError } =
          await supabase
            .from("membership_applications")
            .select("*")
            .in("user_id", userIds);

        if (applicationsError) throw applicationsError;

        // Combine the data
        const transformedData = paymentsData.map((payment): Member => {
          const application = applicationsData.find(
            (app) => app.user_id === payment.user_id
          );
          const expiryDate = new Date(payment.verified_at);
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          const status: "active" | "expired" =
            new Date() > expiryDate ? "expired" : "active";

          return {
            id: payment.id,
            user_id: payment.user_id,
            first_name: application?.first_name || "",
            last_name: application?.last_name || "",
            email: application?.email || "",
            phone: application?.phone || "",
            membership_type:
              (application?.membership_type as MembershipTier) || "ordinary",
            member_since: payment.verified_at,
            expiry_date: expiryDate.toISOString(),
            status: status,
            institution: application?.institution || "",
            nationality: application?.nationality,
            country_of_residence: application?.country_of_residence,
            current_profession: application?.current_profession || "",
          };
        });

        setMembers(transformedData);
        setFilteredMembers(transformedData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch members"
        );
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    if (loading) return;

    let result = [...members];

    // Apply search
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (member) =>
          member.first_name.toLowerCase().includes(lowercasedSearch) ||
          member.last_name.toLowerCase().includes(lowercasedSearch) ||
          member.email.toLowerCase().includes(lowercasedSearch) ||
          member.institution.toLowerCase().includes(lowercasedSearch)
      );
    }

    // Apply membership type filter
    if (selectedMembershipType) {
      result = result.filter(
        (member) => member.membership_type === selectedMembershipType
      );
    }

    // Apply status filter
    if (selectedStatus) {
      result = result.filter((member) => member.status === selectedStatus);
    }

    // Apply sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle cases where values might be undefined
        if (aValue == null && bValue == null) return 0;
        if (aValue == null)
          return sortConfig.direction === "ascending" ? 1 : -1;
        if (bValue == null)
          return sortConfig.direction === "ascending" ? -1 : 1;

        // For date fields, convert to Date objects for proper comparison
        if (
          sortConfig.key === "member_since" ||
          sortConfig.key === "expiry_date"
        ) {
          const aDate = new Date(aValue as string);
          const bDate = new Date(bValue as string);
          if (aDate < bDate) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (aDate > bDate) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        }

        // For all other fields
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredMembers(result);
  }, [
    members,
    searchTerm,
    selectedMembershipType,
    selectedStatus,
    sortConfig,
    loading,
  ]);

  // Update the requestSort function to use the new type
  const requestSort = (key: SortableMemberKeys) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Get sorting icon
  const getSortIcon = (key: SortableMemberKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  // Handle dropdown menu toggle
  const toggleDropdownMenu = (memberId: string) => {
    if (dropdownMenu === memberId) {
      setDropdownMenu(null);
    } else {
      setDropdownMenu(memberId);
    }
  };

  // Handle member details toggle
  const toggleMemberDetails = (memberId: string) => {
    if (expandedMember === memberId) {
      setExpandedMember(null);
    } else {
      setExpandedMember(memberId);
    }
  };

  // Export members list as CSV
  const exportMembersCSV = () => {
    // In a real application, you would generate and download a CSV file
    console.log("Exporting members as CSV");
    alert("Exporting members as CSV");
  };

  // Add loading and error states
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Membership Directory
        </h1>
      </div>

      {/* Filters section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search members..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="md:w-48">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              value={selectedMembershipType}
              onChange={(e) =>
                setSelectedMembershipType(e.target.value as MembershipTier)
              }
            >
              <option value="">All membership types</option>
              {Object.entries(membershipTiers).map(([value, tier]) => (
                <option key={value} value={value}>
                  {tier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:w-40">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as "active" | "expired")
              }
            >
              <option value="">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              onClick={exportMembersCSV}
            >
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Members table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("last_name")}
                >
                  <div className="flex items-center">
                    <span>Member</span>
                    <div className="ml-1">{getSortIcon("last_name")}</div>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("membership_type")}
                >
                  <div className="flex items-center">
                    <span>Membership Type</span>
                    <div className="ml-1">{getSortIcon("membership_type")}</div>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("member_since")}
                >
                  <div className="flex items-center">
                    <span>Member Since</span>
                    <div className="ml-1">{getSortIcon("member_since")}</div>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("expiry_date")}
                >
                  <div className="flex items-center">
                    <span>Expiry Date</span>
                    <div className="ml-1">{getSortIcon("expiry_date")}</div>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("status")}
                >
                  <div className="flex items-center">
                    <span>Status</span>
                    <div className="ml-1">{getSortIcon("status")}</div>
                  </div>
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
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <>
                    <tr
                      key={member.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleMemberDetails(member.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-emerald-800 font-medium">
                              {member.first_name.charAt(0)}
                              {member.last_name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.first_name} {member.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <MembershipTypeLabel type={member.membership_type} />
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.country_of_residence ||
                            member.nationality ||
                            "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(member.member_since)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(member.expiry_date)}
                        </div>
                        <ExpiryBadge expiryDate={member.expiry_date} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <MembershipStatusBadge status={member.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div
                          className="relative inline-block text-left"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="inline-flex justify-center w-full rounded-md px-2 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdownMenu(member.id);
                            }}
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>

                          {dropdownMenu === member.id && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                              <div className="py-1">
                                <button
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alert(
                                      `View ${member.first_name}'s details`
                                    );
                                  }}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Details
                                </button>
                                <button
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alert(
                                      `Edit ${member.first_name}'s profile`
                                    );
                                  }}
                                >
                                  <svg
                                    className="h-4 w-4 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                  </svg>
                                  Edit Profile
                                </button>
                                <button
                                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100 w-full text-left"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alert(
                                      `Delete ${member.first_name}'s profile`
                                    );
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded member details */}
                    {expandedMember === member.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                Contact Information
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Phone: {member.phone}
                              </p>
                              <p className="text-sm text-gray-600">
                                Email: {member.email}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                Professional Details
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Institution: {member.institution}
                              </p>
                              <p className="text-sm text-gray-600">
                                Profession: {member.current_profession}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                Membership Details
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Type:{" "}
                                <MembershipTypeLabel
                                  type={member.membership_type}
                                />
                              </p>
                              <p className="text-sm text-gray-600">
                                Valid from: {formatDate(member.member_since)} to{" "}
                                {formatDate(member.expiry_date)}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No members found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{filteredMembers.length}</span> of{" "}
                <span className="font-medium">{filteredMembers.length}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  aria-current="page"
                  className="z-10 bg-emerald-50 border-emerald-500 text-emerald-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  1
                </button>
                <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  2
                </button>
                <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  3
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Membership statistics cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center space-x-4">
            <UserPlus className="h-6 w-6 text-emerald-600" />
            <div>
              <div className="text-lg font-semibold">{members.length}</div>
              <div className="text-sm text-gray-500">Total Members</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <div className="text-lg font-semibold">
                {members.filter((m) => m.status === "active").length}
              </div>
              <div className="text-sm text-gray-500">Active Members</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <div className="text-lg font-semibold">
                {
                  members.filter((m) => {
                    const daysUntil = getDaysUntilExpiry(m.expiry_date);
                    return daysUntil > 0 && daysUntil <= 30;
                  }).length
                }
              </div>
              <div className="text-sm text-gray-500">
                Expiring Soon (≤30 days)
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <div className="text-lg font-semibold">
                {members.filter((m) => m.status === "expired").length}
              </div>
              <div className="text-sm text-gray-500">Expired Members</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Membership type distribution chart */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Membership Type Distribution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="h-64">
              {/* In a real app, you would use a charting library like Chart.js or Recharts */}
              <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">
                  Pie chart visualization of membership types
                </p>
              </div>
            </div>
          </div>
          <div>
            <ul className="divide-y divide-gray-200">
              {Object.entries(membershipTiers).map(([value, tier]) => {
                const count = members.filter(
                  (m) => m.membership_type === value
                ).length;
                const percentage = (count / members.length) * 100;

                return (
                  <li key={value} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span
                          className="w-3 h-3 rounded-full mr-3"
                          style={{
                            backgroundColor: tier.color || "#10B981",
                          }}
                        ></span>
                        <span className="text-sm font-medium text-gray-900">
                          {tier.name}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">
                          {count}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: tier.color || "#10B981",
                        }}
                      ></div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMembershipDirectory;
