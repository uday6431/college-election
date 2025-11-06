import React from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard';

// Simple SVG icons (placeholders)
const ConductIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-16 w-16 text-blue-500"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <polyline points="22 12 18 12 15 21 9 3 22 3 22 12"></polyline>
  </svg>
);

const ParticipateIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-16 w-16 text-green-500"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const CastVoteIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-16 w-16 text-purple-500"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 17v-2a3 3 0 0 0-3-3H9V3a3 3 0 0 0-3-3H3a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-2h4v2a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v2"></path>
    <circle cx="9" cy="9" r="2"></circle>
  </svg>
);


const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-100 min-h-[calc(100vh-80px)]">
      <div className="max-w-4xl text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">Manage Student Elections</h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-8">
          Faculty manage how elections are conducted, interested students participate, and remaining students cast their vote.
        </p>
        <button
          onClick={handleGetStartedClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
        >
          Get Started
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <FeatureCard
          icon={<ConductIcon />}
          title="Conduct Elections"
          description="Faculty oversee the election process and manage the voting system."
        />
        <FeatureCard
          icon={<ParticipateIcon />}
          title="Participate in Positions"
          description="Students can apply for positions they are interested in and campaign for votes."
        />
        <FeatureCard
          icon={<CastVoteIcon />}
          title="Cast Votes"
          description="Students securely cast their votes using unique QR codes provided by the system."
        />
      </div>
    </div>
  );
};

export default HomePage;
