import React from 'react';
import Image from 'next/image';

interface DessertItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

interface DessertsProps {
  desserts: DessertItem[];
}

const Desserts: React.FC<DessertsProps> = ({ desserts }) => {
  return (
    <div className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Desserts</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Indulge in our Sweet Treats
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Satisfy your sweet tooth with our delectable dessert selection.
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 xl:gap-x-8">
            {desserts.map((dessert) => (
              <div key={dessert.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={dessert.imageUrl}
                    alt={dessert.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{dessert.name}</h3>
                  <p className="mt-2 text-gray-600">{dessert.description}</p>
                  <p className="mt-4 text-indigo-600 font-semibold">${dessert.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Desserts;