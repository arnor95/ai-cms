import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Home, Info, Menu as MenuIcon, MapPin, Mail } from 'lucide-react';

type SitemapSection = {
  type: string;
  description: string;
};

type Sitemap = {
  [key: string]: SitemapSection[];
};

interface SitemapDisplayProps {
  sitemap: Sitemap;
  businessName: string;
  onEdit?: () => void;
  onContinue?: () => void;
}

// Helper function to get an icon for a specific page
const getPageIcon = (pageName: string) => {
  const name = pageName.toLowerCase();
  if (name.includes('home') || name.includes('forsíða')) return <Home className="h-4 w-4" />;
  if (name.includes('about') || name.includes('um')) return <Info className="h-4 w-4" />;
  if (name.includes('menu') || name.includes('matseðill')) return <MenuIcon className="h-4 w-4" />;
  if (name.includes('location') || name.includes('staðsetning')) return <MapPin className="h-4 w-4" />;
  if (name.includes('contact') || name.includes('hafðu samband')) return <Mail className="h-4 w-4" />;
  return <div className="h-4 w-4" />; // Empty placeholder with same dimensions
};

export default function SitemapDisplay({ sitemap, businessName, onEdit, onContinue }: SitemapDisplayProps) {
  if (!sitemap || Object.keys(sitemap).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vefkort ekki tiltækt</CardTitle>
          <CardDescription>Engin vefkortsgögn fundust</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Vinsamlegast búðu til vefkort fyrst.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 inline-flex items-center justify-center bg-purple-100 text-purple-900 rounded-full">2</span>
          <CardTitle>Sitemap</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-gray-50 rounded-xl p-6">
          {/* Root node (Home) with vertical line connecting to other pages */}
          <div className="relative">
            <div className="pb-4 flex justify-center mb-2">
              <div className="relative">
                <div className="inline-flex items-center bg-white border rounded-md py-2 px-4 shadow-sm">
                  <div className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full mr-2">
                    <Home className="h-4 w-4" />
                  </div>
                  <span>Home</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute h-6 w-px bg-gray-300 left-1/2 bottom-0 transform translate-y-full"></div>
              </div>
            </div>
            
            {/* Container for all pages */}
            <div className="flex flex-wrap justify-center gap-4 relative">
              {/* Draw a horizontal line connecting the pages */}
              <div className="absolute top-0 left-0 w-full h-px bg-gray-300"></div>
              
              {Object.entries(sitemap).map(([pageName, sections], pageIndex) => {
                // Skip Home since it's already at the top
                if (pageName.toLowerCase() === 'home') return null;
                
                return (
                  <div key={pageIndex} className="min-w-[200px] max-w-[250px]">
                    <div className="relative">
                      <div className="absolute h-6 w-px bg-gray-300 left-1/2 top-0 transform -translate-y-full"></div>
                      <div className="bg-white border rounded-md p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
                              {getPageIcon(pageName)}
                            </div>
                            <span className="font-medium">{pageName}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {sections.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="bg-gray-50 p-2 rounded text-sm">
                              <p className="font-medium text-xs text-gray-600">{section.type}</p>
                              <p className="text-xs text-gray-500">{section.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Home page details (only the sections) */}
            {sitemap['Home'] && (
              <div className="mt-10 bg-white border rounded-md p-4 shadow-sm max-w-[500px] mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
                      <Home className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Home Details</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {sitemap['Home'].map((section, sectionIndex) => (
                    <div key={sectionIndex} className="bg-gray-50 p-2 rounded text-sm">
                      <p className="font-medium text-xs text-gray-600">{section.type}</p>
                      <p className="text-xs text-gray-500">{section.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between mt-4">
        <Button variant="outline" onClick={onEdit}>Breyta vefkorti</Button>
        <Button onClick={onContinue}>Halda áfram</Button>
      </CardFooter>
    </Card>
  );
} 