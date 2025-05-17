import { useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, FileText } from 'lucide-react';
import Avatar from './Avatar'; // You'll need to move the Avatar component to its own file
import CreatePostCard from './CreatePostCard';

interface Post {
  id: number;
  author: {
    name: string;
    role: string;
    avatar: string | null;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isPinned: boolean;
  attachments: { type: string; name: string; size: string }[];
}

interface PostsFeedProps {
  user: {
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
  posts: Post[];
}

const PostsFeed = ({ user, posts }: PostsFeedProps) => {
  return (
    <div className="flex-1 h-[calc(128.5vh-180px)] overflow-y-auto"> {/* Fixed height with scroll */}
      <CreatePostCard user={user} />
      
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};

const Post = ({ post }: { post: Post }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  
  const handleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      {/* Post header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {post.author.avatar ? (
            <img 
              src={post.author.avatar} 
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-semibold">
              {post.author.name.charAt(0)}
            </div>
          )}
          <div>
            <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span>{post.author.role}</span>
              <span className="inline-block w-1 h-1 rounded-full bg-gray-400"></span>
              <span>{post.timestamp}</span>
            </p>
          </div>
        </div>
        
        {post.isPinned && (
          <div className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-md font-medium">
            Pinned
          </div>
        )}
      </div>
      
      {/* Post content */}
      <div className="mb-3">
        <p className="text-gray-700">{post.content}</p>
      </div>
      
      {/* Attachments if any */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="mb-4">
          {post.attachments.map((file, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-lg p-3 flex items-center gap-3"
            >
              <FileText className="w-5 h-5 text-primary-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-500">{file.size}</p>
              </div>
              <button className="text-primary-600 text-sm font-medium">
                View
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Post stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 py-2 border-t border-b border-gray-100">
        <span>{likesCount} likes</span>
        <span>{post.comments} comments</span>
      </div>
      
      {/* Post actions */}
      <div className="flex items-center justify-between pt-2">
        <button 
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${
            liked 
              ? "text-primary-600 font-medium" 
              : "text-gray-600 hover:bg-gray-50"
          }`}
          onClick={handleLike}
        >
          <ThumbsUp className="w-5 h-5" />
          <span>{liked ? "Liked" : "Like"}</span>
        </button>
        
        <button className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50">
          <MessageCircle className="w-5 h-5" />
          <span>Comment</span>
        </button>
        
        <button className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50">
          <Share2 className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostsFeed;