import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Brain, ChevronDown, Search } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    closeMenu();
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/training', label: 'Training & Conferences' },
    { to: '/membership', label: 'Membership' },
    { to: '/resources', label: 'Resources' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/find-specialist', label: 'Find a Specialist' },
    { to: '/contact', label: 'Contact Us' },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(e.target.value.length > 0);
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-primary-700">
            <Brain className="h-8 w-8" />
            <div>
              <span className="text-xl font-bold font-display tracking-tight block">EACNA</span>
              <span className="text-xs text-primary-600 tracking-wider block">East African Child Neurology Association</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Search Bar */}
            <div className="relative ml-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-36 px-3 py-1.5 text-xs text-gray-900 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />

              {showSearchResults && (
                <div className="absolute mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No results found
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Button group - MODIFIED: smaller buttons for desktop */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link 
              to="/membership" 
              className="btn btn-primary px-3 py-1.5 text-xs"
            >
              Join/Renew
            </Link>
            <Link 
              to="/login" 
              className="btn border-primary-600 text-primary-600 hover:bg-primary-50 px-3 py-1.5 text-xs"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={toggleMenu}
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden transition-all duration-300 overflow-hidden ${
            isOpen ? 'max-h-screen opacity-100 pb-6' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col space-y-1 mt-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-md text-base font-medium ${
                    isActive
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                  }`
                }
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
            ))}

            {/* Mobile Search */}
            <div className="px-4 py-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 text-sm text-gray-900 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div className="flex flex-col space-y-2 pt-4">
              <Link 
                to="/membership" 
                className="btn btn-primary"
                onClick={closeMenu}
              >
                Join/Renew
              </Link>
              <Link 
                to="/login" 
                className="btn border-primary-600 text-primary-600 hover:bg-primary-50"
                onClick={closeMenu}
              >
                Login
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;