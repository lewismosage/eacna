import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, MessageSquare, BookOpen, Bell, Search,
  ThumbsUp, MessageCircle, Share2, MoreHorizontal, 
  FileText, UserPlus, Award, Settings, LogOut, Calendar
} from 'lucide-react';
import WritePublication from './WritePublicationPage';
import Notification from './Notifications';
import PostsFeed from './PostsFeed';

// Mock data for demonstration purposes
const MOCK_USER = {
  firstName: "Lewis",
  lastName: "Mosage",
  email: "lewis.mosage@example.com",
  profileImage: null,
  role: "Associate Member",
  joinDate: "May 2024",
  unreadNotifications: 3,
  country: "Kenya"
};

const MOCK_POSTS = [
  {
    id: 1,
    author: {
      name: "Dr. Samantha Njeri",
      role: "President, EACNA",
      avatar: "https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    content: "Excited to announce our upcoming PET1 training in Nairobi this July! This one-day course is perfect for doctors and nurses who contribute to the initial care of children with paroxysmal disorders. Limited spots available, register now via the Training section.",
    timestamp: "2 hours ago",
    likes: 24,
    comments: 5,
    isPinned: true,
    attachments: []
  },
  {
    id: 2,
    author: {
      name: "Dr. Benjamin Omondi",
      role: "Vice President, EACNA",
      avatar: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    content: "Looking for collaborators on a research project studying epilepsy management in rural East African settings. We're particularly interested in innovative approaches to medication adherence. If interested, please comment below or message me directly.",
    timestamp: "1 day ago",
    likes: 18,
    comments: 7,
    isPinned: false,
    attachments: [
      { type: "pdf", name: "Research_Proposal.pdf", size: "1.2MB" }
    ]
  },
  {
    id: 3,
    author: {
      name: "Dr. Faith Mueni",
      role: "Secretary General, EACNA",
      avatar: "https://images.pexels.com/photos/5214959/pexels-photo-5214959.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    content: "New clinical guidelines for childhood epilepsy management have just been published. These guidelines specifically address the unique challenges we face in East Africa. Check out the attached summary and full document in the Resources section of our portal.",
    timestamp: "3 days ago",
    likes: 42,
    comments: 11,
    isPinned: false,
    attachments: [
      { type: "pdf", name: "Epilepsy_Guidelines_Summary.pdf", size: "850KB" }
    ]
  },
  {
    id: 4,
    author: {
      name: "Dr. Lawrence Mwangi",
      role: "Treasurer, EACNA",
      avatar: "https://images.pexels.com/photos/5329163/pexels-photo-5329163.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    content: "Reminder: Annual membership renewals are due by the end of this month. Please log in to your account and navigate to the Membership section to complete your renewal. Early renewals get 10% discount on our upcoming annual conference registration!",
    timestamp: "1 week ago",
    likes: 15,
    comments: 3,
    isPinned: false,
    attachments: []
  }
];

const MOCK_EVENTS = [
  {
    id: 1,
    title: "PET1 Training Course",
    date: "July 15-16, 2025",
    location: "Nairobi, Kenya",
    registrationOpen: true
  },
  {
    id: 2,
    title: "Annual EACNA Conference",
    date: "September 5-7, 2025",
    location: "Kampala, Uganda",
    registrationOpen: true
  },
  {
    id: 3,
    title: "Pediatric Epilepsy Webinar",
    date: "June 12, 2025",
    location: "Online",
    registrationOpen: true
  }
];

// Custom components
const Avatar = ({ user, size = "md" }: { user: { firstName: string; lastName: string; profileImage: string | null }; size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg"
  };
  
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  
  return (
    <div className={`rounded-full bg-primary-600 text-white font-semibold flex items-center justify-center ${sizeClasses[size]}`}>
      {user.profileImage ? (
        <img 
          src={user.profileImage} 
          alt={`${user.firstName} ${user.lastName}`}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to: string;
  active: boolean;
  onClick?: () => void;
  badge?: number | null;
}

const NavItem = ({ icon: Icon, label, to, active, onClick, badge }: NavItemProps) => {
  const isHomeFeed = to === "/portal/home";
  
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
        active 
          ? "bg-primary-100 text-primary-800 font-medium" 
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <div className="relative">
        <Icon className="w-5 h-5" />
        {badge && (
          <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span>{label}</span>
    </div>
  );
};

interface PostProps {
  post: {
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
  };
}

const Post = ({ post }: PostProps) => {
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
          {post.attachments.map((file: { type: string; name: string; size: string }, index: number) => (
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

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  registrationOpen: boolean;
}

const UpcomingEvent = ({ event }: { event: Event }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-3">
      <h4 className="font-semibold text-primary-800">{event.title}</h4>
      <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
        <Calendar className="w-4 h-4" />
        <span>{event.date}</span>
      </div>
      <div className="text-gray-600 text-sm mt-1">
        {event.location}
      </div>
      {event.registrationOpen && (
        <Link 
          to="/events" 
          className="text-sm font-medium text-primary-600 hover:text-primary-700 mt-2 inline-block"
        >
          Register Now
        </Link>
      )}
    </div>
  );
};

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

const MemberPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState("home");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Set the current tab based on location
  useEffect(() => {
    const path = location.pathname.split('/')[2] || 'home';
    setCurrentTab(path);
  }, [location]);
  
  // Navigation items
const navItems = [
  { icon: Users, label: "Home Feed", path: "home", badge: null },
  { icon: BookOpen, label: "Publications", path: "publications", badge: null },
  { icon: Bell, label: "Notifications", path: "notifications", badge: MOCK_USER.unreadNotifications }
];
  
  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Handle navigation
const handleNavigation = (path: string) => {
  if (path !== "home") {
    navigate(`/portal/${path}`);
  }
  setIsMobileMenuOpen(false);
  setCurrentTab(path); // Always update the current tab
};
  
  // Handle logout
  const handleLogout = () => {
    // Implement actual logout logic here
    navigate('/login');
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/home" className="text-primary-800 font-bold text-xl">
                EACNA Member Portal
              </Link>
            </div>
            
            {/* Search */}
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search the community..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
                />
              </div>
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden focus:outline-none"
              onClick={toggleProfileDropdown}
            >
              <Avatar user={MOCK_USER} />
            </button>
            
            {/* User profile */}
            <div className="hidden md:flex items-center gap-3 relative">
              <div className="flex flex-col items-end mr-2">
                <span className="font-medium text-gray-800">{`${MOCK_USER.firstName} ${MOCK_USER.lastName}`}</span>
                <span className="text-xs text-gray-500">{MOCK_USER.email}</span>
              </div>
              
              <button 
                className="relative"
                onClick={toggleProfileDropdown}
              >
                <Avatar user={MOCK_USER} />
              </button>
              
              {/* Profile dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
                  <div className="p-3 border-b border-gray-100">
                    <div className="font-medium text-gray-800">{`${MOCK_USER.firstName} ${MOCK_USER.lastName}`}</div>
                    <div className="text-sm text-gray-500">{MOCK_USER.email}</div>
                    <div className="text-xs text-primary-600 mt-1">{MOCK_USER.role}</div>
                  </div>
                  
                  <div className="py-1">
                    <Link 
                      to="/portal/profile" 
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Profile Settings</span>
                    </Link>
                    
                    <Link 
                      to="/portal/membership" 
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Award className="w-5 h-5" />
                      <span>Membership Status</span>
                    </Link>
                    
                    
                  </div>
                  
                  <div className="border-t border-gray-100 py-1">
                    <button 
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 w-full text-left"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile profile dropdown */}
      {isProfileDropdownOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-3 space-y-1">
            {/* User info */}
            <div className="flex items-center gap-3 px-4 py-2">
              <Avatar user={MOCK_USER} size="lg" />
              <div>
                <div className="font-medium text-gray-800">{`${MOCK_USER.firstName} ${MOCK_USER.lastName}`}</div>
                <div className="text-xs text-gray-500">{MOCK_USER.email}</div>
                <div className="text-xs text-primary-600 mt-1">{MOCK_USER.role}</div>
              </div>
            </div>
            
            {/* Profile options */}
            <div className="border-t border-gray-100 pt-2">
              <Link 
                to="/portal/profile" 
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50"
                onClick={() => setIsProfileDropdownOpen(false)}
              >
                <Settings className="w-5 h-5" />
                <span>Profile Settings</span>
              </Link>
              
              <Link 
                to="/portal/membership" 
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50"
                onClick={() => setIsProfileDropdownOpen(false)}
              >
                <Award className="w-5 h-5" />
                <span>Membership Status</span>
              </Link>
              
              
            </div>
            
            {/* Sign out */}
            <div className="border-t border-gray-100 pt-2">
              <button 
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 w-full text-left"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="hidden md:block w-64 space-y-1">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar user={MOCK_USER} size="lg" />
                <div>
                  <h3 className="font-semibold text-gray-800">{`${MOCK_USER.firstName} ${MOCK_USER.lastName}`}</h3>
                  <p className="text-sm text-primary-600">{MOCK_USER.role}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p>Member since {MOCK_USER.joinDate}</p>
                <p>{MOCK_USER.country}</p>
              </div>
              <Link 
                to="/portal/profile" 
                className="mt-3 text-primary-600 text-sm font-medium hover:text-primary-700 block"
              >
                View Profile
              </Link>
            </div>
            
            <nav className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 mb-4">
              {navItems.map((item) => (
                <NavItem 
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  to={`/portal/${item.path}`}
                  active={currentTab === item.path}
                  badge={item.badge}
                  onClick={() => handleNavigation(item.path)}
                />
              ))}
            </nav>
            
            {/* Quick Links moved here */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/resources/guidelines" 
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Clinical Guidelines</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/training/pet-courses" 
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>PET Courses Schedule</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/membership/renew" 
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    <span>Renew Membership</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/resources/journal-access" 
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Journal Access</span>
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
          
          {/* Main content area */}
          <div className="flex-1">
            {/* Tabs for mobile */}
            <div className="md:hidden flex overflow-x-auto gap-2 pb-3 scrollbar-hide">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                    currentTab === item.path 
                      ? "bg-primary-100 text-primary-800 font-medium" 
                      : "bg-white text-gray-600 border border-gray-100"
                  }`}
                  onClick={() => {
                    if (item.path !== "home") {
                      navigate(`/portal/${item.path}`);
                    }
                    setCurrentTab(item.path);
                  }}
                >
                  <div className="relative">
                    <item.icon className="w-5 h-5" />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            
            {/* Dynamic Content based on current tab */}
            {currentTab === "home" && (
            <div className="flex flex-col lg:flex-row gap-6">
              <PostsFeed user={MOCK_USER} posts={MOCK_POSTS} />
              
              <div className="lg:w-72">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Upcoming Events</h3>
                    {MOCK_EVENTS.map((event) => (
                      <UpcomingEvent key={event.id} event={event} />
                    ))}
                    <Link 
                      to="/events" 
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 block text-center mt-2"
                    >
                      View All Events
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {currentTab === "publications" && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-primary-800 mb-6">My Publications</h2>
                <WritePublication />
              </div>
            )}
            {currentTab === "notifications" && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-primary-800 mb-6">Notifications</h2>
                <Notification />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPortal;