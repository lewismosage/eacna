import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Brain,
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Mail,
  Settings,
  LogOut,
  Bell,
  MessageSquare,
  UserPlus,
  RefreshCw,
  Send,
  CheckCircle,
  BookOpen,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { 
      name: 'Events', 
      href: '/admin/events', 
      icon: Calendar,
      subItems: [
        { name: 'Training Events', href: '/admin/events/training' },
        { name: 'Annual Meetings', href: '/admin/events/meetings' },
        { name: 'Webinars', href: '/admin/events/webinars' },
        { name: 'Abstract Submissions', href: '/admin/events/abstracts' },
      ]
    },
    { 
      name: 'Members', 
      href: '/admin/members', 
      icon: Users,
      subItems: [
        { name: 'Applications', href: '/admin/members/applications' },
        { name: 'Payments', href: '/admin/members/payments' },
        { name: 'Directory', href: '/admin/members/directory' }
      ]
    },
    { 
      name: 'Publications', 
      href: '/admin/publications', 
      icon: FileText,
      subItems: [
        { name: 'Pending Review', href: '/admin/publications/review' },
        { name: 'Published', href: '/admin/publications/published' }
      ]
    },
    { 
      name: 'Specialists', 
      href: '/admin/specialists', 
      icon: UserPlus,
      subItems: [
        { name: 'Applications', href: '/admin/specialists/applications' },
        { name: 'Directory', href: '/admin/specialists/directory' },
      ]
    },
    { 
      name: 'Communications', 
      href: '/admin/communications', 
      icon: MessageSquare,
      subItems: [
        { name: 'Contact Messages', href: '/admin/communications/messages' },
        { name: 'Newsletter', href: '/admin/communications/newsletter' },
        { name: 'Subscribers', href: '/admin/communications/subscribers' }
      ]
    },
    { name: 'Settings', href: '/admin/settings', icon: Settings }
  ];

  const handleLogout = () => {
    // Add logout logic here
    navigate('/admin/login');
  };

  const toggleDropdown = (itemName: string) => {
    setOpenDropdowns(prevState => ({
      ...prevState,
      [itemName]: !prevState[itemName]
    }));
  };

  // Check if any subitem is active to highlight parent
  type NavigationItem = {
    name: string;
    href: string;
    icon?: React.ComponentType<any>;
    subItems?: { name: string; href: string }[];
  };

  const isItemActive = (item: NavigationItem) => {
    if (location.pathname === item.href) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => location.pathname === subItem.href);
    }
    return false;
  };

  // Example loading state (replace with your actual loading logic)
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out overflow-y-auto`}>
            <div className="flex items-center justify-between h-16 px-4 bg-primary-900">
              <Link to="/" className="flex items-center space-x-2 text-white">
                <Brain className="h-8 w-8" /> 
                <span className="text-xl font-bold">EACNA Admin</span>
              </Link>
            </div>
            
            <nav className="mt-8 space-y-1 px-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.subItems ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className={`flex items-center justify-between w-full px-4 py-2 text-sm font-medium rounded-md ${
                          isItemActive(item)
                            ? 'bg-primary-700 text-white'
                            : 'text-primary-100 hover:bg-primary-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </div>
                        {openDropdowns[item.name] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      
                      {openDropdowns[item.name] && (
                        <div className="ml-8 mt-1 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                                location.pathname === subItem.href
                                  ? 'bg-primary-700 text-white'
                                  : 'text-primary-100 hover:bg-primary-700'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        location.pathname === item.href
                          ? 'bg-primary-700 text-white'
                          : 'text-primary-100 hover:bg-primary-700'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
            
            <div className="absolute bottom-0 w-full p-4">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-primary-100 hover:bg-primary-700 rounded-md"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className={`${isSidebarOpen ? 'ml-64' : 'ml-0'} transition-margin duration-300 ease-in-out`}>
            {/* Top bar */}
            <div className="bg-white shadow-sm">
              <div className="flex items-center justify-between h-16 px-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <span className="sr-only">Toggle sidebar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>

                  {/* EACNA Heading */}
                  <div className="flex items-center space-x-2 text-primary-700">
                    <Brain className="h-8 w-8" />
                    <div>
                      <span className="text-xl font-bold font-display tracking-tight block">EACNA Admin Dashboard</span>
                      <span className="text-xs text-primary-600 tracking-wider block">East African Child Neurology Association</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-6 w-6" />
                  </button>
                  
                  <div className="relative">
                    <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://images.pexels.com/photos/5214947/pexels-photo-5214947.jpeg?auto=compress&cs=tinysrgb&w=600"
                        alt="Admin"
                      />
                      <span className="text-sm font-medium text-gray-700">Admin</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <main className="p-6">
              <Outlet />
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminLayout;