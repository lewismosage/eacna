import React, { useState, useEffect } from 'react';
import { Menu, X, Brain } from 'lucide-react';

const navigation = [
  { title: 'Home', href: '/' },
  { title: 'About', href: '/about' },
  { title: 'Resources', href: '/resources' },
  { title: 'Events', href: '/events' },
  { title: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <a href="/" className="flex-shrink-0 flex items-center space-x-3">
              <Brain className={`h-8 w-8 ${isScrolled ? 'text-blue-600' : 'text-white'}`} />
              <span className={`text-2xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                EACNA
              </span>
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isScrolled
                    ? 'text-gray-700 hover:text-blue-600'
                    : 'text-white hover:text-blue-200'
                }`}
              >
                {item.title}
              </a>
            ))}
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isScrolled
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-blue-900 hover:bg-blue-50'
              }`}
            >
              Member Portal
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                {item.title}
              </a>
            ))}
            <button className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Member Portal
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}