import React from 'react';

interface MenuItem {
  name: string;
  price: string;
  description: string;
}

interface FeaturedMenuProps {
  title: string;
  items: MenuItem[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
}

const FeaturedMenu: React.FC<FeaturedMenuProps> = ({
  title,
  items,
  primaryColor,
  secondaryColor,
  accentColor,
  headingFont,
  bodyFont
}) => {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl mb-10 text-center" style={{ 
          fontFamily: headingFont, 
          color: primaryColor 
        }}>
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
              <div className="h-48 bg-gray-200" style={{ backgroundColor: secondaryColor }}>
                {/* Image placeholder */}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold" style={{ color: primaryColor, fontFamily: headingFont }}>
                    {item.name}
                  </h3>
                  <span className="text-sm font-medium" style={{ color: accentColor }}>
                    {item.price}
                  </span>
                </div>
                <p className="text-sm text-gray-600" style={{ fontFamily: bodyFont }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedMenu; 