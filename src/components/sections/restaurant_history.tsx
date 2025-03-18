import React from 'react';

interface RestaurantHistoryProps {
  title: string;
  description: string;
  imageUrl: string;
}

const RestaurantHistory: React.FC<RestaurantHistoryProps> = ({
  title,
  description,
  imageUrl,
}) => {
  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <p className="text-gray-700 leading-relaxed">{description}</p>
          </div>
          <div>
            <img
              src={imageUrl}
              alt="Restaurant History"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantHistory;