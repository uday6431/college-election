import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-6 text-center mt-auto shadow-inner">
      <div className="container mx-auto">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} College Election System. All rights reserved.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Developed with ❤️ for secure student elections.
        </p>
      </div>
    </footer>
  );
};

export default Footer;