import React from "react";
import { Loader } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <Loader className="w-8 h-8 animate-spin text-purple-600" />
    </div>
  );
};

export default LoadingSpinner;