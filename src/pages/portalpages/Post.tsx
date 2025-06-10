import { useState } from "react";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  FileText,
  Image,
  Video,
  MoreHorizontal,
  Bookmark,
  Repeat2,
} from "lucide-react";
import Avatar from "./Avatar";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import type { Post } from "../../types";

interface PostProps {
  post: Post;
  onLike: () => void;
  currentUserId: string;
}

const Post = ({ post, onLike, currentUserId }: PostProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const formattedDate = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
  });

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      {/* Post header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.user_id}`}>
            <Avatar
              user={{
                firstName: post.author.first_name,
                lastName: post.author.last_name,
                profileImage: post.author.avatar_url || null,
              }}
              size="md"
            />
          </Link>
          <div>
            <Link
              to={`/profile/${post.user_id}`}
              className="font-semibold text-gray-900 hover:underline"
            >
              {post.author.first_name} {post.author.last_name}
            </Link>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              {post.author.role && (
                <>
                  <span>{post.author.role}</span>
                  <span className="inline-block w-1 h-1 rounded-full bg-gray-400"></span>
                </>
              )}
              <span>{formattedDate}</span>
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-10">
              {post.user_id === currentUserId && (
                <>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Edit Post
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Delete Post
                  </button>
                </>
              )}
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Save Post
              </button>
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Report Post
              </button>
            </div>
          )}
        </div>
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
        >
          <ThumbsUp className="w-5 h-5" />
          <span>{post.user_has_liked ? "Liked" : "Like"}</span>
        </button>

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50"
          onClick={() => setIsReplying(!isReplying)}
        >
          <MessageCircle className="w-5 h-5" />
          <span>Comment</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50">
          <Repeat2 className="w-5 h-5" />
          <span>Repost</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
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
                firstName: "You", // Replace with actual current user data
                lastName: "",
                profileImage: null, // Replace with actual current user avatar
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
