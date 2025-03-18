import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';

// Define types for our data
type SitemapSection = {
  type: string;
  description: string;
};

type Sitemap = {
  [key: string]: SitemapSection[];
};

type RestaurantData = {
  name: string;
  description: string;
  menu: string;
  location: string;
  openingHours: string;
  phone: string;
  email: string;
  socialMedia: string;
};

type BrandGuide = {
  palette: {
    name: string;
    colors: string[];
    description: string;
  };
  fontPair: string;
  businessName: string;
};

export default function WebsitePage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [brandGuide, setBrandGuide] = useState<BrandGuide | null>(null);
  const [sitemap, setSitemap] = useState<Sitemap | null>(null);
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from sessionStorage
  useEffect(() => {
    try {
      // Load business name
      const savedBusinessName = sessionStorage.getItem('businessName');
      if (savedBusinessName) {
        setBusinessName(savedBusinessName);
      }

      // Load brand guide
      const savedBrandGuide = sessionStorage.getItem('brandGuide');
      if (savedBrandGuide) {
        setBrandGuide(JSON.parse(savedBrandGuide));
      }

      // Load sitemap
      const savedSitemap = sessionStorage.getItem('sitemap');
      if (savedSitemap) {
        setSitemap(JSON.parse(savedSitemap));
      }

      // Load restaurant data
      const savedRestaurantData = sessionStorage.getItem('restaurantData');
      if (savedRestaurantData) {
        setRestaurantData(JSON.parse(savedRestaurantData));
      } else {
        // If we don't have complete restaurant data, try to reconstruct it from businessName
        if (savedBusinessName) {
          setRestaurantData({
            name: savedBusinessName,
            description: '',
            menu: '',
            location: '',
            openingHours: '',
            phone: '',
            email: '',
            socialMedia: '',
          });
        }
      }

      // Redirect if missing required data
      if (!savedSitemap || !savedBrandGuide) {
        console.warn('[WARN] Missing required data for website generation');
        router.push('/');
      }
    } catch (error) {
      console.error('[ERROR] Error loading data from sessionStorage:', error);
    }
  }, [router]);

  // Prepare data for code_action_agent.py
  const prepareDataForAgent = () => {
    // Convert brand guide to format expected by code_action_agent.py
    const colors = brandGuide?.palette.colors || [];
    const styleGuide = {
      colors: {
        primary: colors[0] || '#000000',
        secondary: colors[1] || '#ffffff',
        accent: colors[2] || '#0000ff',
        background: colors[4] || '#f5f5f5',
        text: colors[3] || '#333333',
      },
      typography: {
        headings: brandGuide?.fontPair.includes('Playfair') ? 'Playfair Display, serif' : 'Oswald, sans-serif',
        body: brandGuide?.fontPair.includes('Montserrat') ? 'Montserrat, sans-serif' : 'Open Sans, sans-serif',
      },
    };

    // Combine restaurant data for input_data
    const inputData = {
      name: businessName || restaurantData?.name || 'Restaurant',
      description: restaurantData?.description || '',
      menu: restaurantData?.menu || '',
      location: restaurantData?.location || '',
      openingHours: restaurantData?.openingHours || '',
      contact: {
        phone: restaurantData?.phone || '',
        email: restaurantData?.email || '',
        socialMedia: restaurantData?.socialMedia || '',
      },
    };

    return {
      input_data: inputData,
      sitemap: sitemap || {},
      style_guide: styleGuide,
    };
  };

  // Generate website using the code_action_agent.py
  const generateWebsite = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const data = prepareDataForAgent();
      console.log('[DEBUG] Preparing data for code_action_agent.py:', data);

      // In a real implementation, we would:
      // 1. Save the JSON files to disk
      // 2. Call the Python agent via API
      // For now, we'll simulate the process

      const response = await fetch('/api/generate-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const result = await response.json();
      console.log('[DEBUG] Website generation result:', result);

      // Simulate successful generation
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationComplete(true);
      }, 3000);
    } catch (error) {
      console.error('[ERROR] Website generation failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setIsGenerating(false);
    }
  };

  // Render website generation status
  const renderGenerationStatus = () => {
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          <p className="font-medium">Villa kom upp við að búa til vefsíðu</p>
          <p className="mt-1 text-sm">{error}</p>
          <Button 
            onClick={() => setError(null)} 
            variant="outline" 
            className="mt-3"
          >
            Reyna aftur
          </Button>
        </div>
      );
    }

    if (generationComplete) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-700">
          <p className="font-medium">Vefsíða búin til!</p>
          <p className="mt-1">Vefsíðan þín er tilbúin til að skoða og breyta.</p>
          <div className="mt-4 flex space-x-3">
            <Button>Skoða vefsíðu</Button>
            <Button variant="outline">Breyta vefsíðu</Button>
          </div>
        </div>
      );
    }

    if (isGenerating) {
      return (
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-900 mb-4">
            <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">Bý til vefsíðu...</p>
          <p className="text-gray-600">Þetta getur tekið smá stund. Gervigreind er að búa til vefsíðu út frá vefkorti og vörumerkjaleiðbeiningum.</p>
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-900 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
          </svg>
        </div>
        <p className="text-lg font-medium mb-2">Búa til vefsíðu</p>
        <p className="text-gray-600 mb-4">Smelltu á hnappinn til að hefja vefsíðugerð</p>
        <Button size="lg" onClick={generateWebsite}>Hefja vefsíðugerð</Button>
      </div>
    );
  };

  // Render data preview
  const renderDataPreview = () => {
    if (!sitemap || !brandGuide) return null;

    return (
      <div className="mt-8 border rounded-md p-4 bg-gray-50">
        <h3 className="font-medium text-lg mb-4">Yfirlit gagna fyrir vefsíðugerð</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium mb-2">Vefkort</h4>
            <div className="bg-white p-3 rounded border text-sm">
              <p className="mb-2">{Object.keys(sitemap).length} síður:</p>
              <ul className="list-disc pl-5">
                {Object.keys(sitemap).map((page) => (
                  <li key={page}>{page} ({sitemap[page].length} hlutar)</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Vörumerkjaleiðbeiningar</h4>
            <div className="bg-white p-3 rounded border text-sm">
              <p className="mb-2">Litapaletta: {brandGuide.palette.name}</p>
              <div className="flex space-x-1 mb-2">
                {brandGuide.palette.colors.map((color, i) => (
                  <div key={i} className="w-6 h-6 rounded-full" style={{ backgroundColor: color }}></div>
                ))}
              </div>
              <p>Leturgerðir: {brandGuide.fontPair}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Upplýsingar um veitingastað</h4>
          <div className="bg-white p-3 rounded border text-sm">
            <p><strong>Nafn:</strong> {businessName || restaurantData?.name}</p>
            {restaurantData?.description && (
              <p className="mt-1"><strong>Lýsing:</strong> {restaurantData.description.substring(0, 100)}...</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <Head>
        <title>Vefsíðugerð - AI CMS</title>
        <meta name="description" content="Búa til vefsíðu út frá vefkorti og vörumerkjaleiðbeiningum" />
      </Head>
      
      <div className="container py-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="h-8 w-8 inline-flex items-center justify-center bg-purple-100 text-purple-900 rounded-full">4</span>
          <h1 className="text-3xl font-bold">Vefsíðugerð</h1>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Vefsíðugerð fyrir {businessName}</CardTitle>
            <CardDescription>Gervigreind mun búa til vefsíðu út frá vefkorti og vörumerkjaleiðbeiningum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Næstu skref:</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Gervigreind mun búa til vefsíðueiningarnar út frá vefkorti</li>
                  <li>Vefsíðan verður stillt samkvæmt vörumerkjaleiðbeiningum</li>
                  <li>Þú getur sérsniðið vefsíðuna að þínum þörfum</li>
                  <li>Tengjast vefhóstinu og birta vefsíðuna</li>
                </ul>
              </div>
              
              {renderGenerationStatus()}
              {renderDataPreview()}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push('/brand')}>Til baka</Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
} 