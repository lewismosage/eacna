import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Home } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <Brain className="h-16 w-16 text-primary-500 mb-4" />
      <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-2">404</h1>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
      <p className="text-gray-600 max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
        Let's get you back to the right place.
      </p>
      <Button variant="primary" to="/" icon={Home}>
        Return Home
      </Button>
    </div>
  );
};

export default NotFoundPage;