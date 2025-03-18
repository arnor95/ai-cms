import React from 'react';

interface RestaurantHistoryProps {
  title: string;
  description: string;
}

const RestaurantHistory: React.FC<RestaurantHistoryProps> = ({ title, description }) => {
  return (
    <section className="bg-gray-100 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{title}</h2>
        </div>
        <div className="mt-8">
          <p className="text-xl text-gray-500">{description}</p>
        </div>
      </div>
    </section>
  );
};

export default RestaurantHistory;