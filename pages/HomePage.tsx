import React from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard';
import Footer from '../components/Footer';

// Simple SVG icons (placeholders)
const ConductIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-24 w-24 text-blue-600"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true" // Decorative icon
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <polyline points="22 12 18 12 15 21 9 3 22 3 22 12"></polyline>
  </svg>
);

const ParticipateIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-24 w-24 text-green-600"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true" // Decorative icon
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
    className="h-24 w-24 text-purple-600"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true" // Decorative icon
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
    <>
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[calc(100vh-80px)]">
        <div className="max-w-6xl text-center mb-16">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 mb-8 leading-tight drop-shadow-md">
            Seamless & Secure Student Elections
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-10 max-w-3xl mx-auto">
            Empowering colleges to manage elections efficiently, allowing students to participate actively, and ensuring fair voting.
          </p>
          <button
            onClick={handleGetStartedClick}
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-4 px-10 rounded-full text-xl shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Get Started Today
          </button>
        </div>

        <section className="w-full max-w-7xl px-4 py-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
            <FeatureCard
              icon={<ConductIcon />}
              title="Conduct Elections"
              description="Administrators can easily set up, manage, and monitor the entire election process with robust tools."
            />
            <FeatureCard
              icon={<ParticipateIcon />}
              title="Participate as Candidate"
              description="Students can confidently apply for various positions and effectively campaign within the system."
            />
            <FeatureCard
              icon={<CastVoteIcon />}
              title="Cast Secure Votes"
              description="Ensure fair and verifiable voting with unique QR codes for each student, preventing fraud."
            />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default HomePage;