import { useState, useEffect, useRef } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import Avatar from "./Avatar";
import { MoreHorizontal, Trash2, Edit, Reply, X } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";

interface Comment {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  parent_id: number | null;
  author: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

const CommentsSection = ({ postId }: { postId: number }) => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState<number | null>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  // Fetch comments and their replies
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch parent comments (where parent_id is null)
      const { data: parentComments, error: parentError } = await supabase
        .from("comments")
        .select(
          `*, 
          author:membership_directory!user_id(first_name, last_name, avatar_url)`
        )
        .eq("post_id", postId)
        .is("parent_id", null)
        .order("created_at", { ascending: false });

      if (parentError) throw parentError;

      // Fetch all replies for this post
      const { data: allReplies, error: repliesError } = await supabase
        .from("comments")
        .select(
          `*, 
          author:membership_directory!user_id(first_name, last_name, avatar_url)`
        )
        .eq("post_id", postId)
        .not("parent_id", "is", null)
        .order("created_at", { ascending: true });

      if (repliesError) throw repliesError;

      // Combine parent comments with their replies
      const commentsWithReplies = parentComments.map((comment) => ({
        ...comment,
        replies: allReplies.filter((reply) => reply.parent_id === comment.id),
      }));

      setComments(commentsWithReplies);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`comments:post_id=eq.${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        () => fetchComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [postId, supabase]);

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;
  
    try {
      setError(null);
  
      // Get member ID from membership_directory
      const { data: memberData, error: memberError } = await supabase
        .from("membership_directory")
        .select("user_id")
        .eq("email", user.email)
        .single();
  
      if (memberError || !memberData?.user_id) {
        throw new Error("Member not found");
      }
  
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            user_id: memberData.user_id, // Use the UUID from membership_directory
            post_id: postId,
            content: newComment,
          },
        ])
        .select();
  
      if (error) throw error;
  
      if (data?.[0]) {
        setNewComment("");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment. Please try again.");
    }
  };
  
  const handleAddReply = async (parentId: number) => {
    if (!user || !replyContent.trim()) return;
  
    try {
      setError(null);
  
      // Get member ID from membership_directory
      const { data: memberData, error: memberError } = await supabase
        .from("membership_directory")
        .select("user_id")
        .eq("email", user.email)
        .single();
  
      if (memberError || !memberData?.user_id) {
        throw new Error("Member not found");
      }
  
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            user_id: memberData.user_id,
            post_id: postId,
            parent_id: parentId,
            content: replyContent,
          },
        ])
        .select();
  
      if (error) throw error;
  
      if (data?.[0]) {
        setReplyingTo(null);
        setReplyContent("");
      }
    } catch (err) {
      console.error("Error adding reply:", err);
      setError("Failed to add reply. Please try again.");
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      setError(null);

      const { error } = await supabase
        .from("comments")
        .update({ content: editContent })
        .eq("id", commentId);

      if (error) throw error;

      setEditingCommentId(null);
      setEditContent("");
    } catch (err) {
      console.error("Error editing comment:", err);
      setError("Failed to edit comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      setError(null);

      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setReplyingTo(null);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const cancelReplying = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isCurrentUserComment = comment.user_id === user?.id;
    const isEditing = editingCommentId === comment.id;

    return (
      <div
        key={comment.id}
        className={`mt-3 ${
          isReply ? "ml-8 pl-3 border-l-2 border-gray-100" : ""
        }`}
      >
        <div className="flex items-start gap-3">
          <Avatar
            user={{
              firstName: comment.author.first_name,
              lastName: comment.author.last_name,
              profileImage: comment.author.avatar_url || null,
            }}
            size="sm"
          />
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-gray-900">
                    {comment.author.first_name} {comment.author.last_name}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                {isCurrentUserComment && !isEditing && (
                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(comment.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                      aria-label="Comment options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {isMenuOpen === comment.id && (
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-100 z-10">
                        <button
                          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => startEditing(comment)}
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </div>

            {!isReply && !isEditing && (
              <div className="flex items-center gap-3 mt-2">
                <button
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                  onClick={() => {
                    setReplyingTo(
                      replyingTo === comment.id ? null : comment.id
                    );
                    setEditingCommentId(null);
                    setTimeout(() => replyInputRef.current?.focus(), 0);
                  }}
                >
                  <Reply className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              </div>
            )}

            {replyingTo === comment.id && (
              <div className="mt-3">
                <div className="flex items-start gap-3">
                  <Avatar
                    user={{
                      firstName: user?.user_metadata?.first_name || "You",
                      lastName: user?.user_metadata?.last_name || "",
                      profileImage: user?.user_metadata?.avatar_url || null,
                    }}
                    size="sm"
                  />
                  <div className="flex-1">
                    <input
                      ref={replyInputRef}
                      type="text"
                      placeholder="Write a reply..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && replyContent.trim()) {
                          handleAddReply(comment.id);
                        }
                      }}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={cancelReplying}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        className={`px-3 py-1 text-sm rounded-lg ${
                          replyContent.trim()
                            ? "bg-primary-600 text-white hover:bg-primary-700"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyContent.trim()}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Render replies */}
        {comment.replies?.map((reply) => renderComment(reply, true))}
      </div>
    );
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-4">
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </h3>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Add new comment */}
      <div className="flex gap-3 mb-6">
        <Avatar
          user={{
            firstName: user?.user_metadata?.first_name || "User",
            lastName: user?.user_metadata?.last_name || "",
            profileImage: user?.user_metadata?.avatar_url || null,
          }}
          size="sm"
        />
        <div className="flex-1">
          <textarea
            placeholder="Write a comment..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && newComment.trim()) {
                e.preventDefault();
                handleAddComment();
              }
            }}
          />
          <div className="flex justify-end mt-2">
            <button
              className={`px-4 py-2 rounded-lg ${
                newComment.trim()
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Post Comment
            </button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
