import React from 'react';
import Image from 'next/image';

interface AboutSectionProps {
  imageUrl: string;
  videoUrl?: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ imageUrl, videoUrl }) => {
  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold mb-4">About Our Restaurant</h2>
            <p className="text-gray-700 mb-4">
              At our restaurant, we believe in using only the freshest, locally-sourced ingredients to create a unique fusion of Nordic and Icelandic cuisines. Our philosophy is rooted in a deep respect for nature and a commitment to sustainable practices.
            </p>
            <p className="text-gray-700">
              Our chefs meticulously craft each dish, combining traditional techniques with modern flair to deliver an unforgettable dining experience. From the moment you step through our doors, you'll be transported to a world of culinary excellence and warm hospitality.
            </p>
          </div>
          <div className="md:w-1/2">
            {videoUrl ? (
              <video className="w-full" controls>
                <source src={videoUrl} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={imageUrl}
                alt="Restaurant Ambiance"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;