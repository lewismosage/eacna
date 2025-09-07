import { useState, useEffect } from "react";
import {
  Upload,
  Image,
  Trash2,
  X,
  AlertCircle,
  Check,
  Plus,
  Calendar,
} from "lucide-react";
import { SupabaseClient } from "@supabase/supabase-js";
import Card from "../../../components/common/Card";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import AlertModal from "../../../components/common/AlertModal";

interface GalleryImage {
  id: string;
  src: string;
  caption: string;
  year: string;
  created_at: string;
  file_path: string;
}

interface GalleryContentProps {
  supabase: SupabaseClient;
}

export default function GalleryContent({ supabase }: GalleryContentProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    caption: "",
    year: new Date().getFullYear().toString(),
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    fetchImages();
    fetchAvailableYears();
    // eslint-disable-next-line
  }, [page, perPage]);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      // Get total count for pagination
      const { count } = await supabase
        .from("gallery_images")
        .select("*", { count: "exact", head: true });

      setTotalCount(count || 0);

      // Fetch paginated data
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);

      if (error) throw error;
      setImages((data as GalleryImage[]) || []);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      setNotification({
        type: "error",
        message: "Failed to load gallery images. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableYears = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("year")
        .order("year", { ascending: false });

      if (error) throw error;

      // Get unique years
      const years = Array.from(
        new Set((data || []).map((item) => item.year))
      ).sort((a, b) => b.localeCompare(a));

      setAvailableYears(years);
    } catch (error) {
      console.error("Error fetching available years:", error);
    }
  };

  const deleteImage = async (id: string) => {
    setSelectedImageId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedImageId) {
      try {
        // First get the image to know its file path
        const { data: imageData, error: fetchError } = await supabase
          .from("gallery_images")
          .select("file_path")
          .eq("id", selectedImageId)
          .single();

        if (fetchError) throw fetchError;

        // Delete from storage
        if (imageData.file_path) {
          const { error: storageError } = await supabase.storage
            .from("gallery")
            .remove([imageData.file_path]);

          if (storageError) throw storageError;
        }

        // Delete from database
        const { error: dbError } = await supabase
          .from("gallery_images")
          .delete()
          .eq("id", selectedImageId);

        if (dbError) throw dbError;

        setImages(images.filter((img) => img.id !== selectedImageId));
        setNotification({
          type: "success",
          message: "Image deleted successfully!",
        });
        
        // Refresh available years
        fetchAvailableYears();
      } catch (error) {
        console.error("Error deleting image:", error);
        setNotification({
          type: "error",
          message: "Failed to delete image. Please try again.",
        });
      } finally {
        setIsDeleteModalOpen(false);
        setSelectedImageId(null);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setNotification({
          type: "error",
          message: "Please select an image file.",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          type: "error",
          message: "Image size must be less than 5MB.",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadData.year) {
      setNotification({
        type: "error",
        message: "Please select a file and year.",
      });
      return;
    }

    setUploading(true);
    try {
      // Generate a unique file name with proper extension
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${uploadData.year}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError, data: uploadDataResult } = await supabase.storage
        .from('gallery')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Handle specific storage errors
        if (uploadError.message.includes('bucket')) {
          throw new Error("Gallery bucket doesn't exist. Please create it in Supabase Storage first.");
        }
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      // Insert into database - disable RLS for this operation if needed
      const { error: dbError } = await supabase
        .from('gallery_images')
        .insert({
          src: publicUrl,
          caption: uploadData.caption,
          year: uploadData.year,
          file_path: filePath
        });

      if (dbError) {
        // Handle RLS error specifically
        if (dbError.code === '42501') {
          throw new Error("Permission denied. Please check Row Level Security policies on gallery_images table.");
        }
        throw dbError;
      }

      setNotification({
        type: "success",
        message: "Image uploaded successfully!",
      });
      
      // Reset form and close modal
      setUploadData({
        caption: "",
        year: new Date().getFullYear().toString(),
      });
      setSelectedFile(null);
      setIsUploadModalOpen(false);
      
      // Refresh the images list
      fetchImages();
      fetchAvailableYears();
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setNotification({
        type: "error",
        message: error.message || "Failed to upload image. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const filteredImages = images.filter(
    (image) =>
      image.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.year.includes(searchTerm)
  );

  // Pagination controls
  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-500 mt-1">{totalCount} total images</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-primary-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" /> Upload Image
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

      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search images by caption or year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : filteredImages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caption
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded On
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredImages.map((image) => (
                  <tr key={image.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden">
                          <img
                            src={image.src}
                            alt={image.caption}
                            className="h-16 w-16 object-cover"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {image.caption}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {image.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(image.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteImage(image.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Image"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <select
                  className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages || totalPages === 0}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            {searchTerm ? (
              <p className="text-gray-500">
                No images match your search criteria.
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4">
                <Image className="w-16 h-16 text-gray-300" />
                <p className="text-gray-500">No images found.</p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 bg-primary-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" /> Upload Your First Image
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this image? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Upload Image</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {selectedFile && (
                  <p className="mt-1 text-sm text-gray-500">
                    Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption
                </label>
                <input
                  type="text"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={uploadData.caption}
                  onChange={(e) => setUploadData({...uploadData, caption: e.target.value})}
                  placeholder="Enter image caption"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <div className="relative">
                  <select
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm appearance-none"
                    value={uploadData.year}
                    onChange={(e) => setUploadData({...uploadData, year: e.target.value})}
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                    <option value={new Date().getFullYear().toString()}>
                      {new Date().getFullYear()}
                    </option>
                    <option value={(new Date().getFullYear() + 1).toString()}>
                      {new Date().getFullYear() + 1}
                    </option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="px-4 py-2 bg-primary-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex items-center"
              >
                {uploading ? (
                  <>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" /> Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}