import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-3 px-4 sm:px-6">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500">
          <span>Made with</span>
          <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 fill-current" />
          <span>by</span>
          <a 
            href="https://www.studios8.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Studios8
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;