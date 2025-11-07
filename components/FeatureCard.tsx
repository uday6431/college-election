import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:translate-y-[-4px] cursor-default border border-gray-100">
      <div className="flex justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">{title}</h3>
      <p className="text-gray-600 text-center leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;