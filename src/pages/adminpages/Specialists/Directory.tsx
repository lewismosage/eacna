import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  User,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Check,
  X,
  Eye,
} from "lucide-react";
import { SupabaseClient } from "@supabase/supabase-js";
import Card from "../../../components/common/Card";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

interface Specialist {
  id: string;
  prefix: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  title: string;
  specialization: string;
  years_experience: number;
  hospital: string;
  city: string;
  country: string;
  photo_url?: string;
  languages: {
    english: boolean;
    swahili: boolean;
    french: boolean;
    kinyarwanda: boolean;
    luganda: boolean;
    luo: boolean;
    other: boolean;
    other_language?: string;
  };
  expertise: string[];
  affiliations: string[];
  bio: string;
  education: {
    degree: string;
    institution: string;
    period: string;
  }[];
  experience: {
    role: string;
    institution: string;
    period: string;
    description: string;
  }[];
  certifications?: string;
  research_interests?: string[];
  services: {
    name: string;
    description: string;
    duration: string;
  }[];
  conditions_treated: string[];
  availability: "available" | "limited" | "unavailable";
  created_at: string;
}

interface AdminSpecialistsProps {
  supabase: SupabaseClient;
}

export default function AdminSpecialists({ supabase }: AdminSpecialistsProps) {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState<Specialist[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [specializationFilter, setSpecializationFilter] = useState<string>("");
  const [selectedSpecialist, setSelectedSpecialist] =
    useState<Specialist | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Specialist;
    direction: "ascending" | "descending";
  } | null>(null);

  useEffect(() => {
    fetchSpecialists();
  }, []);

  const fetchSpecialists = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("specialists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSpecialists((data as Specialist[]) || []);
      setFilteredSpecialists((data as Specialist[]) || []);
    } catch (error) {
      console.error("Error fetching specialists:", error);
      setNotification({
        type: "error",
        message: "Failed to load specialists. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = [...specialists];

    // Apply search
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (spec) =>
          spec.first_name.toLowerCase().includes(lowercasedSearch) ||
          spec.last_name.toLowerCase().includes(lowercasedSearch) ||
          spec.email.toLowerCase().includes(lowercasedSearch) ||
          spec.specialization.toLowerCase().includes(lowercasedSearch) ||
          spec.hospital.toLowerCase().includes(lowercasedSearch)
      );
    }

    // Apply country filter
    if (countryFilter) {
      result = result.filter((spec) => spec.country === countryFilter);
    }

    // Apply specialization filter
    if (specializationFilter) {
      result = result.filter(
        (spec) => spec.specialization === specializationFilter
      );
    }

    // Apply sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredSpecialists(result);
  }, [
    specialists,
    searchTerm,
    countryFilter,
    specializationFilter,
    sortConfig,
  ]);

  const requestSort = (key: keyof Specialist) => {
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

  const getSortIcon = (key: keyof Specialist) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const viewSpecialist = (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    setIsViewOpen(true);
  };

  const editSpecialist = (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    setIsEditOpen(true);
  };

  const deleteSpecialist = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this specialist from the directory?"
      )
    ) {
      setIsProcessing(true);
      try {
        const { error } = await supabase
          .from("specialists")
          .delete()
          .eq("id", id);

        if (error) throw error;

        fetchSpecialists();
        setNotification({
          type: "success",
          message: "Specialist deleted successfully!",
        });
      } catch (error) {
        console.error("Error deleting specialist:", error);
        setNotification({
          type: "error",
          message: "Failed to delete specialist. Please try again.",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const exportSpecialists = async () => {
    try {
      // Create CSV content
      const headers = [
        "Name",
        "Email",
        "Specialization",
        "Hospital",
        "City",
        "Country",
        "Years Experience",
        "Added On",
      ];
      const csvContent = [
        headers.join(","),
        ...filteredSpecialists.map(
          (spec) =>
            `"${spec.prefix} ${spec.first_name} ${spec.last_name}","${
              spec.email
            }","${spec.specialization}","${spec.hospital}","${spec.city}","${
              spec.country
            }","${spec.years_experience}","${new Date(
              spec.created_at
            ).toLocaleDateString()}"`
        ),
      ].join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `specialists-directory-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotification({
        type: "success",
        message: "Specialists exported successfully!",
      });
    } catch (error) {
      console.error("Error exporting specialists:", error);
      setNotification({
        type: "error",
        message: "Failed to export specialists. Please try again.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get unique countries and specializations for filters
  const countries = [
    ...new Set(specialists.map((spec) => spec.country)),
  ].sort();
  const specializations = [
    ...new Set(specialists.map((spec) => spec.specialization)),
  ].sort();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Specialists Directory
          </h1>
          <p className="text-gray-500 mt-1">
            {specialists.length} specialists in the directory
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportSpecialists}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-md flex items-start justify-between ${
            notification.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <Check className="w-5 h-5 mr-2 text-green-600" />
            ) : (
              <X className="w-5 h-5 mr-2 text-red-600" />
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

      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search specialists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : filteredSpecialists.length > 0 ? (
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
                      <span>Specialist</span>
                      {getSortIcon("last_name")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("specialization")}
                  >
                    <div className="flex items-center">
                      <span>Specialization</span>
                      {getSortIcon("specialization")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("hospital")}
                  >
                    <div className="flex items-center">
                      <span>Hospital</span>
                      {getSortIcon("hospital")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("country")}
                  >
                    <div className="flex items-center">
                      <span>Location</span>
                      {getSortIcon("country")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("years_experience")}
                  >
                    <div className="flex items-center">
                      <span>Experience</span>
                      {getSortIcon("years_experience")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("created_at")}
                  >
                    <div className="flex items-center">
                      <span>Added On</span>
                      {getSortIcon("created_at")}
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
                {filteredSpecialists.map((specialist) => (
                  <tr key={specialist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          {specialist.photo_url ? (
                            <img
                              src={specialist.photo_url}
                              alt={`${specialist.first_name} ${specialist.last_name}`}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-primary-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {specialist.prefix} {specialist.first_name}{" "}
                            {specialist.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {specialist.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {specialist.specialization}
                      </div>
                      <div className="text-sm text-gray-500">
                        {specialist.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {specialist.hospital}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {specialist.city}, {specialist.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {specialist.years_experience} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(specialist.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => viewSpecialist(specialist)}
                          className="text-emerald-600 hover:text-emerald-900"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8">
            {searchTerm || countryFilter || specializationFilter ? (
              <p className="text-gray-500">
                No specialists match your search criteria.
              </p>
            ) : (
              <p className="text-gray-500">
                No specialists found in the directory.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Specialist View Modal */}
      {isViewOpen && selectedSpecialist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedSpecialist.prefix} {selectedSpecialist.first_name}{" "}
                {selectedSpecialist.last_name}
              </h3>
              <button
                onClick={() => setIsViewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-1">
                  {selectedSpecialist.photo_url ? (
                    <img
                      src={selectedSpecialist.photo_url}
                      alt={`${selectedSpecialist.first_name} ${selectedSpecialist.last_name}`}
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="h-16 w-16 text-gray-400" />
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-800">
                        {selectedSpecialist.email}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-800">
                        {selectedSpecialist.phone}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-800">
                        {selectedSpecialist.title}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-800">
                        {selectedSpecialist.hospital}, {selectedSpecialist.city}
                        , {selectedSpecialist.country}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-primary-800 mb-2">
                      Professional Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Specialization
                        </p>
                        <p className="text-gray-900">
                          {selectedSpecialist.specialization}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Years of Experience
                        </p>
                        <p className="text-gray-900">
                          {selectedSpecialist.years_experience}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Languages Spoken
                        </p>
                        <p className="text-gray-900">
                          {[
                            ...Object.entries(selectedSpecialist.languages)
                              .filter(
                                ([key, value]) =>
                                  value && key !== "other_language"
                              )
                              .map(([key]) =>
                                key === "other"
                                  ? selectedSpecialist.languages.other_language
                                  : key
                              ),
                          ].join(", ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Availability
                        </p>
                        <p className="text-gray-900">
                          {selectedSpecialist.availability === "available"
                            ? "Available for new patients"
                            : selectedSpecialist.availability === "limited"
                            ? "Limited availability"
                            : "Not accepting new patients"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">
                        Areas of Expertise
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSpecialist.expertise.map(
                          (expertise, index) => (
                            <span
                              key={index}
                              className="bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-sm"
                            >
                              {expertise}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">
                        Professional Affiliations
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSpecialist.affiliations.length > 0 ? (
                          selectedSpecialist.affiliations.map(
                            (affiliation, index) => (
                              <span
                                key={index}
                                className="bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-sm"
                              >
                                {affiliation}
                              </span>
                            )
                          )
                        ) : (
                          <p className="text-gray-500 text-sm">
                            None specified
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-primary-800 mb-2">
                      Education
                    </h4>
                    <div className="space-y-4">
                      {selectedSpecialist.education.map((edu, index) => (
                        <div
                          key={index}
                          className="border-l-2 border-primary-500 pl-4 py-1"
                        >
                          <h4 className="font-medium text-gray-800">
                            {edu.degree}
                          </h4>
                          <p className="text-sm text-primary-600">
                            {edu.institution}
                          </p>
                          <p className="text-xs text-gray-500">{edu.period}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-primary-800 mb-2">
                      Experience
                    </h4>
                    <div className="space-y-4">
                      {selectedSpecialist.experience.map((exp, index) => (
                        <div
                          key={index}
                          className="border-l-2 border-primary-500 pl-4 py-1"
                        >
                          <h4 className="font-medium text-gray-800">
                            {exp.role}
                          </h4>
                          <p className="text-sm text-primary-600">
                            {exp.institution}
                          </p>
                          <p className="text-xs text-gray-500 mb-1">
                            {exp.period}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-gray-700">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-primary-800 mb-2">
                      Professional Bio
                    </h4>
                    <p className="text-gray-700">{selectedSpecialist.bio}</p>
                  </div>

                  {selectedSpecialist.certifications && (
                    <div>
                      <h4 className="text-lg font-semibold text-primary-800 mb-2">
                        Certifications & Licenses
                      </h4>
                      <p className="text-gray-700">
                        {selectedSpecialist.certifications}
                      </p>
                    </div>
                  )}

                  {selectedSpecialist.research_interests &&
                    selectedSpecialist.research_interests.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-primary-800 mb-2">
                          Research Interests
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedSpecialist.research_interests.map(
                            (interest, index) => (
                              <span
                                key={index}
                                className="bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-sm"
                              >
                                {interest}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  <div>
                    <h4 className="text-lg font-semibold text-primary-800 mb-2">
                      Services Offered
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedSpecialist.services.map((service, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <h4 className="font-medium text-primary-700">
                            {service.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {service.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            Duration: {service.duration}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-primary-800 mb-2">
                      Conditions Treated
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSpecialist.conditions_treated.map(
                        (condition, index) => (
                          <span
                            key={index}
                            className="bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-sm"
                          >
                            {condition}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsViewOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
