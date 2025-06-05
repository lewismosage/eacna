import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { search } from "../utils/search";
import { SearchItem } from "../utils/searchIndex";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check auth state on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };

    checkAuth();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setIsLoggedIn(true);
      } else if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLoginClick = async () => {
    closeMenu();

    // Check if user is already logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // User is logged in, redirect to member portal
      navigate("/member-portal");
    } else {
      // User is not logged in, proceed to login page
      navigate("/login");
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Close menu when location changes
  useEffect(() => {
    closeMenu();
  }, [location]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      const { results } = search(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Handle search result selection
  const handleResultClick = (url: string) => {
    navigate(url);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    closeMenu();
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleResultClick(searchResults[0].url);
    }
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/training", label: "Training & Conferences" },
    { to: "/membership", label: "Membership" },
    { to: "/resources", label: "Resources" },
    { to: "/gallery", label: "Gallery" },
    { to: "/find-specialist", label: "Find a Specialist" },
    { to: "/contact", label: "Contact Us" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-primary-700">
            <img
              src="/eacnaLogo.jpg"
              alt="EACNA Logo"
              className="h-12 w-auto"
            />
            <div>
              <span className="text-xl font-bold font-display tracking-tight block">
                EACNA
              </span>
              <span className="text-xs text-primary-600 tracking-wider block">
                East African Child Neurology Association
              </span>
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
                      ? "text-primary-700 bg-primary-50"
                      : "text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Search Bar */}
            <div className="relative ml-2" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() =>
                    searchQuery.length > 0 && setShowSearchResults(true)
                  }
                  className="w-48 px-3 py-1.5 text-xs text-gray-900 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <Search className="h-4 w-4 text-gray-500" />
                </button>
              </form>

              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute mt-2 w-64 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleResultClick(result.url)}
                    >
                      <div className="font-medium text-primary-600">
                        {result.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Button group */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link
              to="/membership"
              className="btn btn-primary px-3 py-1.5 text-xs"
            >
              Join/Renew
            </Link>
            <button
              onClick={handleLoginClick}
              className="btn border-primary-600 text-primary-600 hover:bg-primary-50 px-3 py-1.5 text-xs"
            >
              {isLoggedIn ? "Member Portal" : "Login"}
            </button>
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
            isOpen ? "max-h-screen opacity-100 pb-6" : "max-h-0 opacity-0"
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
                      ? "text-primary-700 bg-primary-50"
                      : "text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                  }`
                }
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
            ))}

            {/* Mobile Search */}
            <div className="px-4 py-2" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() =>
                      searchQuery.length > 0 && setShowSearchResults(true)
                    }
                    className="w-full px-4 py-2 text-sm text-gray-900 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <Search className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </form>

              {showSearchResults && searchResults.length > 0 && (
                <div className="mt-2 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleResultClick(result.url)}
                    >
                      <div className="font-medium text-primary-600">
                        {result.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-2 pt-4">
              <Link
                to="/membership"
                className="btn btn-primary"
                onClick={closeMenu}
              >
                Join/Renew
              </Link>
              <button
                onClick={handleLoginClick}
                className="btn border-primary-600 text-primary-600 hover:bg-primary-50"
              >
                {isLoggedIn ? "Member Portal" : "Login"}
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
