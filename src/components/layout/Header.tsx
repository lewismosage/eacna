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
  const [pendingHash, setPendingHash] = useState<string | null>(null);

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

  // Improved click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        // Only close if clicking outside both input and results
        const isSearchInput = (event.target as HTMLElement).closest(
          'input[type="text"]'
        );
        const isSearchResult = (event.target as HTMLElement).closest(
          ".search-result-item"
        );

        if (!isSearchInput && !isSearchResult) {
          setShowSearchResults(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Improved handleResultClick
  const handleResultClick = (url: string) => {
    setShowSearchResults(false);
    setSearchQuery("");
    setSearchResults([]);

    if (url.includes("#")) {
      const [path, hash] = url.split("#");
      if (location.pathname !== path) {
        navigate(path, { state: { scrollTo: hash } });
      } else {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else {
      navigate(url);
    }
    closeMenu();
  };

  // Scroll to hash after navigation
  useEffect(() => {
    if (pendingHash) {
      const element = document.getElementById(pendingHash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setPendingHash(null);
      }
    }
  }, [location, pendingHash]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleResultClick(searchResults[0].url);
    } else if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Improved handleSearchChange with debounce
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

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/training", label: "Training & Conferences" },
    { to: "/membership", label: "Membership" },
    { to: "/resources", label: "Resources" },
    { to: "/find-specialist", label: "Find a Specialist" },
    { to: "/contact", label: "Contact Us" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-white"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex">
          {/* Logo spanning both rows */}
          <div className="flex flex-col justify-center items-center mr-8">
            <Link
              to="/"
              className="flex flex-col items-center text-primary-700 select-none"
            >
              <img
                src="/eacnaLogo.jpg"
                alt="EACNA Logo"
                className="h-24 w-auto md:h-32 lg:h-36 transition-all duration-300"
                style={{ minHeight: "96px" }}
              />
            </Link>
          </div>
          {/* Right side: stacked rows */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Upper Row: Membership buttons and Search */}
            <div className="flex justify-end items-center py-2 border-b border-gray-100 space-x-3">
              <Link
                to="/membership"
                className="btn bg-purple-900 text-white hover:bg-purple-950 px-4 py-2 text-sm font-medium"
              >
                Join/Renew
              </Link>
              <button
                onClick={handleLoginClick}
                className="btn border-purple-600 text-purple-600 hover:bg-primary-50 px-4 py-2 text-sm font-medium"
              >
                {isLoggedIn ? "Member Portal" : "Login"}
              </button>
              <div className="relative ml-3 hidden md:block" ref={searchRef}>
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                    className="w-48 px-4 py-2 text-sm text-gray-900 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <Search className="h-4 w-4 text-gray-500" />
                  </button>
                </form>
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute mt-2 w-64 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer search-result-item"
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
            </div>
            {/* Lower Row: Navigation links */}
            <div className="flex items-center justify-end py-4 lg:bg-purple-950 w-full">
              <nav className="hidden lg:flex items-center space-x-2">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-md text-base font-medium transition-colors text-white ${
                        isActive
                          ? "bg-purple-900"
                          : "hover:text-purple-200 hover:bg-purple-950"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 ml-2"
                onClick={toggleMenu}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        <div
          className={`lg:hidden transition-all duration-300 overflow-hidden ${
            isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pt-2 pb-4 space-y-2">
            {/* Mobile Search */}
            <div className="px-2" ref={searchRef}>
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

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-1">
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
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
