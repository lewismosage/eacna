import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Paperclip,
  Image,
  Video,
  X,
  Smile,
  Globe,
} from "lucide-react";
import Avatar from "./Avatar";

interface CreatePostCardProps {
  onSubmit: (content: string, attachments?: File[]) => Promise<void>;
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
      full_name?: string;
      avatar_url?: string;
      title?: string;
    };
  };
  maxLength?: number;
}

const CreatePostCard = ({
  onSubmit,
  user,
  maxLength = 280,
}: CreatePostCardProps) => {
  const [postText, setPostText] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getUserName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    return user?.email?.split("@")[0] || "User";
  };

  // Handle file previews
  useEffect(() => {
    if (attachments.length === 0) {
      setPreviewUrls([]);
      return;
    }

    const newPreviewUrls: string[] = [];
    attachments.forEach((file) => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        newPreviewUrls.push(URL.createObjectURL(file));
      }
    });
    setPreviewUrls(newPreviewUrls);

    // Clean up object URLs when component unmounts
    return () => {
      newPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [attachments]);

  const handleSubmit = async () => {
    if (!postText.trim() && attachments.length === 0) {
      setError("Please write something or attach a file");
      return;
    }

    if (postText.length > maxLength) {
      setError(`Post exceeds ${maxLength} character limit`);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onSubmit(postText, attachments);
      setPostText("");
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err) {
      console.error("Error submitting post:", err);
      setError("Failed to post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Check total attachments won't exceed 4
      if (attachments.length + newFiles.length > 4) {
        setError("Maximum 4 attachments allowed");
        return;
      }

      // Check total size won't exceed 10MB
      const totalSize = [...attachments, ...newFiles].reduce(
        (total, file) => total + file.size,
        0
      );
      if (totalSize > 10 * 1024 * 1024) {
        setError("Total attachments size exceeds 10MB limit");
        return;
      }

      setAttachments((prev) => [...prev, ...newFiles].slice(0, 4));
      setError("");
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/"))
      return <Image className="w-5 h-5 text-primary-600" />;
    if (file.type.startsWith("video/"))
      return <Video className="w-5 h-5 text-primary-600" />;
    return <FileText className="w-5 h-5 text-primary-600" />;
  };

  const remainingChars = maxLength - postText.length;
  const isNearLimit = remainingChars < 20;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <Avatar
          user={{
            firstName:
              user.user_metadata?.first_name ||
              user.email?.split("@")[0] ||
              "User",
            lastName: user.user_metadata?.last_name || "",
            profileImage: user.user_metadata?.avatar_url || null,
          }}
          size="md"
        />
        <div className="flex-1">
          <div className="mb-1">
            <span className="font-medium text-gray-900">{getUserName()}</span>
            {user.user_metadata?.title && (
              <span className="text-xs text-gray-500 ml-2">
                {user.user_metadata.title}
              </span>
            )}
          </div>

          {/* Preview for media attachments */}
          {previewUrls.length > 0 && (
            <div className="mb-3 grid grid-cols-2 gap-2">
              {previewUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative rounded-lg overflow-hidden bg-gray-100"
                >
                  {attachments[index].type.startsWith("image/") ? (
                    <img
                      src={url}
                      alt={`Preview ${index}`}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <video
                      src={url}
                      className="w-full h-32 object-cover"
                      controls
                    />
                  )}
                  <button
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                    onClick={() => removeAttachment(index)}
                    type="button"
                    aria-label="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            placeholder={`What's on your mind, ${
              user.user_metadata?.first_name || "member"
            }?`}
            className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 resize-none"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={3}
            maxLength={maxLength}
          />

          {/* Character counter */}
          <div
            className={`text-xs mt-1 text-right ${
              isOverLimit
                ? "text-red-500"
                : isNearLimit
                ? "text-yellow-600"
                : "text-gray-500"
            }`}
          >
            {remainingChars}
          </div>
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="mb-3 space-y-2">
          {attachments.map(
            (file, index) =>
              !previewUrls[index] && (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {getFileIcon(file)}
                    <span className="text-sm text-gray-700 truncate max-w-xs">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)}KB
                    </span>
                  </div>
                  <button
                    className="text-gray-400 hover:text-red-500 p-1"
                    onClick={() => removeAttachment(index)}
                    type="button"
                    aria-label="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )
          )}
        </div>
      )}

      {error && <div className="mb-3 text-red-500 text-sm">{error}</div>}

      <div className="flex justify-between items-center border-t border-gray-100 pt-3">
        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 p-2 rounded-md hover:bg-gray-50"
            onClick={handleAttachClick}
            disabled={attachments.length >= 4}
            title="Attach files (max 4)"
          >
            <Paperclip className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Attach</span>
            {attachments.length > 0 && (
              <span className="text-xs text-gray-500">
                ({attachments.length}/4)
              </span>
            )}
          </button>

          <button
            type="button"
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 p-2 rounded-md hover:bg-gray-50"
            title="Add emoji"
            disabled // TODO: Implement emoji picker
          >
            <Smile className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">Emoji</span>
          </button>

          <div className="flex items-center text-gray-500 text-sm ml-2">
            <Globe className="w-4 h-4 mr-1" />
            <span>Everyone</span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
          />
        </div>

        <button
          className={`px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 ${
            (postText.trim() || attachments.length > 0) && !isOverLimit
              ? "bg-primary-600 hover:bg-primary-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={
            (!postText.trim() && attachments.length === 0) ||
            isOverLimit ||
            isSubmitting
          }
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Posting...
            </>
          ) : (
            "Post"
          )}
        </button>
      </div>
    </div>
  );
};

export default CreatePostCard;
