import { useEffect, useState } from "react";
import { useSupabase } from "../../context/SupabaseContext";
import { AlertCircle } from "lucide-react";
import PostComponent from "./Post";
import CreatePostCard from "./CreatePostCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import type { Post } from "../../types";

interface PostsFeedProps {
  user: {
    id: string; // Ensure this is a UUID string
    email?: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
      avatar_url?: string;
    };
  };
}

const PostsFeed = ({ user }: PostsFeedProps) => {
  const supabase = useSupabase();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const postsPerPage = 10;

  const fetchPosts = async (pageNum: number, refresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch posts with author data directly from posts table
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(
          `
        *,
        likes:reactions(count),
        comments:comments(count)
      `
        )
        .order("created_at", { ascending: false })
        .range(pageNum * postsPerPage, (pageNum + 1) * postsPerPage - 1);

      if (postsError) throw postsError;

      // 2. Get current user's liked posts
      const { data: currentMember } = await supabase
        .from("membership_directory")
        .select("user_id")
        .eq("email", user.email)
        .single();

      const { data: userLikes } = currentMember?.user_id
        ? await supabase
            .from("reactions")
            .select("post_id")
            .eq("user_id", currentMember.user_id)
        : { data: null };

      // 3. Process posts using the author data from posts table
      const processedPosts = (postsData || []).map((post) => ({
        id: post.id,
        user_id: post.user_id,
        content: post.content,
        created_at: post.created_at,
        author_first_name: post.author_first_name || "Unknown",
        author_last_name: post.author_last_name || "User",
        author_avatar_url: post.author_avatar_url || null,
        likes_count: post.likes?.[0]?.count || 0,
        comments_count: post.comments?.[0]?.count || 0,
        user_has_liked:
          userLikes?.some((like) => like.post_id === post.id) || false,
      }));

      setPosts((prev) =>
        refresh ? processedPosts : [...prev, ...processedPosts]
      );
      setHasMore((postsData?.length || 0) >= postsPerPage);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add console log to verify user.id is a UUID
    console.log("User ID:", user?.id, "Type:", typeof user?.id);
    fetchPosts(0, true);
  }, [user?.id]);

  const handleCreatePost = async (content: string, attachments?: File[]) => {
    if (!user?.email || !content.trim()) {
      setError("Invalid post content");
      return;
    }

    try {
      setError(null);

      // Get member's data
      const { data: memberData, error: memberError } = await supabase
        .from("membership_directory")
        .select("user_id, first_name, last_name, avatar_url")
        .eq("email", user.email)
        .single();

      if (memberError || !memberData?.user_id) {
        throw new Error("Failed to find member record");
      }

      const { data, error } = await supabase
        .from("posts")
        .insert([
          {
            user_id: memberData.user_id,
            content,
            attachments: null,
            author_first_name: memberData.first_name,
            author_last_name: memberData.last_name,
            author_avatar_url: memberData.avatar_url,
          },
        ])
        .select();

      if (error) throw error;

      fetchPosts(0, true);
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Failed to create post. Please try again.");
    }
  };

  const handleLike = async (postId: number) => {
    if (!user?.email) {
      setError("You must be logged in to like posts");
      return;
    }

    try {
      // Get member's UUID
      const { data: memberData, error: memberError } = await supabase
        .from("membership_directory")
        .select("user_id")
        .eq("email", user.email)
        .single();

      if (memberError || !memberData?.user_id) {
        throw new Error("Member not found");
      }

      const { error } = await supabase.from("reactions").upsert({
        user_id: memberData.user_id, // Use the UUID
        post_id: postId,
      });

      if (error) throw error;

      // Update local state
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes_count: p.user_has_liked
                  ? p.likes_count - 1
                  : p.likes_count + 1,
                user_has_liked: !p.user_has_liked,
              }
            : p
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      setError("Failed to update like status");
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <CreatePostCard
        onSubmit={handleCreatePost}
        user={{
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        }}
      />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => fetchPosts(0, true)}
              className="mt-1 text-sm text-primary-600 hover:text-primary-500"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostComponent
            key={post.id}
            post={post}
            onLike={() => handleLike(post.id)}
            currentUserId={user.id}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchPosts(nextPage);
            }}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner /> : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PostsFeed;