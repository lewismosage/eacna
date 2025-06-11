import { useState, useRef, useEffect } from "react";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  FileText,
  MoreHorizontal,
  Copy,
  Mail,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import Avatar from "./Avatar";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import type { Post } from "../../types";

// Custom X (Twitter) icon component
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

// Custom Facebook icon component
const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

interface PostProps {
  post: Post;
  onLike: () => void;
  currentUserId: string;
  currentUserAvatar?: string | null;
  currentUserName?: string;
}

const Post = ({
  post,
  onLike,
  currentUserId,
  currentUserAvatar,
  currentUserName,
}: PostProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const sharePopupRef = useRef<HTMLDivElement>(null);

  const isCurrentUserPost = post.user_id === currentUserId;

  const handleEditPost = () => {
    setIsMenuOpen(false);
    // TODO: Implement edit functionality
    console.log("Edit post:", post.id);
  };

  const handleDeletePost = () => {
    setIsMenuOpen(false);
    // TODO: Implement delete functionality
    console.log("Delete post:", post.id);
  };

  const formattedDate = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
  });

  // Get absolute URL for the post
  const getPostUrl = () => {
    return `${window.location.origin}/posts/${post.id}`;
  };

  // Close share popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sharePopupRef.current &&
        !sharePopupRef.current.contains(event.target as Node)
      ) {
        setShowSharePopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset copy success message after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const handleLike = () => {
    onLike();
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement reply submission
    console.log("Reply:", replyContent);
    setReplyContent("");
    setIsReplying(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(getPostUrl())
      .then(() => setCopySuccess(true))
      .catch((err) => console.error("Failed to copy:", err));
  };

  const shareOnTwitter = () => {
    const text = `Check out this post by ${post.author_first_name} ${post.author_last_name}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(getPostUrl())}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowSharePopup(false);
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      getPostUrl()
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowSharePopup(false);
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      getPostUrl()
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowSharePopup(false);
  };

  const shareByEmail = () => {
    const subject = `Post by ${post.author_first_name} ${post.author_last_name}`;
    const body = `Check out this post:\n\n${post.content.substring(
      0,
      100
    )}...\n\n${getPostUrl()}`;
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
    setShowSharePopup(false);
  };

  const useNativeShare = async () => {
    try {
      await navigator.share({
        title: `Post by ${post.author_first_name} ${post.author_last_name}`,
        text: post.content.substring(0, 100) + "...",
        url: getPostUrl(),
      });
      setShowSharePopup(false);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Error sharing:", err);
      }
    }
  };

  const renderAttachment = (attachment: {
    type: string;
    name: string;
    url: string;
  }) => {
    if (attachment.type.startsWith("image/")) {
      return (
        <div className="mt-3 rounded-lg overflow-hidden">
          <img
            src={attachment.url}
            alt={attachment.name}
            className="w-full max-h-96 object-contain"
            loading="lazy"
          />
        </div>
      );
    }

    if (attachment.type.startsWith("video/")) {
      return (
        <div className="mt-3 rounded-lg overflow-hidden">
          <video src={attachment.url} controls className="w-full max-h-96" />
        </div>
      );
    }

    return (
      <div className="mt-3 bg-gray-50 rounded-lg p-3 flex items-center gap-3">
        <FileText className="w-5 h-5 text-primary-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">{attachment.name}</p>
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 text-sm font-medium hover:underline"
          >
            View
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 relative">
      {/* Post header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.user_id}`}>
            <Avatar
              user={{
                firstName: post.author_first_name,
                lastName: post.author_last_name,
                profileImage: post.author_avatar_url || null,
              }}
              size="md"
            />
          </Link>
          <div>
            <Link
              to={`/profile/${post.user_id}`}
              className="font-semibold text-gray-900 hover:underline"
            >
              {post.author_first_name} {post.author_last_name}
            </Link>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              {post.author_role && (
                <>
                  <span>{post.author_role}</span>
                  <span className="inline-block w-1 h-1 rounded-full bg-gray-400"></span>
                </>
              )}
              <span>{formattedDate}</span>
            </p>
          </div>
        </div>

        {/* Only show menu button if it's the current user's post */}
        {isCurrentUserPost && (
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              aria-label="Post options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-10">
                <button
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={handleEditPost}
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Post</span>
                </button>
                <button
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={handleDeletePost}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post content */}
      <div className="mb-3">
        <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
      </div>

      {/* Attachments */}
      {post.attachments?.map((attachment, index) => (
        <div key={index}>{renderAttachment(attachment)}</div>
      ))}

      {/* Post stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 py-2 border-t border-b border-gray-100 mt-3">
        <span>
          {post.likes_count} {post.likes_count === 1 ? "like" : "likes"}
        </span>
        <span>
          {post.comments_count}{" "}
          {post.comments_count === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Post actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${
            post.user_has_liked
              ? "text-primary-600 font-medium"
              : "text-gray-600 hover:bg-gray-50"
          }`}
          onClick={handleLike}
          aria-label={post.user_has_liked ? "Unlike post" : "Like post"}
        >
          <ThumbsUp className="w-5 h-5" />
          <span>{post.user_has_liked ? "Liked" : "Like"}</span>
        </button>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50"
          onClick={() => setIsReplying(!isReplying)}
          aria-label="Comment on post"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Comment</span>
        </button>

        <div className="relative">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50"
            onClick={() => setShowSharePopup(!showSharePopup)}
            aria-label="Share post"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>

          {/* Share popup */}
          {showSharePopup && (
            <div
              ref={sharePopupRef}
              className="absolute bottom-full right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4 mb-2 w-64"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-900">Share this post</h3>
                <button
                  onClick={() => setShowSharePopup(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close share menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-center gap-3 mb-4">
                <button
                  onClick={shareOnTwitter}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  aria-label="Share on X (Twitter)"
                >
                  <XIcon />
                </button>

                <button
                  onClick={shareOnFacebook}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  aria-label="Share on Facebook"
                >
                  <FacebookIcon />
                </button>

                <button
                  onClick={shareOnLinkedIn}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  aria-label="Share on LinkedIn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </button>

                <button
                  onClick={shareByEmail}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  aria-label="Share by Email"
                >
                  <Mail className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 transition"
                aria-label="Copy link to clipboard"
              >
                <Copy className="w-4 h-4" />
                {copySuccess ? "Copied!" : "Copy link"}
              </button>

              {typeof navigator.share === "function" && (
                <button
                  onClick={useNativeShare}
                  className="mt-2 flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 transition"
                  aria-label="Share using native share dialog"
                >
                  <Share2 className="w-4 h-4" />
                  Share via...
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reply form */}
      {isReplying && (
        <form
          onSubmit={handleReplySubmit}
          className="mt-3 pt-3 border-t border-gray-100"
        >
          <div className="flex items-start gap-3">
            <Avatar
              user={{
                firstName: currentUserName?.split(" ")[0] || "You",
                lastName: currentUserName?.split(" ")[1] || "",
                profileImage: currentUserAvatar || null,
              }}
              size="sm"
            />
            <div className="flex-1">
              <textarea
                placeholder="Write your reply..."
                className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 resize-none"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={2}
                aria-label="Reply content"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!replyContent.trim()}
                  className={`px-3 py-1 text-sm rounded-md ${
                    replyContent.trim()
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Post;
