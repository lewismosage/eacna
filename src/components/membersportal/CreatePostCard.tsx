import { useState } from 'react';
import { FileText } from 'lucide-react';
import Avatar from './Avatar';

interface User {
  firstName: string;
  lastName: string;
  profileImage: string | null;
}

const CreatePostCard = ({ user }: { user: User }) => {
  const [postText, setPostText] = useState('');
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Avatar user={user} />
        <div className="flex-1">
          <input
            type="text"
            placeholder="Start a discussion or share something with the community..."
            className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center border-t border-gray-100 pt-3">
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-gray-600 hover:text-primary-600">
            <FileText className="w-5 h-5" />
            <span className="text-sm">Attach File</span>
          </button>
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

export default CreatePostCard;