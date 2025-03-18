import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';

export default function WebsitePage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [brandGuide, setBrandGuide] = useState<any>(null);
  const [sitemap, setSitemap] = useState<any>(null);

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

      // Redirect if missing required data
      if (!savedSitemap || !savedBrandGuide) {
        console.warn('Missing required data for website generation');
        router.push('/');
      }
    } catch (error) {
      console.error('Error loading data from sessionStorage:', error);
    }
  }, [router]);

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
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-900 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                  </svg>
                </div>
                <p className="text-lg font-medium mb-2">Búa til vefsíðu</p>
                <p className="text-gray-600 mb-4">Smelltu á hnappinn til að hefja vefsíðugerð</p>
                <Button size="lg">Hefja vefsíðugerð</Button>
              </div>
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