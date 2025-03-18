import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import { 
  startGeneration, 
  updateGenerationStatus, 
  completeGeneration, 
  addGenerationLog 
} from './generation-status';

// Load environment variables
dotenv.config();

// Type definitions
type BrandGuideInput = {
  palette: {
    name: string;
    colors: string[];
    description: string;
  };
  fontPair: string;
  businessName?: string;
};

type StyleGuideOutput = {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headings: string;
    body: string;
  };
};

// Promisify exec for async/await usage
const execAsync = promisify(exec);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`[DEBUG] Website generation API handler started at ${new Date().toISOString()}`);
  
  if (req.method !== 'POST') {
    console.log(`[ERROR] Method not allowed: ${req.method}`);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log(`[DEBUG] Parsing request data`);
    const {
      input_data,
      sitemap,
      style_guide,
      use_mock = true
    } = req.body;
    
    // Start tracking the generation
    startGeneration();
    addGenerationLog('Received generation request');
    
    // Log the data received for debugging
    console.log(`[DEBUG] Received website generation data:`, JSON.stringify({
      input_data_summary: {
        name: input_data?.name,
        description_length: input_data?.description?.length,
      },
      sitemap_summary: {
        page_count: Object.keys(sitemap || {}).length,
        pages: Object.keys(sitemap || {}),
      },
      style_guide_summary: {
        colors: style_guide?.palette?.colors,
        font_pair: style_guide?.fontPair,
      },
      use_mock
    }, null, 2));
    
    // Check if we have all required data
    if (!input_data || !sitemap || !style_guide) {
      console.error(`[ERROR] Missing required data for website generation`);
      completeGeneration(false, 'Missing required data for website generation');
      return res.status(400).json({ 
        message: 'Missing required data for website generation',
        success: false
      });
    }
    
    // Transform the brandGuide/style_guide data to the format expected by the code_action_agent.py
    const transformedStyleGuide = transformStyleGuide(style_guide);
    console.log(`[DEBUG] Transformed style guide:`, JSON.stringify(transformedStyleGuide, null, 2));
    addGenerationLog('Transformed style guide data');
    
    // Create a temporary directory for the website generation
    const tempDir = path.join(process.cwd(), 'temp');
    const pagesDir = path.join(process.cwd(), 'src', 'pages', 'generated');
    const componentsDir = path.join(process.cwd(), 'components', 'generated');

    // Ensure directories exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    if (!fs.existsSync(pagesDir)) {
      fs.mkdirSync(pagesDir, { recursive: true });
    }
    if (!fs.existsSync(componentsDir)) {
      fs.mkdirSync(componentsDir, { recursive: true });
    }
    
    addGenerationLog('Created required directories');

    // Save input data for the Python script
    const inputDataPath = path.join(tempDir, 'input_data.json');
    const sitemapPath = path.join(tempDir, 'sitemap.json');
    const styleGuidePath = path.join(tempDir, 'style_guide.json');
    const progressPath = path.join(tempDir, 'generation_progress.json');

    fs.writeFileSync(inputDataPath, JSON.stringify(input_data, null, 2));
    fs.writeFileSync(sitemapPath, JSON.stringify(sitemap, null, 2));
    fs.writeFileSync(styleGuidePath, JSON.stringify(transformedStyleGuide, null, 2));
    
    // Create initial progress file for the Python script to update
    fs.writeFileSync(progressPath, JSON.stringify({
      status: 'generating',
      message: 'Preparing to generate website code',
      currentProgress: null,
      logs: ['[' + new Date().toISOString() + '] Initialized progress tracking']
    }, null, 2));
    
    addGenerationLog('Saved input files for generation');

    // Path to the Python script - use environment variable or default location
    const scriptPath = process.env.PYTHON_SCRIPT_PATH 
      ? path.join(process.cwd(), process.env.PYTHON_SCRIPT_PATH)
      : path.join(process.cwd(), 'agents', 'code_action_agent.py');

    console.log(`[DEBUG] Using Python script path: ${scriptPath}`);
    
    // Check if the script exists
    if (!fs.existsSync(scriptPath)) {
      console.error(`[ERROR] Script not found at path: ${scriptPath}`);
      completeGeneration(false, `Code action agent script not found at: ${scriptPath}`);
      return res.status(500).json({
        success: false,
        message: `Code action agent script not found at: ${scriptPath}`
      });
    }
    
    // For development, simulate the process with a delay
    if ((process.env.NODE_ENV === 'development' && process.env.MOCK_GENERATION === 'true' && use_mock) || use_mock) {
      console.log('[DEBUG] Simulating website generation in development mode');
      addGenerationLog('Running in mock mode - will generate placeholder files');
      
      // Create a function to update progress during mock generation
      const updateProgress = (page: string, section: string, status: string) => {
        const progress = { page, section, status };
        updateGenerationStatus('generating', `Working on ${section} for ${page} page`, progress);
        
        // Also update the file for consistency
        const currentProgress = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
        currentProgress.currentProgress = progress;
        currentProgress.message = `Working on ${section} for ${page} page`;
        currentProgress.logs.push(`[${new Date().toISOString()}] ${currentProgress.message}`);
        fs.writeFileSync(progressPath, JSON.stringify(currentProgress, null, 2));
      };
      
      // Create mock generated files with progress updates
      const generatedItems = await createMockGeneratedFiles(sitemap, pagesDir, componentsDir, updateProgress);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      completeGeneration(true, 'Website generation simulated successfully');
      
      return res.status(200).json({
        success: true,
        message: 'Website generation simulated successfully',
        previewUrl: '/generated-website',
        generatedItems
      });
    }

    // Check if the API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[ERROR] Missing ANTHROPIC_API_KEY environment variable');
      completeGeneration(false, 'ANTHROPIC_API_KEY environment variable is not set');
      return res.status(500).json({
        success: false,
        message: 'ANTHROPIC_API_KEY environment variable is not set. Please set it in your .env file.'
      });
    }

    // Execute the actual Python script
    console.log('[DEBUG] Running code_action_agent.py for real website generation');
    addGenerationLog('Starting real code generation with Python agent');
    updateGenerationStatus('generating', 'Launching AI code generation agent', { 
      page: 'Initialization', 
      section: 'Setup', 
      status: 'Starting Python agent'
    });
    
    // Construct the command with all necessary parameters
    const command = `python "${scriptPath}" "${inputDataPath}" "${sitemapPath}" "${styleGuidePath}" "${pagesDir}" "${componentsDir}" "${progressPath}"`;
    
    console.log('[DEBUG] Command:', command);
    
    try {
      // Set ANTHROPIC_API_KEY environment variable from .env
      const env = {
        ...process.env,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
      };
      
      const { stdout, stderr } = await execAsync(
        command,
        { 
          env, 
          maxBuffer: 1024 * 1024 * 50  // 50MB buffer
        }
      );

      console.log(`[DEBUG] Python script output:`, stdout.substring(0, 500) + `...`);
      addGenerationLog('Python agent execution completed');
      
      if (stderr && stderr.length > 0) {
        console.error(`[ERROR] Python script error:`, stderr);
        completeGeneration(false, 'Error executing code action agent');
        return res.status(500).json({
          success: false,
          message: 'Error executing code action agent',
          error: stderr
        });
      }

      // Check if the script generated any files
      if (!fs.existsSync(pagesDir) || !fs.existsSync(componentsDir)) {
        console.error(`[ERROR] Python script did not generate expected directories`);
        completeGeneration(false, 'Code action agent did not generate the expected directories');
        return res.status(500).json({
          success: false,
          message: 'Code action agent did not generate the expected directories'
        });
      }

      const generatedPages = fs.readdirSync(pagesDir);
      const generatedComponents = fs.readdirSync(componentsDir);

      if (generatedPages.length === 0 || generatedComponents.length === 0) {
        console.error(`[ERROR] Python script did not generate any files`);
        completeGeneration(false, 'Code action agent did not generate any files');
        return res.status(500).json({
          success: false,
          message: 'Code action agent did not generate any files',
          generatedItems: {
            pages: generatedPages,
            components: generatedComponents
          }
        });
      }

      console.log(`[DEBUG] Generated pages:`, generatedPages);
      console.log(`[DEBUG] Generated components:`, generatedComponents);
      
      completeGeneration(true, 'Website generated successfully');

      return res.status(200).json({
        success: true,
        message: 'Website generated successfully',
        previewUrl: '/generated-website',
        generatedItems: {
          pages: generatedPages,
          components: generatedComponents
        }
      });
    } catch (error) {
      console.error(`[ERROR] Failed to execute Python script:`, error);
      completeGeneration(false, `Failed to execute code action agent: ${error instanceof Error ? error.message : String(error)}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to execute code action agent',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error) {
    console.error(`[ERROR] Website generation failed:`, error);
    completeGeneration(false, `Error during website generation: ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ 
      message: 'Error during website generation',
      error: error instanceof Error ? error.message : String(error),
      success: false
    });
  }
}

// Function to transform the brandGuide data structure to the format expected by the Python agent
function transformStyleGuide(styleGuide: BrandGuideInput): StyleGuideOutput {
  const { palette, fontPair } = styleGuide;
  const colors = palette.colors;

  // Ensure we have at least 5 colors
  while (colors.length < 5) {
    // Add default colors if needed
    const defaultColors = ['#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF'];
    colors.push(defaultColors[colors.length % defaultColors.length]);
  }
  
  return {
    colors: {
      primary: colors[0],
      secondary: colors[1],
      accent: colors[2],
      text: colors[3],
      background: colors[4]
    },
    typography: {
      headings: fontPair.includes('Oswald') ? 'Oswald, sans-serif' : 'Playfair Display, serif',
      body: fontPair.includes('Open Sans') ? 'Open Sans, sans-serif' : 'Montserrat, sans-serif'
    }
  };
}

// Function to create mock generated files for development
async function createMockGeneratedFiles(
  sitemap: any,
  pagesDir: string,
  componentsDir: string,
  progressCallback?: (page: string, section: string, status: string) => void
): Promise<{pages: string[], components: string[]}> {
  const generatedItems = {
    pages: [] as string[],
    components: [] as string[]
  };
  
  // Ensure directories exist
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
  }
  
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }
  
  // Create a basic React component template
  const componentTemplate = (name: string, props?: string) => `
import React from 'react';

${props ? `interface ${name}Props {
  ${props}
}` : ''}

const ${name} = (${props ? `props: ${name}Props` : ''}) => {
  ${props ? 'const { ' + props.split(';').map(p => p.split(':')[0].trim()).join(', ') + ' } = props;' : ''}
  
  return (
    <div className="py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Generated ${name} Component</h1>
      <p>This is a placeholder for the generated ${name} component.</p>
    </div>
  );
};

export default ${name};
`;

  const pageTemplate = (name: string, sections: string[]) => `
import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

${sections.map(section => `import ${section} from '../../../components/generated/${section}';`).join('\n')}

const ${name}Page: NextPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>${name} | Generated Website</title>
      </Head>
      
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Generated Website</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><Link href="/generated/home">Home</Link></li>
              <li><Link href="/generated/about">About</Link></li>
              <li><Link href="/generated/menu">Menu</Link></li>
              <li><Link href="/generated/contact">Contact</Link></li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main>
        ${sections.map(section => `<${section} />`).join('\n        ')}
      </main>
      
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Generated Website</p>
        </div>
      </footer>
    </div>
  );
};

export default ${name}Page;
`;

  // Generate components for common section types
  const commonComponents = [
    { name: 'Hero', props: 'title: string; description: string' },
    { name: 'About', props: 'title?: string; content?: string' },
    { name: 'Menu', props: 'items?: any[]' },
    { name: 'Contact', props: 'email?: string; phone?: string; address?: string' },
    { name: 'Footer', props: 'socialLinks?: any[]' },
  ];

  // Update progress when creating components
  if (progressCallback) {
    progressCallback('Setup', 'Components', 'Creating common components');
  }
  
  // Create common components
  for (const component of commonComponents) {
    const filePath = path.join(componentsDir, `${component.name}.tsx`);
    fs.writeFileSync(filePath, componentTemplate(component.name, component.props));
    generatedItems.components.push(`${component.name}.tsx`);
  }

  // Generate page components for each page in sitemap
  for (const [pageName, sections] of Object.entries(sitemap)) {
    if (progressCallback) {
      progressCallback(pageName, 'Page Structure', `Planning ${pageName} page layout`);
    }
    
    // Generate components for each section type in this page
    const pageSections = (sections as any[]).map((section, index) => {
      const componentName = section.type.replace(/\s+/g, '');
      const filePath = path.join(componentsDir, `${componentName}.tsx`);
      
      if (progressCallback) {
        progressCallback(pageName, section.type, `Creating component ${index + 1} of ${(sections as any[]).length}`);
      }
      
      // Only create if it doesn't exist and isn't one of the common components
      if (!fs.existsSync(filePath) && !commonComponents.some(c => c.name === componentName)) {
        fs.writeFileSync(filePath, componentTemplate(componentName));
        generatedItems.components.push(`${componentName}.tsx`);
      }
      
      return componentName;
    });
    
    if (progressCallback) {
      progressCallback(pageName, 'Page Assembly', `Creating ${pageName} page file`);
    }
    
    // Create the page file
    const pageFileName = `${pageName.toLowerCase()}.tsx`;
    const pageFilePath = path.join(pagesDir, pageFileName);
    fs.writeFileSync(pageFilePath, pageTemplate(pageName, pageSections));
    generatedItems.pages.push(pageFileName);
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  if (progressCallback) {
    progressCallback('Final Steps', 'Quality Check', 'Validating generated code');
  }
  
  // Simulate final validation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return generatedItems;
} 