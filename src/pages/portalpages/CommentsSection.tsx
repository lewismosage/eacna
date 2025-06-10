import { useState, useEffect } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import Avatar from "./Avatar";

interface Comment {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
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

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select(
            `
            *,
            author:membership_directory!user_id(first_name, last_name, avatar_url)
          `
          )
          .eq("post_id", postId)
          .is("parent_id", null)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Fetch replies for each comment
        const commentsWithReplies = await Promise.all(
          (data || []).map(async (comment) => {
            const { data: replies } = await supabase
              .from("comments")
              .select(
                `
                *,
                author:membership_directory!user_id(first_name, last_name, avatar_url)
              `
              )
              .eq("parent_id", comment.id)
              .order("created_at", { ascending: true });

            return {
              ...comment,
              replies: replies || [],
            };
          })
        );

        setComments(commentsWithReplies);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();

    // Set up real-time subscription
    const subscription = supabase
      .channel("comments_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        fetchComments
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [postId, supabase]);

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      // Get member ID from membership_directory
      const { data: memberData, error: memberError } = await supabase
        .from("membership_directory")
        .select("id")
        .eq("email", user.email)
        .single();

      if (memberError || !memberData) {
        throw new Error("Member not found");
      }

      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            user_id: memberData.id, // Use member ID
            post_id: postId,
            content: newComment,
          },
        ])
        .select();

      if (error) throw error;

      if (data?.[0]) {
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleAddReply = async (parentId: number) => {
    if (!user || !replyContent.trim()) return;

    try {
      // Get member ID from membership_directory
      const { data: memberData, error: memberError } = await supabase
        .from("membership_directory")
        .select("id")
        .eq("email", user.email)
        .single();

      if (memberError || !memberData) {
        throw new Error("Member not found");
      }

      const { error } = await supabase.from("comments").insert([
        {
          user_id: memberData.id, // Use member ID
          post_id: postId,
          parent_id: parentId,
          content: replyContent,
        },
      ]);

      if (error) throw error;

      setReplyingTo(null);
      setReplyContent("");
    } catch (error) {
      console.error("Error adding reply:", error);
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

  const renderComment = (comment: Comment, index: number, isReply = false) => (
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
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {comment.author.first_name} {comment.author.last_name}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.created_at)}
              </span>
            </div>
            <p className="mt-1 text-gray-700">{comment.content}</p>
          </div>
          {!isReply && (
            <button
              className="text-xs text-primary-600 mt-1 hover:text-primary-700"
              onClick={() =>
                setReplyingTo(replyingTo === comment.id ? null : comment.id)
              }
            >
              Reply
            </button>
          )}
          {replyingTo === comment.id && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <button
                className="px-3 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50"
                onClick={() => handleAddReply(comment.id)}
                disabled={!replyContent.trim()}
              >
                Post
              </button>
            </div>
          )}
        </div>
      </div>
      {comment.replies?.map((reply, index) =>
        renderComment(reply, index, true)
      )}
    </div>
  );

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex gap-3 mb-4">
        <Avatar
          user={{
            firstName: user?.user_metadata?.first_name || "User",
            lastName: user?.user_metadata?.last_name || "",
            profileImage: user?.user_metadata?.avatar_url || null,
          }}
          size="sm"
        />
        <div className="flex-1">
          <input
            type="text"
            placeholder="Write a comment..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <button
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Comment
            </button>
          </div>
        </div>
      </div>

      {comments.map((comment, index) => renderComment(comment, index))}
    </div>
  );
};

export default CommentsSection;
