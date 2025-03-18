import React from 'react';
import Image from 'next/image';

interface HistorySectionProps {
  title: string;
  description: string;
  images?: string[];
}

const HistorySection: React.FC<HistorySectionProps> = ({
  title,
  description,
  images = [],
}) => {
  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-8 text-center">{title}</h2>
        <div className="flex flex-col md:flex-row items-center justify-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <p className="text-lg leading-relaxed">{description}</p>
          </div>
          <div className="md:w-1/2 flex justify-center">
            {images.map((image, index) => (
              <div
                key={index}
                className="mx-2 rounded-lg overflow-hidden shadow-md"
              >
                <Image
                  src={image}
                  alt={`Historical Image ${index + 1}`}
                  width={300}
                  height={200}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistorySection;