import { useRef, useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, FileText, Paperclip } from 'lucide-react';
import Avatar from './Avatar';

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

interface User {
  first_name: string;
  last_name: string;
  profile_image?: string | null;
}

interface PostsFeedProps {
  user: User;
  posts: Post[];
}

const PostsFeed = ({ user, posts }: PostsFeedProps) => {
  return (
    <div className="flex-1 h-[calc(154.5vh-180px)] overflow-y-auto">
      <CreatePostCard user={{
        firstName: user.first_name,
        lastName: user.last_name,
        profileImage: user.profile_image || null
      }} />
      
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

const CreatePostCard = ({ user }: { user: { firstName: string; lastName: string; profileImage: string | null } }) => {
  const [postText, setPostText] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      const { selectionStart, selectionEnd } = e.currentTarget;
      const value = postText;
      setPostText(
        value.substring(0, selectionStart) + '\n' + value.substring(selectionEnd)
      );
      e.preventDefault();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Avatar user={user} />
        <div className="flex-1">
          <textarea
            placeholder="Start a discussion or share something with the community..."
            className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 resize-none"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={3}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {attachedFile && (
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-primary-600" />
          <span className="text-sm text-gray-700">{attachedFile.name}</span>
          <button
            className="text-xs text-red-500 ml-2"
            onClick={() => setAttachedFile(null)}
            type="button"
          >
            Remove
          </button>
        </div>
      )}

      <div className="flex justify-between items-center border-t border-gray-100 pt-3">
        <div className="flex gap-4">
          <button
            type="button"
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
            onClick={handleAttachClick}
          >
            <Paperclip className="w-5 h-5" />
            <span className="text-sm">Attach File</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <button
          className={`px-4 py-2 rounded-md text-white font-medium ${
            postText.trim()
              ? "bg-primary-600 hover:bg-primary-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={!postText.trim()}
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default PostsFeed;