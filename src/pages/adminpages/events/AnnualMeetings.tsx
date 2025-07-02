// src/pages/admin/AnnualMeetings.tsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Search,
  Users,
  FileText,
  ImageIcon,
  Tag,
  X,
  Check,
  AlertCircle,
  MapPin,
  BookOpen,
  Download,
  ExternalLink,
  Send,
  Upload,
} from "lucide-react";
import { format } from "date-fns";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import AlertModal from "../../../components/common/AlertModal";
import Card from "../../../components/common/Card";
import { SupabaseClient } from "@supabase/supabase-js";

interface Conference {
  id: string;
  title: string;
  year: number;
  location: string;
  dates: string;
  theme: string;
  description: string;
  image_url: string;
  registration_link: string;
  attendees?: number;
  keynote_speakers: string[];
  presentations: {
    title: string;
    presenter: string;
    link: string;
  }[];
  proceedings?: string;
  photo_gallery?: string;
  status: "upcoming" | "past";
  created_at: string;
  updated_at: string;
}

interface AnnualMeetingsProps {
  supabase: SupabaseClient;
}

const AnnualMeetings: React.FC<AnnualMeetingsProps> = ({ supabase }) => {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [selectedConference, setSelectedConference] =
    useState<Conference | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [alert, setAlert] = useState<{
    open: boolean;
    title?: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({ open: false, message: "" });

  const [formData, setFormData] = useState<
    Omit<Conference, "id" | "created_at" | "updated_at">
  >({
    title: "",
    year: new Date().getFullYear(),
    location: "",
    dates: "",
    theme: "",
    description: "",
    image_url: "",
    registration_link: "",
    attendees: undefined,
    keynote_speakers: [],
    presentations: [],
    proceedings: "",
    photo_gallery: "",
    status: "upcoming",
  });

  const [newKeynoteSpeaker, setNewKeynoteSpeaker] = useState<string>("");
  const [newPresentation, setNewPresentation] = useState<{
    title: string;
    presenter: string;
    link: string;
  }>({
    title: "",
    presenter: "",
    link: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchConferences();
  }, []);

  const fetchConferences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("conferences")
        .select("*")
        .order("year", { ascending: false });

      if (error) throw error;
      setConferences((data as Conference[]) || []);
    } catch (error) {
      console.error("Error fetching conferences:", error);
      setNotification({
        type: "error",
        message: "Failed to load conferences",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredConferences = conferences.filter(
    (conference) =>
      conference.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conference.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conference.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : parseInt(value),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      // Changed path structure - remove 'public/' prefix
      const filePath = `conferences/${fileName}`;

      // Upload with public ACL
      const { data, error } = await supabase.storage
        .from("webinar-assets") // Must match your bucket name exactly
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: imageFile.type,
        });

      if (error) throw error;

      // Get permanent public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("webinar-assets").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const addKeynoteSpeaker = () => {
    if (
      newKeynoteSpeaker.trim() &&
      !formData.keynote_speakers.includes(newKeynoteSpeaker.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        keynote_speakers: [...prev.keynote_speakers, newKeynoteSpeaker.trim()],
      }));
      setNewKeynoteSpeaker("");
    }
  };

  const removeKeynoteSpeaker = (speakerToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      keynote_speakers: prev.keynote_speakers.filter(
        (speaker) => speaker !== speakerToRemove
      ),
    }));
  };

  const addPresentation = () => {
    if (
      newPresentation.title.trim() &&
      newPresentation.presenter.trim() &&
      newPresentation.link.trim()
    ) {
      setFormData((prev) => ({
        ...prev,
        presentations: [...prev.presentations, { ...newPresentation }],
      }));
      setNewPresentation({ title: "", presenter: "", link: "" });
    }
  };

  const removePresentation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      presentations: prev.presentations.filter((_, i) => i !== index),
    }));
  };

  const openEditForm = (conference: Conference | null) => {
    setSelectedConference(conference);
    if (conference) {
      setFormData({
        title: conference.title,
        year: conference.year,
        location: conference.location,
        dates: conference.dates,
        theme: conference.theme,
        description: conference.description,
        image_url: conference.image_url,
        registration_link: conference.registration_link,
        attendees: conference.attendees,
        keynote_speakers: conference.keynote_speakers,
        presentations: conference.presentations,
        proceedings: conference.proceedings,
        photo_gallery: conference.photo_gallery,
        status: conference.status,
      });
      if (conference.image_url) {
        setImagePreview(conference.image_url);
      }
    } else {
      setFormData({
        title: "",
        year: new Date().getFullYear(),
        location: "",
        dates: "",
        theme: "",
        description: "",
        image_url: "",
        registration_link: "",
        attendees: undefined,
        keynote_speakers: [],
        presentations: [],
        proceedings: "",
        photo_gallery: "",
        status: "upcoming",
      });
      setImagePreview("");
    }
    setImageFile(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (
        !formData.title ||
        !formData.dates ||
        !formData.location ||
        !formData.theme ||
        !formData.description
      ) {
        setNotification({
          type: "error",
          message: "Please fill in all required fields",
        });
        return;
      }

      // Upload image if there's a new one
      let imageUrl = formData.image_url;
      if (imageFile) {
        const uploadedImageUrl = await uploadImage();
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        }
      }

      const conferenceData = {
        ...formData,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      };

      if (selectedConference) {
        // Update existing conference
        const { error } = await supabase
          .from("conferences")
          .update(conferenceData)
          .eq("id", selectedConference.id);

        if (error) throw error;

        setNotification({
          type: "success",
          message: "Conference updated successfully",
        });
      } else {
        // Create new conference
        const { data, error } = await supabase
          .from("conferences")
          .insert([
            {
              ...conferenceData,
              created_at: new Date().toISOString(),
            },
          ])
          .select();

        if (error) throw error;

        setNotification({
          type: "success",
          message: "Conference created successfully",
        });
      }

      fetchConferences();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving conference:", error);
      setNotification({
        type: "error",
        message: "Failed to save conference",
      });
    }
  };

  const confirmDelete = (id: string) => {
    setAlert({
      open: true,
      title: "Delete Conference",
      message: "Are you sure you want to delete this conference?",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from("conferences")
            .delete()
            .eq("id", id);

          if (error) throw error;

          setConferences((prev) => prev.filter((c) => c.id !== id));
          setNotification({
            type: "success",
            message: "Conference deleted successfully",
          });
        } catch (error) {
          console.error("Error deleting conference:", error);
          setNotification({
            type: "error",
            message: "Failed to delete conference",
          });
        } finally {
          setAlert({ ...alert, open: false });
        }
      },
    });
  };

  const markAsPast = async (id: string) => {
    try {
      const { error } = await supabase
        .from("conferences")
        .update({ status: "past", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setConferences((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "past" } : c))
      );
      setNotification({
        type: "success",
        message: "Conference marked as past event",
      });
    } catch (error) {
      console.error("Error updating conference:", error);
      setNotification({
        type: "error",
        message: "Failed to update conference status",
      });
    }
  };

  const formatConferenceDate = (dateString: string) => {
    return dateString; // Assuming dates are already formatted as "December 5-7, 2023"
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      image_url: "",
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Annual Conferences
          </h1>
          <p className="text-gray-500 mt-1">
            Manage all EACNA annual conferences
          </p>
        </div>
        <button
          onClick={() => openEditForm(null)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Conference
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-md flex items-start justify-between ${
            notification.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : notification.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <Check className="w-5 h-5 mr-2 text-green-600" />
            ) : notification.type === "error" ? (
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
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
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search conferences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : filteredConferences.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConferences.map((conference) => (
                  <tr key={conference.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                          <img
                            src={conference.image_url}
                            alt={conference.title}
                            className="h-10 w-10 object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {conference.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {conference.theme}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {conference.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {conference.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {conference.dates}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          conference.status === "upcoming"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {conference.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {conference.status === "upcoming" && (
                          <button
                            onClick={() => markAsPast(conference.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Mark as Past"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedConference(conference);
                            setIsPreviewOpen(true);
                          }}
                          className="text-primary-600 hover:text-primary-800"
                          title="View Conference"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditForm(conference)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Edit Conference"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => confirmDelete(conference.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Conference"
                        >
                          <Trash2 className="w-5 h-5" />
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
            <p className="text-gray-500">
              {searchTerm
                ? "No conferences match your search. Try a different search term."
                : "No conferences found. Create your first conference!"}
            </p>
          </div>
        )}
      </Card>

      {/* Conference Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedConference
                  ? "Edit Conference"
                  : "Create New Conference"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="col-span-2">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Conference Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="3rd Annual EACNA Conference"
                  />
                </div>

                {/* Year */}
                <div>
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Year *
                  </label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    min="2000"
                    max="2100"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                  </select>
                </div>

                {/* Location */}
                <div className="col-span-2">
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Location *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Kigali, Rwanda"
                  />
                </div>

                {/* Dates */}
                <div className="col-span-2">
                  <label
                    htmlFor="dates"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Dates *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="dates"
                    name="dates"
                    value={formData.dates}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="December 5-7, 2023"
                  />
                </div>

                {/* Theme */}
                <div className="col-span-2">
                  <label
                    htmlFor="theme"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>Theme *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="theme"
                    name="theme"
                    value={formData.theme}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Innovations in Pediatric Neurology: Research to Practice"
                  />
                </div>

                {/* Registration Link */}
                <div className="col-span-2">
                  <label
                    htmlFor="registrationLink"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <div className="flex items-center gap-1">
                      <ExternalLink className="w-4 h-4" />
                      <span>Registration Link</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="registrationLink"
                    name="registration_link"
                    value={formData.registration_link}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://forms.gle/example"
                  />
                </div>

                {/* Attendees (only for past conferences) */}
                {formData.status === "past" && (
                  <div>
                    <label
                      htmlFor="attendees"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Number of Attendees</span>
                      </div>
                    </label>
                    <input
                      type="number"
                      id="attendees"
                      name="attendees"
                      min="0"
                      value={formData.attendees || ""}
                      onChange={handleNumberInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                )}

                {/* Proceedings Link (only for past conferences) */}
                {formData.status === "past" && (
                  <div>
                    <label
                      htmlFor="proceedings"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>Proceedings Link</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      id="proceedings"
                      name="proceedings"
                      value={formData.proceedings || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="/downloads/proceedings-2023.pdf"
                    />
                  </div>
                )}

                {/* Photo Gallery Link (only for past conferences) */}
                {formData.status === "past" && (
                  <div>
                    <label
                      htmlFor="photoGallery"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      <div className="flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        <span>Photo Gallery Link</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      id="photoGallery"
                      name="photo_gallery"
                      value={formData.photo_gallery || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="/gallery/2023"
                    />
                  </div>
                )}

                {/* Image */}
                <div className="col-span-2">
                  <label
                    htmlFor="image"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <div className="flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      <span>Conference Image</span>
                    </div>
                  </label>
                  <div className="mt-2 flex flex-col space-y-2">
                    {imagePreview ? (
                      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Conference preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          id="image-upload"
                          onChange={handleImageChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer flex flex-col items-center justify-center"
                        >
                          <Upload className="w-10 h-10 text-gray-400 mb-3" />
                          <p className="text-sm text-gray-500">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </label>
                      </div>
                    )}
                    {isUploading && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${isUploading ? 100 : 0}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>Description *</span>
                  </div>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe the conference content, objectives, and target audience..."
                />
              </div>

              {/* Keynote Speakers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Keynote Speakers</span>
                  </div>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.keynote_speakers.map((speaker, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
                    >
                      {speaker}
                      <button
                        type="button"
                        onClick={() => removeKeynoteSpeaker(speaker)}
                        className="ml-1 text-gray-500 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newKeynoteSpeaker}
                    onChange={(e) => setNewKeynoteSpeaker(e.target.value)}
                    placeholder="Add a keynote speaker"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), addKeynoteSpeaker())
                    }
                  />
                  <button
                    type="button"
                    onClick={addKeynoteSpeaker}
                    className="bg-primary-600 px-4 py-2 text-white rounded-r-md hover:bg-primary-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Presentations (only for past conferences) */}
              {formData.status === "past" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conference Presentations
                  </label>
                  <div className="space-y-2 mb-4">
                    {formData.presentations.map((presentation, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b border-gray-200 pb-2"
                      >
                        <div>
                          <div className="font-medium">
                            {presentation.title}
                          </div>
                          <div className="text-gray-500">
                            {presentation.presenter}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePresentation(index)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="presentationTitle"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Presentation Title
                      </label>
                      <input
                        type="text"
                        id="presentationTitle"
                        value={newPresentation.title}
                        onChange={(e) =>
                          setNewPresentation((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="presentationPresenter"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Presenter
                      </label>
                      <input
                        type="text"
                        id="presentationPresenter"
                        value={newPresentation.presenter}
                        onChange={(e) =>
                          setNewPresentation((prev) => ({
                            ...prev,
                            presenter: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="presentationLink"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Link to Presentation
                      </label>
                      <input
                        type="text"
                        id="presentationLink"
                        value={newPresentation.link}
                        onChange={(e) =>
                          setNewPresentation((prev) => ({
                            ...prev,
                            link: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addPresentation}
                      disabled={
                        !newPresentation.title ||
                        !newPresentation.presenter ||
                        !newPresentation.link
                      }
                      className="bg-primary-600 px-4 py-2 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Presentation
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                >
                  {selectedConference
                    ? "Update Conference"
                    : "Create Conference"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && selectedConference && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                Conference Details
              </h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Header with image */}
              <div className="relative mb-8">
                <div className="h-48 w-full bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={
                      selectedConference.image_url ||
                      "https://via.placeholder.com/800x300?text=No+Image"
                    }
                    alt={selectedConference.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedConference.title}
                  </h2>
                </div>
              </div>

              {/* Conference details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      About this Conference
                    </h3>
                    <p className="text-gray-700">
                      {selectedConference.description}
                    </p>
                  </div>

                  {selectedConference.keynote_speakers.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Keynote Speakers
                      </h3>
                      <ul className="list-disc ml-5 space-y-2 text-gray-700">
                        {selectedConference.keynote_speakers.map(
                          (speaker, index) => (
                            <li key={index}>{speaker}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {selectedConference.status === "past" &&
                    selectedConference.presentations.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Conference Presentations
                        </h3>
                        <div className="border rounded-md overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Title
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Presenter
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedConference.presentations.map(
                                (presentation, index) => (
                                  <tr
                                    key={index}
                                    className={
                                      index % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50"
                                    }
                                  >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                      <a
                                        href={presentation.link}
                                        className="text-primary-600 hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {presentation.title}
                                      </a>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                      {presentation.presenter}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Event Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Year</p>
                          <p className="text-gray-600">
                            {selectedConference.year}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Dates</p>
                          <p className="text-gray-600">
                            {selectedConference.dates}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Location</p>
                          <p className="text-gray-600">
                            {selectedConference.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <BookOpen className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Theme</p>
                          <p className="text-gray-600">
                            {selectedConference.theme}
                          </p>
                        </div>
                      </div>
                      {selectedConference.status === "past" &&
                        selectedConference.attendees && (
                          <div className="flex items-start">
                            <Users className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900">
                                Attendees
                              </p>
                              <p className="text-gray-600">
                                {selectedConference.attendees}
                              </p>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {selectedConference.status === "past" &&
                    selectedConference.proceedings && (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Conference Materials
                        </h3>
                        <div className="space-y-2">
                          {selectedConference.proceedings && (
                            <a
                              href={selectedConference.proceedings}
                              className="flex items-center text-primary-600 hover:text-primary-800 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="w-5 h-5 mr-2" />
                              Download Conference Proceedings
                            </a>
                          )}
                          {selectedConference.photo_gallery && (
                            <a
                              href={selectedConference.photo_gallery}
                              className="flex items-center text-primary-600 hover:text-primary-800 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ImageIcon className="w-5 h-5 mr-2" />
                              View Photo Gallery
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                  {selectedConference.status === "upcoming" &&
                    selectedConference.registration_link && (
                      <div className="bg-primary-50 p-4 rounded-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Registration
                        </h3>
                        <a
                          href={selectedConference.registration_link}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Register Now
                        </a>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.open}
        title={alert.title ?? "Alert"}
        message={alert.message}
        onConfirm={alert.onConfirm}
        onCancel={() => setAlert({ ...alert, open: false })}
        onClose={() => setAlert({ ...alert, open: false })}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
      />
    </div>
  );
};

export default AnnualMeetings;
