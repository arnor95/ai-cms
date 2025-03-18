import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

// Define the data types
type SitemapSection = {
  type: string;
  description: string;
};

type Sitemap = {
  [pageName: string]: SitemapSection[];
};

type RestaurantData = {
  name: string;
  description: string;
  menu?: string;
  location?: string;
  openingHours?: string;
  phone?: string;
  email?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
};

type BrandGuide = {
  palette: {
    name: string;
    colors: string[];
    description: string;
  };
  fontPair: string;
  businessName?: string;
};

type WebsiteData = {
  restaurantData: RestaurantData;
  sitemap: Sitemap;
  brandGuide: BrandGuide;
};

const Preview: NextPage = () => {
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // In a production environment, we would fetch the generated website data
    // from an API endpoint or load it from a file
    
    // For now, we'll simulate loading the data from sessionStorage
    try {
      const restaurantData = sessionStorage.getItem('restaurantData');
      const sitemap = sessionStorage.getItem('sitemap');
      const brandGuide = sessionStorage.getItem('brandGuide');
      
      if (restaurantData && sitemap && brandGuide) {
        setWebsiteData({
          restaurantData: JSON.parse(restaurantData),
          sitemap: JSON.parse(sitemap),
          brandGuide: JSON.parse(brandGuide),
        });
      }
    } catch (error) {
      console.error('Error loading website data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Loading website preview...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!websiteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-semibold mb-4">Website Not Generated Yet</h1>
          <p className="text-gray-600 mb-6">
            Your website has not been generated or the generation process is not complete.
          </p>
          <Link href="/website" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Return to Website Generator
          </Link>
        </div>
      </div>
    );
  }

  // Extract values from the data
  const { restaurantData, sitemap, brandGuide } = websiteData;
  
  // Create derived color scheme from the palette
  const colors = {
    primary: brandGuide.palette.colors[0] || '#4A6C6F',
    secondary: brandGuide.palette.colors[1] || '#846C5B',
    accent: brandGuide.palette.colors[2] || '#9B8357',
    background: brandGuide.palette.colors[4] || '#F1EDEA',
    text: brandGuide.palette.colors[3] || '#333333'
  };
  
  // Determine typography based on the font pair
  const typography = {
    headings: brandGuide.fontPair.includes('Oswald') ? 'Oswald, sans-serif' : 'Playfair Display, serif',
    body: brandGuide.fontPair.includes('Open Sans') ? 'Open Sans, sans-serif' : 'Montserrat, sans-serif'
  };

  // Derive navigation items from sitemap
  const navItems = Object.keys(sitemap);

  return (
    <>
      <Head>
        <title>{restaurantData.name || 'Restaurant Website'} Preview</title>
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Open+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <style jsx global>{`
        :root {
          --color-primary: ${colors.primary};
          --color-secondary: ${colors.secondary};
          --color-accent: ${colors.accent};
          --color-background: ${colors.background};
          --color-text: ${colors.text};
          --font-headings: ${typography.headings};
          --font-body: ${typography.body};
        }
        
        body {
          background-color: var(--color-background);
          color: var(--color-text);
          font-family: var(--font-body);
          margin: 0;
          padding: 0;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-headings);
          color: var(--color-primary);
        }
      `}</style>
      
      <div className="preview-container">
        {/* Header/Navigation */}
        <header className="py-4 px-6 flex justify-between items-center" style={{ backgroundColor: colors.primary }}>
          <div className="text-white text-2xl font-semibold" style={{ fontFamily: typography.headings }}>
            {restaurantData.name || 'Restaurant Name'}
          </div>
          <nav>
            <ul className="flex space-x-6">
              {navItems.map((item) => (
                <li key={item}>
                  <a href="#" className="text-white hover:text-opacity-80 transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        
        {/* Hero Section */}
        <section className="py-16 px-6 text-center" style={{ 
          backgroundColor: colors.secondary,
          color: '#fff',
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(/restaurant-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <h1 className="text-5xl mb-6 text-white" style={{ fontFamily: typography.headings }}>
            {restaurantData.name || 'Restaurant Name'}
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white">
            {restaurantData.description || 'A unique culinary experience with the finest ingredients...'}
          </p>
          <div className="flex justify-center space-x-4">
            <button className="px-6 py-3 rounded" style={{ backgroundColor: colors.accent }}>
              Reserve a Table
            </button>
            <button className="px-6 py-3 bg-transparent border border-white rounded">
              View Menu
            </button>
          </div>
        </section>
        
        {/* Sitemap Data Section */}
        <div className="container mx-auto py-12 px-6">
          <h2 className="text-3xl mb-8 text-center" style={{ fontFamily: typography.headings }}>
            Sitemap Structure
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(sitemap).map(([pageName, sections]) => (
              <div key={pageName} className="border rounded-lg p-6 shadow-sm">
                <h3 className="text-2xl mb-4" style={{ fontFamily: typography.headings }}>
                  {pageName}
                </h3>
                <ul className="space-y-4">
                  {sections.map((section: SitemapSection, index: number) => (
                    <li key={index} className="border-l-4 pl-4 py-2" style={{ borderColor: colors.accent }}>
                      <h4 className="font-semibold text-lg mb-1">{section.type}</h4>
                      <p className="text-sm text-gray-600">{section.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* Brand Guide Section */}
        <div className="py-12 px-6" style={{ backgroundColor: colors.background }}>
          <div className="container mx-auto">
            <h2 className="text-3xl mb-8 text-center" style={{ fontFamily: typography.headings }}>
              Brand Guide
            </h2>
            
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-2xl mb-4" style={{ fontFamily: typography.headings }}>Color Palette: {brandGuide.palette.name}</h3>
              
              <div className="grid grid-cols-5 gap-4 mb-8">
                {brandGuide.palette.colors.map((color: string, index: number) => (
                  <div key={index} className="text-center">
                    <div 
                      className="h-16 w-full rounded-lg mb-2" 
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-sm">{color}</span>
                  </div>
                ))}
              </div>
              
              <h3 className="text-2xl mb-4" style={{ fontFamily: typography.headings }}>Typography</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-2">Headings</h4>
                  <p className="text-2xl" style={{ fontFamily: typography.headings }}>
                    {typography.headings.split(',')[0]}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Body Text</h4>
                  <p style={{ fontFamily: typography.body }}>
                    {typography.body.split(',')[0]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white p-4 text-center">
          <p className="mb-2">This is a preview of your generated website. The final implementation will use this structure.</p>
          <div className="flex justify-center space-x-4">
            <Link href="/website" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Return to Generator
            </Link>
            <Link href="/" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Start Over
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Preview; 