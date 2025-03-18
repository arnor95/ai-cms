import React from 'react';

interface RestaurantProps {
  history?: string;
}

const Restaurant: React.FC<RestaurantProps> = ({ history }) => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Our Story</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Restaurant History
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            {history || "Our restaurant has a rich history dating back many years. We take pride in our tradition of excellence."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Restaurant; 