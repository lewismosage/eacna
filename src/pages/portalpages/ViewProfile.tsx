import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  MapPin,
  Calendar,
  Heart,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image?: string | null;
  membership_type: string;
  member_since: string;
  nationality: string;
  country_of_residence: string;
  city?: string;
  current_profession?: string;
  institution?: string;
  bio?: string;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes: number;
  replies: number;
  thread_id?: string;
}

const ViewProfile = () => {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const formatMembershipType = (membershipType: string) => {
    return membershipType.replace('Membership', 'Member');
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);

        // Get current authenticated user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }

        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from("membership_directory")
          .select("*")
          .eq("email", user.email)
          .single();

        if (profileError) throw profileError;
        if (!profileData) throw new Error("User profile not found");

        setUserData(profileData);

        // Fetch user posts
        const { data: posts, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (postsError) throw postsError;
        setUserPosts(posts || []);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const PostsTab = () => {
    if (!userData) return null;

    if (userPosts.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Posts</h2>
          <p className="text-gray-600">You haven't posted anything yet.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Posts</h2>

        <div className="space-y-6">
          {userPosts.map((post) => (
            <div
              key={post.id}
              className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0"
            >
              {/* Post Header with User Info */}
              <div className="flex items-start gap-3 mb-2">
                {userData.profile_image ? (
                  <img
                    src={userData.profile_image}
                    alt={`${userData.first_name} ${userData.last_name}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold">
                    {userData.first_name.charAt(0)}
                    {userData.last_name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-900">
                      {userData.first_name} {userData.last_name}
                    </span>
                    <span className="text-gray-500 text-sm">
                      · {formatDate(post.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="pl-[52px]">
                <p className="text-gray-800 whitespace-pre-wrap mb-2">
                  {post.content}
                </p>

                {/* Post Actions */}
                <div className="flex gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1 hover:text-primary-600 cursor-pointer">
                    <Heart className="h-4 w-4" />
                    {post.likes} likes
                  </span>
                  <span className="flex items-center gap-1 hover:text-primary-600 cursor-pointer">
                    <MessageCircle className="h-4 w-4" />
                    {post.replies} replies
                  </span>
                  {post.thread_id && (
                    <Link
                      to={`/forum/thread/${post.thread_id}`}
                      className="text-primary-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View thread
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Profile Not Found
          </h2>
          <p className="text-gray-600">
            We couldn't find your profile information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-primary-800 mb-6">Your Profile</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Profile Image */}
          <div className="relative">
            {userData.profile_image ? (
              <img
                src={userData.profile_image}
                alt={`${userData.first_name} ${userData.last_name}`}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-4xl border-4 border-white shadow">
                {userData.first_name.charAt(0)}
                {userData.last_name.charAt(0)}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900">
              {userData.first_name} {userData.last_name}
            </h1>
            <p className="text-primary-600 font-medium">
              {formatMembershipType(userData.membership_type)}
            </p>
            {userData.current_profession && (
              <p className="text-gray-600 mt-1">
                {userData.current_profession}
              </p>
            )}

            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{userData.email}</span>
              </div>
              {(userData.city || userData.country_of_residence) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {userData.city ? `${userData.city}, ` : ""}
                    {userData.country_of_residence}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Member since {formatDate(userData.member_since)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {userData.bio && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h3 className="font-medium text-gray-700 mb-2">About</h3>
            <p className="text-gray-600">{userData.bio}</p>
          </div>
        )}
      </div>
      <PostsTab />
    </div>
  );
};

export default ViewProfile;