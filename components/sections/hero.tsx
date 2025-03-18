import React from 'react';

interface HeroProps {
  data?: any;
}

export default function Hero({ data }: HeroProps) {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-blue-100 to-purple-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-900">
              {data?.headline || "Welcome to Our Restaurant"}
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              {data?.description || "Experience delicious cuisine in a warm and inviting atmosphere. Our restaurant offers a unique dining experience with freshly prepared dishes made from the finest ingredients."}
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition-colors">
                Reserve a Table
              </button>
              <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-6 rounded-full transition-colors">
                View Menu
              </button>
            </div>
          </div>
          <div className="relative h-64 md:h-auto overflow-hidden rounded-lg shadow-xl">
            <div className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-500">
              Restaurant Image
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 