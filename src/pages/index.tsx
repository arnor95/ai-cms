import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea/index';
import { Label } from '@/components/ui/label/index';
import React from 'react';
import { useRouter } from 'next/router';

type RestaurantData = {
  name: string;
  description: string;
  menu: string;
  location: string;
  openingHours: string;
  phone: string;
  email: string;
  socialMedia: string;
}

const testData: RestaurantData = {
  name: 'Miðgarður Veitingahús',
  description: 'Miðgarður er notalegur veitingastaður sem sérhæfir sig í norrænni matargerð með íslensku ívafi. Við leggjum áherslu á ferskt, staðbundið hráefni og bjóðum upp á hlýlegt andrúmsloft fyrir allar tegundir af tilefnum.',
  menu: `Forréttir:
- Grafinn lax með sinnepssósu og rúgbrauði (2.390 kr.)
- Reykt andabringa með berjasósu (2.690 kr.)
- Sveppasúpa með truffluolíu (1.990 kr.)

Aðalréttir:
- Lambahryggur með rótargrænmeti og rauðvínssósu (4.990 kr.)
- Þorskur með smjöri og kartöflum (3.890 kr.)
- Nautalund með bernaise og steiktum kartöflum (5.490 kr.)
- Grænmetisréttur dagsins (3.290 kr.)

Eftirréttir:
- Skyr með berjum og hunangi (1.490 kr.)
- Súkkulaðikaka með vanilluís (1.690 kr.)
- Crème brûlée (1.590 kr.)`,
  location: 'Laugavegur 105, 101 Reykjavík',
  openingHours: 'Mánudagur - Fimmtudagur: 11:30 - 22:00\nFöstudagur - Laugardagur: 11:30 - 23:00\nSunnudagur: 12:00 - 21:00',
  phone: '552-1234',
  email: 'midgardur@example.is',
  socialMedia: 'Facebook: /midgardur\nInstagram: @midgardur_restaurant\nTripadvisor: Miðgarður Veitingahús'
};

export default function HomePage() {
  const [step, setStep] = useState(1);
  const [restaurantData, setRestaurantData] = useState<RestaurantData>({
    name: '',
    description: '',
    menu: '',
    location: '',
    openingHours: '',
    phone: '',
    email: '',
    socialMedia: '',
  });
  
  const [sitemapGenerated, setSitemapGenerated] = useState(false);
  const [brandGuideGenerated, setBrandGuideGenerated] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  
  const updateField = (field: keyof RestaurantData, value: string) => {
    setRestaurantData({
      ...restaurantData,
      [field]: value
    });
  };
  
  const nextStep = () => {
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const generateSitemap = async () => {
    console.log("[DEBUG] Starting generateSitemap function", new Date().toISOString());
    setIsLoading(true);
    setError(null);
    
    // Validate that phone and email are filled
    if (!restaurantData.phone || !restaurantData.email) {
      setError('Vinsamlegast fylltu út símanúmer og netfang');
      setIsLoading(false);
      return;
    }
    
    // Save business name to sessionStorage for later use
    try {
      console.log("[DEBUG] Storing business name in sessionStorage:", restaurantData.name);
      sessionStorage.setItem('businessName', restaurantData.name);
      
      // Also store the complete restaurant data
      console.log("[DEBUG] Storing complete restaurant data in sessionStorage");
      sessionStorage.setItem('restaurantData', JSON.stringify(restaurantData));
    } catch (storageError) {
      console.error("[ERROR] Failed to store data in sessionStorage:", storageError);
    }
    
    console.log("[DEBUG] Restaurant data prepared:", {
      nameLength: restaurantData.name.length,
      descriptionLength: restaurantData.description.length,
      menuLength: restaurantData.menu.length,
      hasPhone: Boolean(restaurantData.phone),
      hasEmail: Boolean(restaurantData.email)
    });

    console.log("[DEBUG] Creating timeout handler");
    // Add a timeout to prevent hanging requests
    let timeoutId: NodeJS.Timeout | null = setTimeout(() => {
      console.error("[ERROR] Request timed out after 60 seconds");
      setIsLoading(false);
      setError("Tímarit á beiðni. Vinsamlegast reyndu aftur eða hafðu samband við þjónustuaðila.");
      timeoutId = null;
    }, 60000);

    try {
      console.log("[DEBUG] Starting API request", new Date().toISOString());
      const startTime = Date.now();
      
      const response = await fetch('/api/generate-sitemap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurantData),
      });
      
      const requestTime = Date.now() - startTime;
      console.log(`[DEBUG] API request completed in ${requestTime}ms`, new Date().toISOString());
      console.log(`[DEBUG] Response status: ${response.status}`);
      
      // Clear timeout as we got a response
      if (timeoutId) {
        console.log("[DEBUG] Clearing timeout as request completed");
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (!response.ok) {
        console.error(`[ERROR] API error: ${response.status} ${response.statusText}`);
        
        try {
          const errorData = await response.json();
          console.error("[ERROR] Error details:", errorData);
          setError(`Villa við að búa til vefkort: ${errorData.message || 'Óvænt villa'}`);
        } catch (parseError) {
          console.error("[ERROR] Error parsing error response:", parseError);
          const text = await response.text();
          console.error("[ERROR] Raw error response:", text);
          setError(`Villa við að búa til vefkort: ${response.statusText}`);
        }
        
        setIsLoading(false);
        return;
      }

      console.log("[DEBUG] Starting to parse JSON response");
      const data = await response.json();
      console.log("[DEBUG] Response JSON parsed successfully");
      
      if (!data.sitemap) {
        console.error("[ERROR] No sitemap in response:", data);
        setError('Engar upplýsingar um vefkort fundust í svari.');
        setIsLoading(false);
        return;
      }
      
      console.log("[DEBUG] Sitemap received:", {
        pageCount: Object.keys(data.sitemap).length,
        pages: Object.keys(data.sitemap)
      });

      // Log the generated sitemap
      console.log(`[DEBUG] Generated sitemap:`, data.sitemap);
      
      // Store the sitemap in session storage
      try {
        console.log("[DEBUG] Storing sitemap in sessionStorage");
        sessionStorage.setItem('sitemap', JSON.stringify(data.sitemap));
        console.log("[DEBUG] Sitemap stored successfully");
      } catch (storageError) {
        console.error("[ERROR] Failed to store sitemap in sessionStorage:", storageError);
      }

      // Update context
      setSitemapGenerated(true);

      // Navigate to the next step
      console.log("[DEBUG] Navigating to next step");
      router.push('/sitemap');
    } catch (error) {
      // Clear timeout if it exists
      if (timeoutId) {
        console.log("[DEBUG] Clearing timeout after error");
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      console.error("[ERROR] Fetch error:", error);
      setError(`Villa við að senda beiðni: ${error instanceof Error ? error.message : String(error)}`);
      setIsLoading(false);
    }
  };
  
  const generateBrandGuide = () => {
    // This would be an API call to generate brand guide based on restaurantData
    setTimeout(() => {
      setBrandGuideGenerated(true);
      nextStep();
    }, 2000);
  };
  
  const fillTestData = () => {
    setRestaurantData(testData);
  };
  
  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Grunnupplýsingar veitingastaðar</CardTitle>
              <CardDescription>Fylltu út grunnupplýsingar um veitingastaðinn þinn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nafn veitingastaðar</Label>
                <Input 
                  id="name" 
                  placeholder="t.d. Kopar Veitingahús" 
                  value={restaurantData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Lýsing</Label>
                <Textarea 
                  id="description" 
                  placeholder="Lýstu veitingastaðnum þínum, t.d. tegund matar, andrúmsloft og sérstaða" 
                  className="min-h-[120px]"
                  value={restaurantData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('description', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Staðsetning</Label>
                <Input 
                  id="location" 
                  placeholder="t.d. Geirsgata 3, 101 Reykjavík" 
                  value={restaurantData.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('location', e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" disabled>Til baka</Button>
              <Button onClick={nextStep} disabled={!restaurantData.name || !restaurantData.description}>Næsta</Button>
            </CardFooter>
          </Card>
        );
        
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Matseðill og opnunartímar</CardTitle>
              <CardDescription>Bættu við upplýsingum um matseðil og opnunartíma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="menu">Matseðill</Label>
                <Textarea 
                  id="menu" 
                  placeholder="Lýstu helstu réttum á matseðlinum, t.d. forréttir, aðalréttir, eftirréttir" 
                  className="min-h-[150px]"
                  value={restaurantData.menu}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('menu', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="openingHours">Opnunartímar</Label>
                <Textarea 
                  id="openingHours" 
                  placeholder="t.d. Mán-Fös: 11:30-22:00, Lau-Sun: 17:00-23:00" 
                  value={restaurantData.openingHours}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('openingHours', e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>Til baka</Button>
              <Button onClick={nextStep} disabled={!restaurantData.menu}>Næsta</Button>
            </CardFooter>
          </Card>
        );
        
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Samskiptaupplýsingar</CardTitle>
              <CardDescription>Bættu við samskiptaupplýsingum fyrir veitingastaðinn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Símanúmer</Label>
                <Input 
                  id="phone" 
                  placeholder="t.d. 555-1234" 
                  value={restaurantData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('phone', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Netfang</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="t.d. info@veitingastadur.is" 
                  value={restaurantData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('email', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="socialMedia">Samfélagsmiðlar</Label>
                <Textarea 
                  id="socialMedia" 
                  placeholder="t.d. Facebook: /veitingastadur, Instagram: @veitingastadur" 
                  value={restaurantData.socialMedia}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField('socialMedia', e.target.value)}
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>Til baka</Button>
              <Button 
                onClick={generateSitemap} 
                disabled={isLoading || !restaurantData.phone || !restaurantData.email}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Bý til vefkort...
                  </>
                ) : (
                  'Búa til vefkort'
                )}
              </Button>
            </CardFooter>
          </Card>
        );
        
      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Vefkort skapað</CardTitle>
              <CardDescription>Byggt á upplýsingum um veitingastaðinn þinn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4 bg-gray-50">
                  <h3 className="font-medium text-lg mb-3">Tillaga að vefkorti fyrir {restaurantData.name}</h3>
                  
                  <ul className="space-y-3">
                    <li className="border-b pb-2">
                      <div className="font-medium">Forsíða</div>
                      <div className="text-sm">Velkomin á {restaurantData.name}, kynning, myndir og sérstöðu</div>
                    </li>
                    <li className="border-b pb-2">
                      <div className="font-medium">Um okkur</div>
                      <div className="text-sm">Saga, hugmyndafræði og starfsfólk</div>
                    </li>
                    <li className="border-b pb-2">
                      <div className="font-medium">Matseðill</div>
                      <div className="text-sm">Forréttir, aðalréttir, eftirréttir og drykkir</div>
                    </li>
                    <li className="border-b pb-2">
                      <div className="font-medium">Borðapantanir</div>
                      <div className="text-sm">Pöntunarform og tengiliðsupplýsingar</div>
                    </li>
                    <li className="border-b pb-2">
                      <div className="font-medium">Staðsetning</div>
                      <div className="text-sm">Kort, opnunartímar og samskiptaupplýsingar</div>
                    </li>
                    <li>
                      <div className="font-medium">Hafðu samband</div>
                      <div className="text-sm">Samskiptaform og tengiliðsupplýsingar</div>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>Breyta vefkorti</Button>
              <Button onClick={generateBrandGuide}>Búa til vörumerkjaleiðbeiningar</Button>
            </CardFooter>
          </Card>
        );
        
      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Vörumerkjaleiðbeiningar</CardTitle>
              <CardDescription>Velja eða láta búa til litapallettu fyrir {restaurantData.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg mb-2">Stílleiðbeiningar</h3>
                  <p className="text-sm mb-4">Þú getur valið úr eftirfarandi litapallettum eða látið gervigreind búa til sérsniðna litapallettu fyrir þig.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="font-medium mb-2">Klassísk</div>
                      <div className="flex space-x-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#8B4513]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#A0522D]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#CD853F]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#F5DEB3]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#FFFAF0]"></div>
                      </div>
                      <div className="text-xs text-gray-500">Hlýir brúntónar og sandalir fyrir klassískt yfirbragð</div>
                    </div>
                    
                    <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="font-medium mb-2">Nútímalegt</div>
                      <div className="flex space-x-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#2E3B4E]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#3F88C5]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#F39237]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#D63230]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#F5F5F5]"></div>
                      </div>
                      <div className="text-xs text-gray-500">Djarfir litir með sterka áherslu fyrir nútímalegt útlit</div>
                    </div>
                    
                    <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="font-medium mb-2">Náttúrulegt</div>
                      <div className="flex space-x-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#4A6C6F]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#846C5B]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#9B8357]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#C3B299]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#F1EDEA]"></div>
                      </div>
                      <div className="text-xs text-gray-500">Náttúrulegir tónar sem vísa í íslenskt umhverfi</div>
                    </div>
                    
                    <div className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="font-medium mb-2">Líflegur</div>
                      <div className="flex space-x-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#1D3557]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#457B9D]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#A8DADC]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#E63946]"></div>
                        <div className="w-8 h-8 rounded-full bg-[#F1FAEE]"></div>
                      </div>
                      <div className="text-xs text-gray-500">Skemmtilegir litir sem skapa líflegt andrúmsloft</div>
                    </div>
                  </div>
                  
                  <Button className="w-full">Sérsníða litapallettu með gervigreind</Button>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-2">Leturgerðir</h3>
                  <div className="space-y-3">
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Playfair Display & Montserrat</span>
                        <span className="text-xs text-gray-500">Klassískt par</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="font-serif text-xl">Playfair Display fyrir fyrirsagnir</div>
                        <div className="font-sans text-sm mt-1">Montserrat fyrir meginmál og aðra texta</div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
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
              <Button variant="outline" onClick={prevStep}>Til baka</Button>
              <Button onClick={nextStep}>Halda áfram</Button>
            </CardFooter>
          </Card>
        );
        
      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Vefkort og vörumerkjaleiðbeiningar tilbúnar!</CardTitle>
              <CardDescription>Þú getur nú haldið áfram með vefsíðugerð</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Þakka þér fyrir að nota AI CMS til að búa til vefkort og vörumerkjaleiðbeiningar fyrir {restaurantData.name}.</p>
                
                <div className="border rounded-md p-4 bg-gray-50">
                  <h3 className="font-medium mb-2">Næstu skref:</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Skoða vefkortið og vörumerkjaleiðbeiningarnar</li>
                    <li>Byrja að búa til vefsíðueiningarnar</li>
                    <li>Setja upp vefsíðuna</li>
                    <li>Tengjast vefhóstinu</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>Til baka</Button>
              <Button>Byrja vefsíðugerð</Button>
            </CardFooter>
          </Card>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Layout>
      <Head>
        <title>Veitingastaður - AI CMS</title>
        <meta name="description" content="Búðu til vefsíðu fyrir veitingastaðinn þinn" />
      </Head>
      
      <div className="py-10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Vefsíða fyrir veitingastað</h1>
              <p className="text-gray-600">Fylltu út upplýsingar um veitingastaðinn og við búum til vefsíðuna fyrir þig.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={fillTestData}
              className="shrink-0"
            >
              Fylla inn prófunargögn
            </Button>
          </div>
          
          <div className="mb-6">
            <div className="grid grid-cols-6 gap-0">
              {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
                <div key={stepNumber} className="flex flex-col items-center">
                  <div className="flex items-center w-full">
                    {stepNumber > 1 && (
                      <div 
                        className={`h-1 w-full ${
                          step >= stepNumber ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      ></div>
                    )}
                    
                    <div 
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 ${
                        step === stepNumber 
                          ? 'border-primary bg-primary text-white' 
                          : step > stepNumber 
                            ? 'border-primary text-primary' 
                            : 'border-gray-300 text-gray-400'
                      }`}
                    >
                      {step > stepNumber ? '✓' : stepNumber}
                    </div>
                    
                    {stepNumber < 6 && (
                      <div 
                        className={`h-1 w-full ${
                          step > stepNumber ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      ></div>
                    )}
                  </div>
                  
                  <span className="mt-2 text-xs text-gray-500 text-center w-full">
                    {stepNumber === 1 && "Grunnupplýsingar"}
                    {stepNumber === 2 && "Matseðill"}
                    {stepNumber === 3 && "Samskipti"}
                    {stepNumber === 4 && "Vefkort"}
                    {stepNumber === 5 && "Stíll"}
                    {stepNumber === 6 && "Lokið"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {renderStep()}
        </div>
      </div>
    </Layout>
  );
} 