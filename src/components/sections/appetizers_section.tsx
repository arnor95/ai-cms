import React from 'react';
import Image from 'next/image';

interface AppetizersProps {
  appetizers: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
  }[];
  layout: 'grid' | 'list';
}

const Appetizers: React.FC<AppetizersProps> = ({ appetizers, layout }) => {
  return (
    <div className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Appetizers</h2>
        <div
          className={`grid ${
            layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : ''
          }`}
        >
          {appetizers.map((appetizer) => (
            <div
              key={appetizer.id}
              className={`bg-white shadow-md rounded-lg overflow-hidden ${
                layout === 'list' ? 'flex' : ''
              }`}
            >
              <div
                className={`${
                  layout === 'list' ? 'flex-shrink-0 w-48 h-48' : 'h-64'
                } relative`}
              >
                <Image
                  src={appetizer.imageUrl}
                  alt={appetizer.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className={`p-6 ${layout === 'list' ? 'flex-1' : ''}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {appetizer.name}
                </h3>
                <p className="text-gray-600 mb-4">{appetizer.description}</p>
                <p className="text-lg font-bold text-gray-900">${appetizer.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Appetizers;