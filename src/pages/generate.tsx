import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function GeneratePage() {
  const [componentDescription, setComponentDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleGenerateCode = async () => {
    if (!componentDescription.trim()) return;

    setIsGenerating(true);
    
    try {
      // This would be replaced with the actual API call to generate code
      // const response = await fetch('/api/generate-code', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ description: componentDescription }),
      // });
      
      // const data = await response.json();
      // setGeneratedCode(data.code);

      // Simulating API call
      setTimeout(() => {
        const mockCode = `import React, { useState } from 'react';

interface Vara {
  id: number;
  nafn: string;
  verd: number;
  mynd: string;
  lysing: string;
}

interface VoruSpjaldProps {
  vara: Vara;
  aKarfuSmella: (vara: Vara) => void;
}

const VoruSpjald: React.FC<VoruSpjaldProps> = ({ vara, aKarfuSmella }) => {
  const [erYfir, setErYfir] = useState(false);
  
  return (
    <div 
      className="border rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
      onMouseEnter={() => setErYfir(true)}
      onMouseLeave={() => setErYfir(false)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={vara.mynd} 
          alt={vara.nafn}
          className={\`w-full h-full object-cover transition-transform duration-500 \${erYfir ? 'scale-110' : 'scale-100'}\`}
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg">{vara.nafn}</h3>
        <p className="text-green-600 font-bold mt-1">{vara.verd.toFixed(0)} kr.</p>
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{vara.lysing}</p>
        <button
          onClick={() => aKarfuSmella(vara)}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Setja í körfu
        </button>
      </div>
    </div>
  );
};

export default VoruSpjald;`;
        
        setGeneratedCode(mockCode);
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('Villa við að búa til kóða:', error);
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Kóðaframleiðsla - AI CMS</title>
        <meta name="description" content="Framleiddu React einingar með gervigreind" />
      </Head>
      
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Kóðaframleiðsla</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Framleiddu React einingu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="component-description">
                Lýstu einingunni sem þú vilt
              </label>
              <div className="flex gap-2">
                <Input
                  id="component-description"
                  placeholder="T.d., Vöruspjald með mynd, titli, verði og körfuhnappi"
                  value={componentDescription}
                  onChange={(e) => setComponentDescription(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleGenerateCode} 
                  disabled={isGenerating || !componentDescription.trim()}
                >
                  {isGenerating ? 'Vinn...' : 'Framleiða'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {generatedCode && (
          <Card>
            <CardHeader>
              <CardTitle>Framleiddur kóði</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto">
                <pre className="whitespace-pre-wrap break-words text-sm font-mono">
                  {generatedCode}
                </pre>
              </div>
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                  }}
                >
                  Afrita kóða
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
} 