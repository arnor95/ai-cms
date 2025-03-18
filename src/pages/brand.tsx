import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type SitemapSection = {
  type: string;
  description: string;
};

type Sitemap = {
  [key: string]: SitemapSection[];
};

type ColorPalette = {
  name: string;
  colors: string[];
  description: string;
}

const colorPalettes: ColorPalette[] = [
  {
    name: 'Klassísk',
    colors: ['#8B4513', '#A0522D', '#CD853F', '#F5DEB3', '#FFFAF0'],
    description: 'Hlýir brúntónar og sandalir fyrir klassískt yfirbragð'
  },
  {
    name: 'Nútímalegt',
    colors: ['#2E3B4E', '#3F88C5', '#F39237', '#D63230', '#F5F5F5'],
    description: 'Djarfir litir með sterka áherslu fyrir nútímalegt útlit'
  },
  {
    name: 'Náttúrulegt',
    colors: ['#4A6C6F', '#846C5B', '#9B8357', '#C3B299', '#F1EDEA'],
    description: 'Náttúrulegir tónar sem vísa í íslenskt umhverfi'
  },
  {
    name: 'Líflegur',
    colors: ['#1D3557', '#457B9D', '#A8DADC', '#E63946', '#F1FAEE'],
    description: 'Skemmtilegir litir sem skapa líflegt andrúmsloft'
  }
];

export default function BrandGuidePage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [sitemapData, setSitemapData] = useState<Sitemap | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<number | null>(null);
  const [selectedFontPair, setSelectedFontPair] = useState<number | null>(null);
  
  // Load sitemap data from sessionStorage
  useEffect(() => {
    try {
      const savedSitemap = sessionStorage.getItem('sitemap');
      if (savedSitemap) {
        console.log('[DEBUG] Loading sitemap from sessionStorage');
        const parsedSitemap = JSON.parse(savedSitemap);
        setSitemapData(parsedSitemap);
        console.log('[DEBUG] Sitemap loaded successfully');
      } else {
        console.warn('[WARN] No sitemap found in sessionStorage');
        // Redirect back to the sitemap page if no sitemap is found
        router.push('/');
      }

      // Load business name if available
      const savedBusinessName = sessionStorage.getItem('businessName');
      if (savedBusinessName) {
        setBusinessName(savedBusinessName);
      }
    } catch (error) {
      console.error('[ERROR] Error loading data from sessionStorage:', error);
    }
  }, [router]);

  const handleGenerateCustomPalette = () => {
    // This would call an AI service to generate a custom palette
    // For now, just select a random palette
    setSelectedPalette(Math.floor(Math.random() * colorPalettes.length));
  };

  const handleContinue = () => {
    try {
      // Save the selected brand guide choices to sessionStorage
      const brandGuide = {
        palette: selectedPalette !== null ? colorPalettes[selectedPalette] : colorPalettes[0],
        fontPair: selectedFontPair === 1 ? 'Oswald & Open Sans' : 'Playfair Display & Montserrat',
        businessName
      };
      
      console.log('[DEBUG] Saving brand guide to sessionStorage:', brandGuide);
      sessionStorage.setItem('brandGuide', JSON.stringify(brandGuide));
    } catch (error) {
      console.error('[ERROR] Failed to save brand guide to sessionStorage:', error);
    }
    
    // Navigate to the next step
    router.push('/website');
  };

  return (
    <Layout>
      <Head>
        <title>Vörumerkjaleiðbeiningar - AI CMS</title>
        <meta name="description" content="Búðu til vörumerkjaleiðbeiningar fyrir fyrirtækið þitt með gervigreind" />
      </Head>
      
      <div className="container py-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="h-8 w-8 inline-flex items-center justify-center bg-purple-100 text-purple-900 rounded-full">3</span>
          <h1 className="text-3xl font-bold">Vörumerkjaleiðbeiningar</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Vörumerkjaleiðbeiningar</CardTitle>
            <CardDescription>Velja eða láta búa til litapallettu fyrir {businessName}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-2">Stílleiðbeiningar</h3>
                <p className="text-sm mb-4">Þú getur valið úr eftirfarandi litapallettum eða látið gervigreind búa til sérsniðna litapallettu fyrir þig.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {colorPalettes.map((palette, index) => (
                    <div 
                      key={index} 
                      className={`border rounded-md p-4 hover:bg-gray-50 cursor-pointer ${selectedPalette === index ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedPalette(index)}
                    >
                      <div className="font-medium mb-2">{palette.name}</div>
                      <div className="flex space-x-2 mb-2">
                        {palette.colors.map((color, colorIndex) => (
                          <div key={colorIndex} className="w-8 h-8 rounded-full" style={{ backgroundColor: color }}></div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">{palette.description}</div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={handleGenerateCustomPalette} 
                  className="w-full"
                >
                  Sérsníða litapallettu með gervigreind
                </Button>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-2">Leturgerðir</h3>
                <div className="space-y-3">
                  <div 
                    className={`border rounded-md p-3 cursor-pointer ${selectedFontPair === 0 ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedFontPair(0)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Playfair Display & Montserrat</span>
                      <span className="text-xs text-gray-500">Klassískt par</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="font-serif text-xl">Playfair Display fyrir fyrirsagnir</div>
                      <div className="font-sans text-sm mt-1">Montserrat fyrir meginmál og aðra texta</div>
                    </div>
                  </div>
                  
                  <div 
                    className={`border rounded-md p-3 cursor-pointer ${selectedFontPair === 1 ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedFontPair(1)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Oswald & Open Sans</span>
                      <span className="text-xs text-gray-500">Nútímalegt par</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="font-sans text-xl font-bold tracking-wide uppercase">Oswald fyrir fyrirsagnir</div>
                      <div className="font-sans text-sm mt-1">Open Sans fyrir meginmál og aðra texta</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push('/sitemap')}>Til baka</Button>
            <Button onClick={handleContinue} disabled={selectedPalette === null && selectedFontPair === null}>Halda áfram</Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
} 