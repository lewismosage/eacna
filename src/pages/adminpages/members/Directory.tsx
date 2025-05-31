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
  X,
  Check,
  AlertCircle,
  Mail,
  User,
  Briefcase,
  CreditCard,
  Calendar,
  Flag,
  MapPin,
  BookOpen,
  GraduationCap,
  Building,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import { MembershipTier, membershipTiers } from "../../../types/membership";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

interface Member {
  id: string;
  user_id: string;
  first_name: string;        // From applications
  last_name: string;         // From applications
  email: string;             // From applications
  phone: string;             // From applications
  membership_type: MembershipTier; // From payments or applications
  membership_id: string;     // From payments
  member_since: string;      // From payments or applications
  expiry_date: string;       // From payments
  status: "active" | "expired"; // Calculated from expiry_date
  institution: string;       // From applications (current_employer)
  nationality?: string;      // From applications (country)
  country_of_residence?: string; // From applications (country)
  current_profession: string; // From applications (profession)
}

interface ApplicationDetails {
  id: string;
  user_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender?: string;
  nationality?: string;
  country_of_residence?: string;
  email: string;
  phone: string;
  id_number?: string;
  membership_type: MembershipTier;
  membership_id?: string;
  current_profession?: string;
  institution?: string;
  work_address?: string;
  registration_number?: string;
  highest_degree?: string;
  university?: string;
  created_at: string;
}

interface PaymentDetails {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_type: string;
  status: string;
  verified_at: string;
  expiry_date: string;
  membership_type: string;
  membership_number: string;
}

// Add the Payment interface that was missing
interface Payment {
  id: string;
  user_id: string;
  status: string;
  verified_at: string;
  membership_tier: MembershipTier;
  membership_id: string;
  expiry_date: string;
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
] as const;

type SortableMemberKeys =
  | "first_name"
  | "last_name"
  | "email"
  | "membership_type"
  | "member_since"
  | "expiry_date"
  | "status";

const formatDate = (dateStr: string) => {
  return format(new Date(dateStr), "MMM dd, yyyy");
};

const getDaysUntilExpiry = (expiryDate: string) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const MembershipStatusBadge = ({
  status,
  expiryDate,
}: {
  status: Member["status"];
  expiryDate: string;
}) => {
  const isExpired = new Date(expiryDate) < new Date();

  if (isExpired) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Expired
      </span>
    );
  }

  const bgColor = status === "active" ? "bg-green-100" : "bg-yellow-100";
  const textColor = status === "active" ? "text-green-800" : "text-yellow-800";

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
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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

  // Fallback for unknown membership types
  if (!membershipType) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {type} {/* Display the type if it's unknown */}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${membershipType.color}20`, // Lighten the color for background
        color: membershipType.color,
      }}
    >
      {membershipType.name}
    </span>
  );
};

const Directory = () => {
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
  const [selectedMember, setSelectedMember] = useState<{
    member: Member | null;
    applicationDetails: ApplicationDetails | null;
    paymentDetails: PaymentDetails | null;
  }>({
    member: null,
    applicationDetails: null,
    paymentDetails: null,
  });
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      // Directly query the membership_directory table
      const { data: directoryData, error } = await supabase
        .from('membership_directory')
        .select('*')
        .order('member_since', { ascending: false });
  
      if (error) throw error;
  
      const transformedData = directoryData.map((member): Member => ({
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
      }));
  
      setMembers(transformedData);
      setFilteredMembers(transformedData);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (loading) return;

    let result = [...members];

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

    if (selectedMembershipType) {
      result = result.filter(
        (member) => member.membership_type === selectedMembershipType
      );
    }

    if (selectedStatus) {
      result = result.filter((member) => member.status === selectedStatus);
    }

    if (sortConfig !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null)
          return sortConfig.direction === "ascending" ? 1 : -1;
        if (bValue == null)
          return sortConfig.direction === "ascending" ? -1 : 1;

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

  const handleViewDetails = async (member: Member) => {
    setSelectedMember({
      member,
      applicationDetails: null,
      paymentDetails: null,
    });
    setIsLoadingDetails(true);

    try {
      // Get all payments for this user (sorted by verification date)
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", member.user_id)
        .order("verified_at", { ascending: false });

      if (paymentError) throw paymentError;

      // Get application details
      const { data: applicationData, error: applicationError } = await supabase
        .from("membership_applications")
        .select("*")
        .eq("user_id", member.user_id)
        .single();

      // Process payment data
      const paymentDetails =
        paymentData.length > 0
          ? {
              id: paymentData[0].id,
              transaction_id: paymentData[0].transaction_id,
              amount: paymentData[0].amount,
              currency: paymentData[0].currency,
              payment_method: paymentData[0].payment_method,
              payment_type: paymentData[0].payment_type,
              status: paymentData[0].status,
              verified_at: paymentData[0].verified_at,
              expiry_date: paymentData[0].expiry_date,
              membership_type: paymentData[0].membership_tier,
              membership_number: paymentData[0].membership_id,
            }
          : null;

      // Process application data if exists
      const applicationDetails = applicationData
      ? {
          id: applicationData.id,
          user_id: applicationData.user_id,
          first_name: applicationData.first_name,
          middle_name: applicationData.middle_name || undefined,
          last_name: applicationData.last_name,
          gender: applicationData.gender || undefined,
          nationality: applicationData.country || undefined,
          country_of_residence: applicationData.country || undefined,
          email: applicationData.email,
          phone: applicationData.phone,
          id_number: applicationData.national_id || undefined,
          membership_type: applicationData.membership_tier,
          membership_id: paymentDetails?.membership_number || undefined,
          current_profession: applicationData.profession || undefined,
          institution: applicationData.current_employer || undefined,
          work_address: applicationData.residential_address || undefined,
          registration_number: applicationData.medical_registration_number || undefined,
          highest_degree: applicationData.highest_qualification || undefined,
          university: applicationData.institution_attended || undefined,
          created_at: applicationData.created_at
        }
      : null;

        setSelectedMember({
          member,
          applicationDetails,
          paymentDetails,
        });
    } catch (err) {
      console.error("Error fetching details:", err);
      setError("Failed to load member details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const exportMembersCSV = () => {
    const headers = [
      "Membership Number",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Membership Type",
      "Member Since",
      "Expiry Date",
      "Status",
      "Institution",
      "Profession",
      "Nationality",
      "Country of Residence",
    ].join(",");

    const csvRows = members.map((member) =>
      [
        member.membership_id,
        member.first_name,
        member.last_name,
        member.email,
        member.phone,
        membershipTiers[member.membership_type].name,
        formatDate(member.member_since),
        formatDate(member.expiry_date),
        member.status,
        member.institution,
        member.current_profession,
        member.nationality || "",
        member.country_of_residence || "",
      ].join(",")
    );

    const csvContent = [headers, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `eacna-members-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <AlertCircle className="h-5 w-5 text-red-400" />
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
                  <tr key={member.id} className="hover:bg-gray-50">
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
                      <MembershipStatusBadge
                        status={member.status}
                        expiryDate={member.expiry_date}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(member)}
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
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
                  <ChevronDown className="h-5 w-5 rotate-90" />
                </button>
                <button className="z-10 bg-emerald-50 border-emerald-500 text-emerald-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  1
                </button>
                <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  2
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Next</span>
                  <ChevronDown className="h-5 w-5 -rotate-90" />
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
            <Check className="h-6 w-6 text-green-600" />
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
            <AlertCircle className="h-6 w-6 text-yellow-600" />
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
            <X className="h-6 w-6 text-red-600" />
            <div>
              <div className="text-lg font-semibold">
                {members.filter((m) => m.status === "expired").length}
              </div>
              <div className="text-sm text-gray-500">Expired Members</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Membership type distribution */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Membership Type Distribution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="h-64">
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

      {/* Member Details Modal */}
      {selectedMember.member && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Member Details
              </h3>
              <button
                onClick={() =>
                  setSelectedMember({
                    member: null,
                    applicationDetails: null,
                    paymentDetails: null,
                  })
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {isLoadingDetails ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Member Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Member Information
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Name</p>
                          <p className="font-medium">
                            {selectedMember.member.first_name}{" "}
                            {selectedMember.member.last_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium break-all">
                            {selectedMember.member.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-medium">
                            {selectedMember.member.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Nationality</p>
                          <p className="font-medium">
                            {selectedMember.member.nationality || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            Country of Residence
                          </p>
                          <p className="font-medium">
                            {selectedMember.member.country_of_residence ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Professional Information
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Institution</p>
                          <p className="font-medium">
                            {selectedMember.member.institution}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Profession</p>
                          <p className="font-medium">
                            {selectedMember.member.current_profession}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Membership Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Membership Information
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">
                            Membership Number
                          </p>
                          <p className="font-mono font-medium">
                            {selectedMember.member.membership_id}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            Membership Type
                          </p>
                          <p className="font-medium">
                            <MembershipTypeLabel
                              type={selectedMember.member.membership_type}
                            />
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Member Since</p>
                          <p className="font-medium">
                            {formatDate(selectedMember.member.member_since)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Expiry Date</p>
                          <p className="font-medium">
                            {formatDate(selectedMember.member.expiry_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <p className="font-medium">
                            <MembershipStatusBadge
                              status={selectedMember.member.status}
                              expiryDate={selectedMember.member.expiry_date}
                            />
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Expiry Status</p>
                          <p className="font-medium">
                            <ExpiryBadge
                              expiryDate={selectedMember.member.expiry_date}
                            />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  {selectedMember.paymentDetails && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payment Information
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">
                              Transaction ID
                            </p>
                            <p className="font-mono font-medium">
                              {selectedMember.paymentDetails.transaction_id}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="font-medium">
                              {selectedMember.paymentDetails.currency}{" "}
                              {selectedMember.paymentDetails.amount}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Payment Method
                            </p>
                            <p className="font-medium capitalize">
                              {selectedMember.paymentDetails.payment_method}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Payment Status
                            </p>
                            <p className="font-medium capitalize">
                              {selectedMember.paymentDetails.status}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Verification Date
                            </p>
                            <p className="font-medium">
                              {formatDate(
                                selectedMember.paymentDetails.verified_at
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
              <Button
                variant="outline"
                onClick={() =>
                  setSelectedMember({
                    member: null,
                    applicationDetails: null,
                    paymentDetails: null,
                  })
                }
              >
                Close
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  (window.location.href = `mailto:${selectedMember.member?.email}`)
                }
                className="flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Member
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add a refresh button to the UI */}
      <Button onClick={fetchMembers} variant="outline" className="ml-2">
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  );
};

export default Directory;