import React from 'react';

interface LocationProps {
  title: string;
  address: string;
  description?: string;
  primaryColor: string;
  headingFont: string;
  bodyFont: string;
}

const Location: React.FC<LocationProps> = ({
  title,
  address,
  description = '',
  primaryColor,
  headingFont,
  bodyFont
}) => {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl mb-10 text-center" style={{ 
          fontFamily: headingFont, 
          color: primaryColor 
        }}>
          {title}
        </h2>
        <div className="h-80 bg-gray-200 mb-6 rounded">
          {/* Map placeholder */}
          <div className="h-full flex items-center justify-center">
            <p style={{ color: primaryColor, fontFamily: bodyFont }}>Map of {address}</p>
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-xl mb-2" style={{ 
            fontFamily: headingFont, 
            color: primaryColor 
          }}>
            How to Find Us
          </h3>
          {description && (
            <p className="max-w-2xl mx-auto mb-6" style={{ fontFamily: bodyFont }}>
              {description}
            </p>
          )}
          <p className="font-medium" style={{ 
            color: primaryColor,
            fontFamily: bodyFont
          }}>
            {address}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Location; 