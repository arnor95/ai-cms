import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea/index';
import { Label } from '@/components/ui/label/index';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import SitemapDisplay from '@/components/sitemap/SitemapDisplay';

// Define types for our component layouts
type LayoutOption = {
  id: string;
  name: string;
  description: string;
  image?: string;
}

type SectionType = {
  id: string;
  name: string;
  description: string;
  layout: string;
  content?: string;
}

type PageType = {
  id: string;
  name: string;
  sections: SectionType[];
}

type SitemapSection = {
  type: string;
  description: string;
};

type Sitemap = {
  [key: string]: SitemapSection[];
};

// Predefined layout options
const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'navbar',
    name: 'Navigation Bar',
    description: 'A horizontal navigation menu for the website',
  },
  {
    id: 'hero-image-right',
    name: 'Hero with Image on Right',
    description: 'Hero section with text on the left and image on the right',
  },
  {
    id: 'hero-image-left',
    name: 'Hero with Image on Left',
    description: 'Hero section with text on the right and image on the left',
  },
  {
    id: 'hero-image-background',
    name: 'Hero with Background Image',
    description: 'Hero section with full-width background image and centered text',
  },
  {
    id: 'text-2-col',
    name: 'Text in 2 Columns',
    description: 'Content split into two equal columns',
  },
  {
    id: 'image-text-left',
    name: 'Image with Text (Image Left)',
    description: 'Image on the left with text content on the right',
  },
  {
    id: 'image-text-right',
    name: 'Image with Text (Image Right)',
    description: 'Image on the right with text content on the left',
  },
  {
    id: 'features-3-col',
    name: 'Features in 3 Columns',
    description: 'Three-column layout for displaying features with icons',
  },
  {
    id: 'gallery-4-col',
    name: 'Image Gallery (4 Columns)',
    description: 'Grid of images in 4 columns',
  },
  {
    id: 'testimonials-slider',
    name: 'Testimonials Slider',
    description: 'Carousel of customer testimonials',
  },
  {
    id: 'cta-centered',
    name: 'Call to Action (Centered)',
    description: 'Centered call-to-action with heading, text, and button',
  },
  {
    id: 'contact-form-map',
    name: 'Contact Form with Map',
    description: 'Contact form with a map showing location',
  },
  {
    id: 'footer-3-col',
    name: 'Footer (3 Columns)',
    description: 'Footer with 3 columns of content and copyright',
  }
];

// Initial sitemap structure (will be replaced by AI-generated sitemap)
const initialSitemap: Sitemap = {
  "Home": [
    { type: "hero", description: "Welcome to Restaurant" },
    { type: "features", description: "Highlight key features or services" }
  ],
  "About": [
    { type: "content", description: "About the company" }
  ],
  "Contact": [
    { type: "contact_form", description: "Contact form and information" }
  ]
};

export default function SitemapPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('Veitingastaður');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [newPageName, setNewPageName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionDesc, setNewSectionDesc] = useState('');
  const [newSectionLayout, setNewSectionLayout] = useState(LAYOUT_OPTIONS[0].id);

  // Initialize the sitemap from sessionStorage or use a default one
  const [sitemapData, setSitemapData] = useState<Sitemap>(initialSitemap);

  useEffect(() => {
    // Load the sitemap from sessionStorage when the component mounts
    try {
      const savedSitemap = sessionStorage.getItem('sitemap');
      console.log('[DEBUG] Loading sitemap from sessionStorage');
      
      if (savedSitemap) {
        const parsedSitemap = JSON.parse(savedSitemap);
        console.log('[DEBUG] Loaded sitemap from sessionStorage:', parsedSitemap);
        console.log('[DEBUG] Sitemap pages:', Object.keys(parsedSitemap));
        setSitemapData(parsedSitemap);
      } else {
        console.log('[DEBUG] No sitemap found in sessionStorage, using default');
      }
    } catch (error) {
      console.error('[ERROR] Error loading sitemap from sessionStorage:', error);
    }
  }, []);
  
  const handleEditSitemap = () => {
    setIsEditing(true);
    if (Object.keys(sitemapData).length > 0) {
      setSelectedPage(Object.keys(sitemapData)[0]);
    }
  };
  
  const handleSaveSitemap = () => {
    setIsEditing(false);
    // Save the sitemap to sessionStorage
    try {
      console.log('[DEBUG] Saving sitemap to sessionStorage:', sitemapData);
      sessionStorage.setItem('sitemap', JSON.stringify(sitemapData));
      console.log('[DEBUG] Sitemap saved successfully');
    } catch (error) {
      console.error('[ERROR] Failed to save sitemap to sessionStorage:', error);
    }
  };
  
  const handleAddPage = () => {
    if (!newPageName.trim()) return;
    
    setSitemapData(prev => ({
      ...prev,
      [newPageName]: []
    }));
    
    setSelectedPage(newPageName);
    setNewPageName('');
  };
  
  const handleDeletePage = (pageName: string) => {
    if (!confirm(`Are you sure you want to delete the "${pageName}" page?`)) return;
    
    setSitemapData(prev => {
      const newSitemap = {...prev};
      delete newSitemap[pageName];
      return newSitemap;
    });
    
    if (selectedPage === pageName) {
      const remainingPages = Object.keys(sitemapData).filter(p => p !== pageName);
      setSelectedPage(remainingPages.length > 0 ? remainingPages[0] : null);
    }
  };
  
  const handleAddSection = () => {
    if (!selectedPage || !newSectionName.trim() || !newSectionDesc.trim()) return;
    
    setSitemapData(prev => {
      const newSitemap = {...prev};
      newSitemap[selectedPage] = [
        ...newSitemap[selectedPage],
        { type: newSectionName, description: newSectionDesc }
      ];
      return newSitemap;
    });
    
    setNewSectionName('');
    setNewSectionDesc('');
  };
  
  const handleUpdateSection = () => {
    if (!selectedPage || selectedSection === null || !newSectionName.trim() || !newSectionDesc.trim()) return;
    
    setSitemapData(prev => {
      const newSitemap = {...prev};
      newSitemap[selectedPage][selectedSection] = {
        type: newSectionName,
        description: newSectionDesc
      };
      return newSitemap;
    });
    
    setSelectedSection(null);
    setNewSectionName('');
    setNewSectionDesc('');
    setIsEditing(false);
  };
  
  const handleEditSection = (sectionIndex: number) => {
    if (!selectedPage) return;
    
    const section = sitemapData[selectedPage][sectionIndex];
    setSelectedSection(sectionIndex);
    setNewSectionName(section.type);
    setNewSectionDesc(section.description);
    setIsEditing(true);
  };
  
  const handleDeleteSection = (sectionIndex: number) => {
    if (!selectedPage) return;
    
    setSitemapData(prev => {
      const newSitemap = {...prev};
      newSitemap[selectedPage] = newSitemap[selectedPage].filter((_, idx) => idx !== sectionIndex);
      return newSitemap;
    });
  };
  
  const handleMoveSectionUp = (sectionIndex: number) => {
    if (!selectedPage || sectionIndex === 0) return;
    
    setSitemapData(prev => {
      const newSitemap = {...prev};
      const sections = [...newSitemap[selectedPage]];
      const temp = sections[sectionIndex];
      sections[sectionIndex] = sections[sectionIndex - 1];
      sections[sectionIndex - 1] = temp;
      newSitemap[selectedPage] = sections;
      return newSitemap;
    });
  };
  
  const handleMoveSectionDown = (sectionIndex: number) => {
    if (!selectedPage || sectionIndex >= sitemapData[selectedPage].length - 1) return;
    
    setSitemapData(prev => {
      const newSitemap = {...prev};
      const sections = [...newSitemap[selectedPage]];
      const temp = sections[sectionIndex];
      sections[sectionIndex] = sections[sectionIndex + 1];
      sections[sectionIndex + 1] = temp;
      newSitemap[selectedPage] = sections;
      return newSitemap;
    });
  };
  
  const handleContinue = () => {
    // Save the current sitemap before navigating
    try {
      console.log('[DEBUG] Saving sitemap before continuing:', sitemapData);
      sessionStorage.setItem('sitemap', JSON.stringify(sitemapData));
      console.log('[DEBUG] Sitemap saved successfully');
    } catch (error) {
      console.error('[ERROR] Failed to save sitemap to sessionStorage:', error);
    }
    
    // Navigate to the brand guide page
    router.push('/brand');
  };
  
  return (
    <Layout>
      <Head>
        <title>Vefkort - AI CMS</title>
        <meta name="description" content="Vefkort fyrir veitingastaðinn þinn" />
      </Head>
      
      <div className="py-10">
        <div className="max-w-5xl mx-auto px-4">
          {isEditing ? (
            // Editing interface
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Síður</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <ul className="space-y-1">
                        {Object.keys(sitemapData).map((pageName) => (
                          <li key={pageName}>
                            <Button
                              variant={selectedPage === pageName ? "default" : "ghost"}
                              className="w-full justify-between"
                              onClick={() => setSelectedPage(pageName)}
                            >
                              {pageName}
                              <button
                                className="opacity-50 hover:opacity-100"
                                onClick={(e) => { e.stopPropagation(); handleDeletePage(pageName); }}
                              >
                                ×
                              </button>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ný síða"
                          value={newPageName}
                          onChange={(e) => setNewPageName(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={handleAddPage} disabled={!newPageName.trim()}>Bæta við</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Button onClick={handleSaveSitemap} className="w-full">
                  Vista breytingar
                </Button>
              </div>
              
              <div className="md:col-span-2">
                {selectedPage && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Hlutar fyrir {selectedPage}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedPage && sitemapData[selectedPage]?.map((section, idx) => (
                        <div key={idx} className="border rounded-md p-3 flex justify-between items-start">
                          <div>
                            <div className="font-medium">{section.type}</div>
                            <div className="text-sm text-gray-600">{section.description}</div>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditSection(idx)}>
                              Breyta
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSection(idx)}>
                              Eyða
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleMoveSectionUp(idx)}
                              disabled={idx === 0}
                            >
                              ↑
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleMoveSectionDown(idx)}
                              disabled={idx === sitemapData[selectedPage].length - 1}
                            >
                              ↓
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-4 border-t">
                        {selectedSection !== null ? (
                          <div className="space-y-3">
                            <h3 className="font-medium">Breyta hluta</h3>
                            <div>
                              <Label htmlFor="sectionName">Heiti hluta</Label>
                              <Input
                                id="sectionName"
                                placeholder="t.d. Hero Section"
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value)}
                                className="w-full mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="sectionDesc">Lýsing</Label>
                              <Textarea
                                id="sectionDesc"
                                placeholder="Lýsing á hlutanum"
                                value={newSectionDesc}
                                onChange={(e) => setNewSectionDesc(e.target.value)}
                                className="w-full mt-1"
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => {
                                setSelectedSection(null);
                                setNewSectionName('');
                                setNewSectionDesc('');
                              }}>
                                Hætta við
                              </Button>
                              <Button onClick={handleUpdateSection}>
                                Vista breytingar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <h3 className="font-medium">Bæta við hluta</h3>
                            <div>
                              <Label htmlFor="newSectionName">Heiti hluta</Label>
                              <Input
                                id="newSectionName"
                                placeholder="t.d. Hero Section"
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value)}
                                className="w-full mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="newSectionDesc">Lýsing</Label>
                              <Textarea
                                id="newSectionDesc"
                                placeholder="Lýsing á hlutanum"
                                value={newSectionDesc}
                                onChange={(e) => setNewSectionDesc(e.target.value)}
                                className="w-full mt-1"
                              />
                            </div>
                            <Button 
                              onClick={handleAddSection}
                              disabled={!newSectionName.trim() || !newSectionDesc.trim()}
                              className="w-full"
                            >
                              Bæta við hluta
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            // Display the sitemap in view mode
            <SitemapDisplay 
              sitemap={sitemapData} 
              businessName={businessName} 
              onEdit={handleEditSitemap} 
              onContinue={handleContinue}
            />
          )}
        </div>
      </div>
    </Layout>
  );
} 