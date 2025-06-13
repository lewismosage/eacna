import { useState, useRef, useEffect } from "react";
import { useSupabase } from "../../context/SupabaseContext";
import { useUser } from "@supabase/auth-helpers-react";
import { MoreHorizontal, Edit, Trash2, Reply } from "lucide-react";
import Avatar from "./Avatar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatDistanceToNow } from "date-fns";

interface Author {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  author: Author;
  replies?: Comment[];
  parent_id?: number | null;
}

interface CommentsSectionProps {
  postId: number;
  initialComments?: Comment[];
}

const CommentsSection = ({
  postId,
  initialComments = [],
}: CommentsSectionProps) => {
  const supabase = useSupabase();
  const user = useUser();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  // Fetch comments when postId changes
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("comments")
          .select(
            `
            id,
            content,
            created_at,
            parent_id,
            author:user_id (
              id,
              first_name,
              last_name,
              avatar_url
            )
          `
          )
          .eq("post_id", postId)
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Process the data to ensure author is properly typed
        const processedData = (data || []).map((comment) => ({
          ...comment,
          author: Array.isArray(comment.author)
            ? comment.author[0]
            : comment.author,
          replies: [],
        }));

        // Organize comments into a tree structure
        const organizedComments = organizeComments(processedData);
        setComments(organizedComments);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Failed to load comments");
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) fetchComments();
  }, [postId, supabase]);

  // Organize flat comments into a nested structure
  const organizeComments = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<number, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create map of all comments
    comments.forEach((comment) => {
      commentMap.set(comment.id, {
        ...comment,
        replies: [],
      });
    });

    // Second pass: build the tree
    comments.forEach((comment) => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies?.push(commentMap.get(comment.id)!);
        }
      } else {
        rootComments.push(commentMap.get(comment.id)!);
      }
    });

    return rootComments;
  };

  // Update the handleAddComment function in CommentsSection.tsx
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    // Get the authenticated user from Supabase
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser?.email) {
      setError("You must be logged in to comment");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching user data...");

      // Get member data using the authenticated user's email
      const { data: memberData, error: memberError } = await supabase
        .from("membership_directory")
        .select("user_id, first_name, last_name, avatar_url")
        .eq("email", authUser.email)
        .single();

      if (memberError) throw memberError;
      if (!memberData) throw new Error("User profile not found");

      const { data, error } = await supabase.from("comments").insert([
        {
          post_id: postId,
          user_id: memberData.user_id,
          content: newComment,
          parent_id: null,
        },
      ]).select(`
          id,
          content,
          created_at,
          parent_id,
          author:user_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `);

      if (error) throw error;

      if (data && data[0]) {
        const processedComment = {
          ...data[0],
          author: Array.isArray(data[0].author)
            ? data[0].author[0]
            : data[0].author,
          replies: [],
        };
        setComments((prev) => [...prev, processedComment]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Comment submission error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to post comment. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReply = async (parentId: number) => {
    if (!replyContent.trim()) {
      setError("Reply cannot be empty");
      return;
    }

    // Get the authenticated user from Supabase
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser?.email) {
      setError("You must be logged in to reply");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get member data using the authenticated user's email
      const { data: memberData, error: memberError } = await supabase
        .from("membership_directory")
        .select("user_id, first_name, last_name, avatar_url")
        .eq("email", authUser.email)
        .single();

      if (memberError) throw memberError;
      if (!memberData) throw new Error("User profile not found");

      // Insert reply
      const { data, error } = await supabase.from("comments").insert([
        {
          post_id: postId,
          user_id: memberData.user_id,
          content: replyContent,
          parent_id: parentId,
        },
      ]).select(`
          id,
          content,
          created_at,
          parent_id,
          author:user_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `);

      if (error) throw error;

      if (data && data[0]) {
        const processedReply = {
          ...data[0],
          author: Array.isArray(data[0].author)
            ? data[0].author[0]
            : data[0].author,
          replies: [],
        };
        setComments((prev) => {
          const updateCommentWithReply = (comments: Comment[]): Comment[] => {
            return comments.map((comment) => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), processedReply],
                };
              }
              if (comment.replies) {
                return {
                  ...comment,
                  replies: updateCommentWithReply(comment.replies),
                };
              }
              return comment;
            });
          };
          return updateCommentWithReply(prev);
        });
        setReplyContent("");
        setReplyingTo(null);
      }
    } catch (err) {
      console.error("Error adding reply:", err);
      setError("Failed to add reply. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setIsMenuOpen(null);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from("comments")
        .update({ content: editContent })
        .eq("id", commentId);

      if (error) throw error;

      setComments((prev) => {
        const updateComment = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => {
            if (comment.id === commentId) {
              return { ...comment, content: editContent };
            }
            if (comment.replies) {
              return {
                ...comment,
                replies: updateComment(comment.replies),
              };
            }
            return comment;
          });
        };
        return updateComment(prev);
      });

      setEditingCommentId(null);
      setEditContent("");
    } catch (err) {
      console.error("Error editing comment:", err);
      setError("Failed to edit comment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      setComments((prev) => {
        const removeComment = (comments: Comment[]): Comment[] => {
          return comments.filter((comment) => {
            if (comment.id === commentId) return false;
            if (comment.replies) {
              comment.replies = removeComment(comment.replies);
            }
            return true;
          });
        };
        return removeComment(prev);
      });
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment");
    } finally {
      setIsLoading(false);
      setIsMenuOpen(null);
    }
  };

  const cancelReplying = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const isCurrentUserComment = (commentAuthorId: string) => {
    if (!user?.id) return false;
    return String(commentAuthorId) === String(user.id);
  };

  const renderComment = (comment: Comment, isReply = false) => {
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
                {isCurrentUserComment(comment.author.id) &&
                  !editingCommentId && (
                    <div className="relative">
                      <button
                        onClick={() => setIsMenuOpen(comment.id)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        aria-label="Comment options"
                        disabled={!!editingCommentId}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {isMenuOpen === comment.id && !editingCommentId && (
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

              {editingCommentId === comment.id ? (
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

            {!isReply && editingCommentId !== comment.id && (
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
      {isLoading ? (
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
