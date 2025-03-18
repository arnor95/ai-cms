import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

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
  menu?: any;
  location?: string;
  openingHours?: any;
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

type GenerationStatus = {
  status: 'idle' | 'generating' | 'complete' | 'error';
  message: string;
  error?: string;
  generatedItems?: {
    pages: string[];
    components: string[];
  };
  currentProgress?: {
    page: string;
    section: string;
    status: string;
  };
};

const GeneratedWebsite: NextPage = () => {
  const router = useRouter();
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    status: 'idle',
    message: 'Ready to generate website'
  });
  const [activePage, setActivePage] = useState<string>('Home');
  const [generatedPages, setGeneratedPages] = useState<string[]>([]);
  const [activeComponent, setActiveComponent] = useState<React.ComponentType<any> | null>(null);
  const [useMockGeneration, setUseMockGeneration] = useState<boolean>(true);
  const [agentReady, setAgentReady] = useState<boolean>(true);
  const [agentError, setAgentError] = useState<string | null>(null);

  useEffect(() => {
    // Load website data from sessionStorage
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
      } else {
        // If data is missing, redirect to the website setup page
        router.push('/website');
      }
    } catch (error) {
      console.error('Error loading website data:', error);
    }
  }, [router]);

  // Function to check if the agent is properly configured
  useEffect(() => {
    if (useMockGeneration) {
      setAgentReady(true);
      setAgentError(null);
      return;
    }

    const checkAgentConfig = async () => {
      try {
        const response = await fetch('/api/check-agent-status');
        const data = await response.json();
        
        setAgentReady(data.ready);
        setAgentError(data.ready ? null : data.message);
      } catch (error) {
        console.error('Error checking agent status:', error);
        setAgentReady(false);
        setAgentError('Failed to check agent status. The agent service might not be available.');
      }
    };

    checkAgentConfig();
  }, [useMockGeneration]);

  // Function to generate the website
  const generateWebsite = async () => {
    if (!websiteData) return;

    setGenerationStatus({
      status: 'generating',
      message: 'Starting website generation...'
    });

    try {
      // Prepare the request data
      const requestData = {
        input_data: websiteData.restaurantData,
        sitemap: websiteData.sitemap,
        style_guide: websiteData.brandGuide,
        use_mock: useMockGeneration 
      };

      // Set up polling for generation status updates if using real agent
      let statusInterval: NodeJS.Timeout | null = null;
      
      if (!useMockGeneration) {
        statusInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch('/api/generation-status');
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              if (statusData.status === 'complete' || statusData.status === 'error') {
                if (statusInterval) clearInterval(statusInterval);
              }
              
              setGenerationStatus(prev => ({
                ...prev,
                currentProgress: statusData.currentProgress
              }));
            }
          } catch (error) {
            console.error('Error polling generation status:', error);
          }
        }, 2000);
      } else {
        // Simulation of progress updates (this would be handled by SSE or WebSockets in a real implementation)
        const progressInterval = setInterval(() => {
          setGenerationStatus(prev => {
            if (prev.status !== 'generating') {
              clearInterval(progressInterval);
              return prev;
            }

            // Simulate progress updates
            const pages = Object.keys(websiteData.sitemap);
            const randomPage = pages[Math.floor(Math.random() * pages.length)];
            const sections = websiteData.sitemap[randomPage];
            const randomSection = sections[Math.floor(Math.random() * sections.length)];

            return {
              ...prev,
              currentProgress: {
                page: randomPage,
                section: randomSection.type,
                status: 'Generating code...'
              }
            };
          });
        }, 2000);
      }

      // Make the API request
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      // Clear intervals when the response is received
      if (statusInterval) clearInterval(statusInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Website generation failed');
      }

      const data = await response.json();

      // Update state with generated items
      setGenerationStatus({
        status: 'complete',
        message: 'Website generation complete!',
        generatedItems: data.generatedItems
      });

      // Store generated pages
      if (data.generatedItems?.pages) {
        setGeneratedPages(data.generatedItems.pages);
      }

      // Load the first page
      loadGeneratedPage('Home');
    } catch (error) {
      console.error('Error generating website:', error);
      setGenerationStatus({
        status: 'error',
        message: 'Website generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Function to load a generated page component
  const loadGeneratedPage = (pageName: string) => {
    setActivePage(pageName);
    
    // In a real implementation, we would dynamically import the generated pages
    // For this mock, we'll simulate by dynamically loading our pre-made components
    try {
      // Create a dynamic component based on the page name (for simulation only)
      if (process.env.NEXT_PUBLIC_MOCK_GENERATION === 'true') {
        // Simulate loading a dynamic component
        import(`../../components/generated/${pageName === 'Home' ? 'Hero' : pageName}`).then(
          (module) => {
            setActiveComponent(() => module.default);
          }
        ).catch(error => {
          console.error(`Failed to load component for ${pageName}:`, error);
          setActiveComponent(null);
        });
      } else {
        // In real implementation, load the actual generated page
        const Component = dynamic(() => import(`./generated/${pageName.toLowerCase()}`), {
          loading: () => <div>Loading {pageName} page...</div>,
          ssr: false
        });
        setActiveComponent(() => Component);
      }
    } catch (error) {
      console.error(`Error loading page ${pageName}:`, error);
      setActiveComponent(null);
    }
  };

  if (!websiteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Loading website data...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Generate Website - {websiteData.restaurantData.name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Open+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 py-4 px-6">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Website Generator</h1>
            <div className="space-x-4">
              <Link href="/website" className="text-blue-600 hover:text-blue-800">
                Back to Setup
              </Link>
              <Link href="/preview" className="text-green-600 hover:text-green-800">
                View Preview
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Website Generation</h2>
            
            <div className="mb-6">
              <p className="mb-2">
                <span className="font-medium">Restaurant:</span> {websiteData.restaurantData.name}
              </p>
              <p className="mb-2">
                <span className="font-medium">Pages:</span> {Object.keys(websiteData.sitemap).join(', ')}
              </p>
              <p className="mb-2">
                <span className="font-medium">Color Palette:</span> {websiteData.brandGuide.palette.name}
              </p>
              <p className="mb-2">
                <span className="font-medium">Typography:</span> {websiteData.brandGuide.fontPair}
              </p>
            </div>
            
            <div className="p-4 mb-6 rounded-lg border-2 border-blue-100 bg-blue-50">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Generation Mode</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useMockGeneration ? 'bg-gray-300' : 'bg-green-500'}`}>
                    <input 
                      type="checkbox" 
                      id="useMockGeneration" 
                      checked={!useMockGeneration} 
                      onChange={() => setUseMockGeneration(!useMockGeneration)}
                      className="peer sr-only" 
                    />
                    <span 
                      className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${!useMockGeneration ? 'translate-x-5' : 'translate-x-1'}`}
                    ></span>
                  </div>
                  <label htmlFor="useMockGeneration" className="ml-3 text-sm font-medium">
                    {useMockGeneration ? 'Mock Generation (Fast)' : 'Real AI Generation'}
                  </label>
                </div>
                <div className="text-sm">
                  {useMockGeneration ? 
                    <span className="text-gray-600">Creates placeholder files without AI</span> :
                    <span className="text-green-700 font-medium">Uses AI to generate full website code</span>
                  }
                </div>
              </div>
              <p className="mt-2 text-xs text-blue-600 italic">
                {useMockGeneration 
                  ? "Mock mode is useful for testing and development, but won't create a real website." 
                  : "Real mode uses the AI agent to generate actual code. Requires ANTHROPIC_API_KEY and may take longer."}
              </p>
            </div>

            {!useMockGeneration && !agentReady && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-yellow-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-yellow-800">Agent Setup Required</h4>
                    <p className="mt-1 text-sm text-yellow-700">
                      {agentError || 'The AI agent is not properly configured. Please check the following:'}
                    </p>
                    <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside ml-2">
                      <li>Make sure the ANTHROPIC_API_KEY is set in your .env file</li>
                      <li>Verify that code_action_agent.py exists in the agents directory</li>
                      <li>Set PYTHON_SCRIPT_PATH in .env if your agent is in a custom location</li>
                    </ul>
                    <button
                      onClick={() => setUseMockGeneration(true)}
                      className="mt-3 px-3 py-1 bg-yellow-200 text-yellow-800 text-sm rounded hover:bg-yellow-300 transition"
                    >
                      Switch to Mock Mode
                    </button>
                  </div>
                </div>
              </div>
            )}

            {generationStatus.status === 'idle' && (
              <button
                onClick={generateWebsite}
                className={`px-4 py-2 text-white rounded transition ${
                  (!useMockGeneration && !agentReady) ? 
                    'bg-gray-400 cursor-not-allowed' : 
                    'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={!useMockGeneration && !agentReady}
              >
                Generate Website
              </button>
            )}

            {generationStatus.status === 'generating' && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center mb-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  <span className="font-medium text-blue-800">{generationStatus.message}</span>
                </div>
                
                {generationStatus.currentProgress && (
                  <div className="ml-8 text-sm text-blue-600">
                    <p>Currently working on: <strong>{generationStatus.currentProgress.page}</strong> - {generationStatus.currentProgress.section}</p>
                    <p className="mt-1">{generationStatus.currentProgress.status}</p>
                  </div>
                )}
              </div>
            )}

            {generationStatus.status === 'complete' && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex items-center mb-2">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-green-800">{generationStatus.message}</span>
                </div>
                
                {generationStatus.generatedItems && (
                  <div className="mt-4">
                    <p className="font-medium text-green-700">Generated Files:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <h3 className="font-medium mb-2">Pages:</h3>
                        <ul className="list-disc list-inside text-sm">
                          {generationStatus.generatedItems.pages.map((page, index) => (
                            <li key={index} className="text-gray-700">{page}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Components:</h3>
                        <ul className="list-disc list-inside text-sm">
                          {generationStatus.generatedItems.components.map((component, index) => (
                            <li key={index} className="text-gray-700">{component}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {generationStatus.status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center mb-2">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-red-800">{generationStatus.message}</span>
                </div>
                {generationStatus.error && (
                  <div className="mt-2 text-sm text-red-600 ml-7 border border-red-200 rounded p-2 bg-red-50">
                    <p className="font-medium mb-1">Error details:</p>
                    <p className="font-mono text-xs overflow-auto whitespace-pre-wrap">{generationStatus.error}</p>
                  </div>
                )}
                <div className="mt-4 space-x-3 flex">
                  <button
                    onClick={generateWebsite}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Try Again
                  </button>
                  {!useMockGeneration && (
                    <button
                      onClick={() => {
                        setUseMockGeneration(true);
                        setGenerationStatus({
                          status: 'idle',
                          message: 'Ready to generate website'
                        });
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                    >
                      Switch to Mock Mode
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {generationStatus.status === 'complete' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <div className="flex items-center space-x-4">
                  {Object.keys(websiteData.sitemap).map((page) => (
                    <button
                      key={page}
                      className={`px-3 py-1 rounded ${
                        activePage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => loadGeneratedPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-0 min-h-[600px] bg-gray-100">
                {activeComponent ? (
                  React.createElement(activeComponent, {
                    data: websiteData.restaurantData,
                    colors: {
                      primary: websiteData.brandGuide.palette.colors[0],
                      secondary: websiteData.brandGuide.palette.colors[1],
                      accent: websiteData.brandGuide.palette.colors[2],
                      text: websiteData.brandGuide.palette.colors[3],
                      background: websiteData.brandGuide.palette.colors[4]
                    },
                    typography: {
                      headings: websiteData.brandGuide.fontPair.includes('Oswald')
                        ? 'Oswald, sans-serif'
                        : 'Playfair Display, serif',
                      body: websiteData.brandGuide.fontPair.includes('Open Sans')
                        ? 'Open Sans, sans-serif'
                        : 'Montserrat, sans-serif'
                    }
                  })
                ) : (
                  <div className="flex items-center justify-center h-[600px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p>Loading {activePage} component...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} AI CMS - Website Generator</p>
        </footer>
      </div>
    </>
  );
};

export default GeneratedWebsite; 