import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  title: string;
  navItems: string[];
  activePage: string;
  onPageChange: (page: string) => void;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  footerData: {
    name: string;
    description: string;
    location: string;
    phone: string;
    email: string;
    openingHours: {
      [key: string]: string;
    };
  };
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  navItems,
  activePage,
  onPageChange,
  primaryColor,
  secondaryColor,
  backgroundColor,
  textColor,
  headingFont,
  bodyFont,
  footerData
}) => {
  return (
    <div className="website-container" style={{ 
      backgroundColor, 
      color: textColor,
      fontFamily: bodyFont
    }}>
      {/* Header/Navigation */}
      <header className="py-4 px-6 flex justify-between items-center" style={{ 
        backgroundColor: primaryColor
      }}>
        <div className="text-white text-2xl font-semibold" style={{ 
          fontFamily: headingFont
        }}>
          {title}
        </div>
        <nav>
          <ul className="flex space-x-6">
            {navItems.map((item) => (
              <li key={item}>
                <a 
                  href="#" 
                  className={`text-white hover:text-opacity-80 transition ${activePage === item ? 'border-b-2' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(item);
                  }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="py-10 px-6 text-white" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-xl mb-4 text-white" style={{ fontFamily: headingFont }}>
                {footerData.name}
              </h3>
              <p className="mb-4 text-white opacity-80">
                {footerData.description.substring(0, 120)}...
              </p>
            </div>
            <div>
              <h3 className="text-xl mb-4 text-white" style={{ fontFamily: headingFont }}>
                Contact
              </h3>
              <p className="text-white opacity-80">{footerData.location}</p>
              <p className="text-white opacity-80">{footerData.phone}</p>
              <p className="text-white opacity-80">{footerData.email}</p>
            </div>
            <div>
              <h3 className="text-xl mb-4 text-white" style={{ fontFamily: headingFont }}>
                Opening Hours
              </h3>
              {Object.entries(footerData.openingHours).map(([day, hours], index) => (
                <p key={index} className="text-white opacity-80">{day}: {hours}</p>
              ))}
            </div>
          </div>
          <div className="border-t border-white border-opacity-20 mt-8 pt-6 text-center text-white opacity-60">
            <p>© {new Date().getFullYear()} {footerData.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 