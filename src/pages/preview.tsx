import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

// Import generated components
import Layout from '../../components/generated/Layout';
import Hero from '../../components/generated/Hero';
import FeaturedMenu from '../../components/generated/FeaturedMenu';
import About from '../../components/generated/About';
import Menu from '../../components/generated/Menu';
import Location from '../../components/generated/Location';
import Contact from '../../components/generated/Contact';

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
  const [activePage, setActivePage] = useState<string>('Home');
  const [showStructure, setShowStructure] = useState<boolean>(false);

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

  // Parse opening hours into an object
  const openingHours = {
    'Monday - Thursday': '11:30 - 22:00',
    'Friday - Saturday': '11:30 - 23:00',
    'Sunday': '12:00 - 21:00'
  };

  // Create menu data
  const menuData = {
    categories: [
      {
        title: 'Starters',
        items: [
          { name: 'Cured Salmon', price: '2.390 kr.', description: 'With mustard sauce and rye bread' },
          { name: 'Smoked Duck', price: '2.690 kr.', description: 'With berry sauce' },
          { name: 'Mushroom Soup', price: '1.990 kr.', description: 'With truffle oil' }
        ]
      },
      {
        title: 'Main Courses',
        items: [
          { name: 'Lamb Rack', price: '4.990 kr.', description: 'With root vegetables and red wine sauce' },
          { name: 'Arctic Char', price: '3.890 kr.', description: 'With butter sauce and herb potatoes' },
          { name: 'Beef Tenderloin', price: '5.490 kr.', description: 'With béarnaise sauce and fried potatoes' },
          { name: 'Vegetarian Dish of the Day', price: '3.290 kr.', description: 'Ask your server for details' }
        ]
      },
      {
        title: 'Desserts',
        items: [
          { name: 'Skyr', price: '1.490 kr.', description: 'With berries and honey' },
          { name: 'Chocolate Cake', price: '1.690 kr.', description: 'With vanilla ice cream' },
          { name: 'Crème Brûlée', price: '1.590 kr.', description: 'Classic French dessert with a Nordic twist' }
        ]
      }
    ]
  };

  // Featured menu items
  const featuredItems = [
    { name: 'Lamb Rack', price: '4.990 kr.', description: 'With root vegetables and red wine sauce' },
    { name: 'Arctic Char', price: '3.890 kr.', description: 'With butter sauce and herb potatoes' },
    { name: 'Mushroom Soup', price: '1.990 kr.', description: 'With truffle oil and freshly baked bread' }
  ];

  // Function to render the specific section based on type
  const renderSection = (type: string, description: string, index: number) => {
    switch (type) {
      case 'Hero Section':
        return (
          <Hero
            key={index}
            title={restaurantData.name}
            description={restaurantData.description}
            primaryColor={colors.primary}
            secondaryColor={colors.secondary}
            accentColor={colors.accent}
            headingFont={typography.headings}
            bodyFont={typography.body}
          />
        );
      
      case 'Featured Menu Items':
      case 'Featured':
        return (
          <FeaturedMenu
            key={index}
            title="Featured Dishes"
            items={featuredItems}
            primaryColor={colors.primary}
            secondaryColor={colors.secondary}
            accentColor={colors.accent}
            headingFont={typography.headings}
            bodyFont={typography.body}
          />
        );
      
      case 'About Section':
      case 'About':
      case 'About Us':
        return (
          <About
            key={index}
            title={`About ${restaurantData.name}`}
            description={restaurantData.description}
            additionalText="Our commitment to quality means we source the freshest local ingredients, working closely with Icelandic farmers and fishermen to bring you authentic Nordic flavors with a modern twist."
            primaryColor={colors.primary}
            secondaryColor={colors.secondary}
            backgroundColor={colors.background}
            headingFont={typography.headings}
            bodyFont={typography.body}
          />
        );

      case 'Menu':
      case 'Menu Categories':
        return (
          <Menu
            key={index}
            title="Our Menu"
            categories={menuData.categories}
            primaryColor={colors.primary}
            accentColor={colors.accent}
            headingFont={typography.headings}
            bodyFont={typography.body}
          />
        );

      case 'Contact Form':
      case 'Contact Information':
      case 'Contact':
        return (
          <Contact
            key={index}
            title="Contact Us"
            location={restaurantData.location || 'Laugavegur 105, 101 Reykjavík'}
            phone={restaurantData.phone || '552-1234'}
            email={restaurantData.email || 'midgardur@example.is'}
            openingHours={openingHours}
            primaryColor={colors.primary}
            accentColor={colors.accent}
            headingFont={typography.headings}
            bodyFont={typography.body}
          />
        );

      case 'Map and Directions':
      case 'Location':
        return (
          <Location
            key={index}
            title="Our Location"
            address={restaurantData.location || 'Laugavegur 105, 101 Reykjavík'}
            description="We are located in the heart of downtown Reykjavík on Laugavegur, the main shopping street. Look for our distinctive blue facade with the wooden sign."
            primaryColor={colors.primary}
            headingFont={typography.headings}
            bodyFont={typography.body}
          />
        );

      // Add more section types as needed
      default:
        return (
          <section key={index} className="py-10 px-6 border-t">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl mb-4" style={{ fontFamily: typography.headings, color: colors.primary }}>
                {type}
              </h2>
              <p className="mb-4 text-gray-600">
                {description}
              </p>
              <div className="p-6 border rounded-md bg-gray-50 text-center">
                <p>This section will be generated based on your sitemap.</p>
              </div>
            </div>
          </section>
        );
    }
  };

  // Render the current page based on the sitemap
  const renderCurrentPage = () => {
    if (!sitemap[activePage]) return null;
    
    return sitemap[activePage].map((section, index) => 
      renderSection(section.type, section.description, index)
    );
  };

  // Render the sitemap structure if requested
  const renderSitemapStructure = () => {
    if (!showStructure) return null;
    
    return (
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
    );
  };

  const footerData = {
    name: restaurantData.name,
    description: restaurantData.description,
    location: restaurantData.location || 'Laugavegur 105, 101 Reykjavík',
    phone: restaurantData.phone || 'Phone: 552-1234',
    email: restaurantData.email || 'Email: midgardur@example.is',
    openingHours: openingHours
  };

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
      
      <Layout
        title={restaurantData.name}
        navItems={navItems}
        activePage={activePage}
        onPageChange={setActivePage}
        primaryColor={colors.primary}
        secondaryColor={colors.secondary}
        backgroundColor={colors.background}
        textColor={colors.text}
        headingFont={typography.headings}
        bodyFont={typography.body}
        footerData={footerData}
      >
        {/* Render current page content */}
        {renderCurrentPage()}
        
        {/* Render sitemap structure if requested */}
        {renderSitemapStructure()}
      </Layout>
      
      {/* Navigation Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white p-4 text-center">
        <div className="mb-2 flex items-center justify-center">
          <label className="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={showStructure} 
              onChange={() => setShowStructure(!showStructure)} 
              className="mr-2"
            />
            Show Sitemap Structure
          </label>
        </div>
        <div className="flex justify-center space-x-4">
          <Link href="/website" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Return to Generator
          </Link>
          <Link href="/generated-website" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
            Generate Real Website
          </Link>
          <Link href="/" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Start Over
          </Link>
        </div>
      </div>
    </>
  );
};

export default Preview; 