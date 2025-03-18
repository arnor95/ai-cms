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

// Near the top of the file, before the handler function:
// Define the structure of a complete website project
type WebsiteProject = {
  id: string;
  pages: string[];
  components: string[];
  configs: string[];
  assets: string[];
  timestamp: string;
  projectPath: string;
  deployPath?: string;
}

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
      use_mock = true,
      create_project = true // New parameter to control project creation
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
      use_mock,
      create_project
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
    
    // Define project ID and directories
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').substring(0, 14);
    const projectId = input_data.name 
      ? `${input_data.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${timestamp}`
      : `restaurant-website-${timestamp}`;

    // Define output directories
    const projectsDir = path.join(process.cwd(), 'temp', 'generated_projects');
    const projectDir = path.join(projectsDir, projectId);
    const pagesDir = create_project ? 
      path.join(projectDir, 'src', 'pages') : 
      path.join(process.cwd(), 'src', 'pages', 'generated');
    const componentsDir = create_project ? 
      path.join(projectDir, 'src', 'components') : 
      path.join(process.cwd(), 'components', 'generated');
    const publicDir = create_project ?
      path.join(projectDir, 'public') :
      path.join(process.cwd(), 'public');
    const configsDir = create_project ?
      projectDir :
      tempDir;

    // Ensure directories exist
    [tempDir, projectsDir, projectDir, pagesDir, componentsDir, publicDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    if (create_project) {
      addGenerationLog(`Creating project in directory: ${projectId}`);
    }
    addGenerationLog('Created required directories');

    // Save input data for the Python script
    const inputDataPath = path.join(tempDir, 'input_data.json');
    const sitemapPath = path.join(tempDir, 'sitemap.json');
    const styleGuidePath = path.join(tempDir, 'style_guide.json');
    const progressPath = path.join(tempDir, 'generation_progress.json');
    const projectConfigPath = path.join(tempDir, 'project_config.json');

    fs.writeFileSync(inputDataPath, JSON.stringify(input_data, null, 2));
    fs.writeFileSync(sitemapPath, JSON.stringify(sitemap, null, 2));
    fs.writeFileSync(styleGuidePath, JSON.stringify(transformedStyleGuide, null, 2));
    
    // Save project configuration
    fs.writeFileSync(projectConfigPath, JSON.stringify({
      create_project,
      project_name: projectId,
      project_dir: projectDir,
      pages_dir: pagesDir,
      components_dir: componentsDir,
      public_dir: publicDir,
      configs_dir: configsDir,
      timestamp
    }, null, 2));
    
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
      const generatedItems = await createMockGeneratedFiles(
        sitemap, 
        pagesDir, 
        componentsDir, 
        updateProgress, 
        create_project,
        configsDir,
        publicDir,
        projectId,
        input_data
      );
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const websiteProject: WebsiteProject = {
        id: projectId,
        pages: generatedItems.pages,
        components: generatedItems.components,
        configs: generatedItems.configs || [],
        assets: generatedItems.assets || [],
        timestamp,
        projectPath: projectDir,
        deployPath: create_project ? `/projects/${projectId}` : '/generated-website'
      };
      
      completeGeneration(true, 'Website generation simulated successfully');
      
      return res.status(200).json({
        success: true,
        message: 'Website generation simulated successfully',
        previewUrl: create_project ? `/projects/${projectId}` : '/generated-website',
        generatedItems,
        websiteProject
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
    const command = `python3 "${scriptPath}" "${inputDataPath}" "${sitemapPath}" "${styleGuidePath}" "${pagesDir}" "${componentsDir}" "${progressPath}" "${projectConfigPath}"`;
    
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

      const generatedPages = fs.readdirSync(pagesDir).filter(file => file.endsWith('.tsx') || file.endsWith('.jsx'));
      const generatedComponents = fs.readdirSync(componentsDir).filter(file => file.endsWith('.tsx') || file.endsWith('.jsx'));
      
      // Check for generated configuration files
      let generatedConfigs: string[] = [];
      if (create_project && fs.existsSync(configsDir)) {
        generatedConfigs = fs.readdirSync(configsDir)
          .filter(file => 
            file.endsWith('.js') || 
            file.endsWith('.json') || 
            file.endsWith('.ts') || 
            file === 'README.md' ||
            file === '.gitignore'
          );
      }
      
      // Check for generated assets
      let generatedAssets: string[] = [];
      if (fs.existsSync(publicDir)) {
        generatedAssets = fs.readdirSync(publicDir);
      }

      if (generatedPages.length === 0 && generatedComponents.length === 0) {
        console.error(`[ERROR] Python script did not generate any files`);
        completeGeneration(false, 'Code action agent did not generate any files');
        return res.status(500).json({
          success: false,
          message: 'Code action agent did not generate any files',
          generatedItems: {
            pages: generatedPages,
            components: generatedComponents,
            configs: generatedConfigs,
            assets: generatedAssets
          }
        });
      }

      console.log(`[DEBUG] Generated pages:`, generatedPages);
      console.log(`[DEBUG] Generated components:`, generatedComponents);
      console.log(`[DEBUG] Generated configs:`, generatedConfigs);
      console.log(`[DEBUG] Generated assets:`, generatedAssets);
      
      const websiteProject: WebsiteProject = {
        id: projectId,
        pages: generatedPages,
        components: generatedComponents,
        configs: generatedConfigs,
        assets: generatedAssets,
        timestamp,
        projectPath: projectDir,
        deployPath: create_project ? `/projects/${projectId}` : '/generated-website'
      };
      
      // If creating a full project, add a README.md if it doesn't exist
      if (create_project && !fs.existsSync(path.join(projectDir, 'README.md'))) {
        const readmeContent = `# ${input_data.name || 'Restaurant Website'}

This project was generated with AI CMS on ${new Date().toISOString().slice(0, 10)}.

## Getting Started

First, install the dependencies:

\`\`\`bash
npm install
# or
yarn install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

${Object.keys(sitemap || {}).map(page => `- ${page}`).join('\n')}

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
`;
        fs.writeFileSync(path.join(projectDir, 'README.md'), readmeContent);
        if (!generatedConfigs.includes('README.md')) {
          generatedConfigs.push('README.md');
          websiteProject.configs.push('README.md');
        }
      }
      
      completeGeneration(true, 'Website generated successfully');

      return res.status(200).json({
        success: true,
        message: 'Website generated successfully',
        previewUrl: create_project ? `/projects/${projectId}` : '/generated-website',
        generatedItems: {
          pages: generatedPages,
          components: generatedComponents,
          configs: generatedConfigs,
          assets: generatedAssets
        },
        websiteProject
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
  progressCallback?: (page: string, section: string, status: string) => void,
  createProject = false,
  configsDir?: string,
  publicDir?: string,
  projectId?: string,
  inputData?: any
): Promise<{
  pages: string[],
  components: string[],
  configs?: string[],
  assets?: string[]
}> {
  const generatedItems = {
    pages: [] as string[],
    components: [] as string[],
    configs: [] as string[],
    assets: [] as string[]
  };
  
  // Common components that will be shared across pages
  const commonComponents = [
    { name: 'Layout', props: 'children: React.ReactNode' },
    { name: 'Header', props: 'title: string; menu: { name: string; href: string }[]' },
    { name: 'Footer', props: 'socialLinks?: any[]' },
  ];
 
  // Update progress when creating components
  if (progressCallback) {
    progressCallback('Setup', 'Components', 'Creating common components');
  }
  
  // Create common components
  commonComponents.forEach(component => {
    const filePath = path.join(componentsDir, `${component.name}.tsx`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, componentTemplate(component.name, component.props));
      generatedItems.components.push(`${component.name}.tsx`);
    }
  });
  
  // Generate page components for each page in sitemap
  let indexPageExists = false;
  
  for (const [pageName, sections] of Object.entries(sitemap)) {
    // Check if this is the home/index page
    if (pageName.toLowerCase() === 'home' || pageName.toLowerCase() === 'index') {
      indexPageExists = true;
    }
    
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
    fs.writeFileSync(pageFilePath, pageTemplate(pageName, pageSections, Object.keys(sitemap)));
    generatedItems.pages.push(pageFileName);
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Create an index.tsx page if it doesn't exist yet (required for Next.js projects)
  if (createProject && !indexPageExists) {
    if (progressCallback) {
      progressCallback('Home', 'Page Creation', 'Creating home page');
    }
    
    // Create index.tsx in the pages directory
    const indexPagePath = path.join(pagesDir, 'index.tsx');
    fs.writeFileSync(
      indexPagePath, 
      pageTemplate(
        'Home', 
        ['Hero', 'FeaturedMenu'], 
        Object.keys(sitemap),
        true
      )
    );
    generatedItems.pages.push('index.tsx');
  }
  
  // If we're creating a full project, add configuration files
  if (createProject && configsDir && inputData) {
    if (progressCallback) {
      progressCallback('Configuration', 'Project Setup', 'Creating project configuration files');
    }
    
    // Create package.json
    const packageJson = {
      name: projectId || 'restaurant-website',
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: {
        next: '^13.4.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'tailwindcss': '^3.3.0',
        'autoprefixer': '^10.4.14',
        'postcss': '^8.4.23',
        '@types/node': '^18.16.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        'typescript': '^5.0.4',
        'eslint': '^8.39.0',
        'eslint-config-next': '^13.4.0'
      }
    };
    
    fs.writeFileSync(path.join(configsDir, 'package.json'), JSON.stringify(packageJson, null, 2));
    generatedItems.configs.push('package.json');
    
    // Create tsconfig.json
    const tsconfigJson = {
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*']
        }
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
      exclude: ['node_modules']
    };
    
    fs.writeFileSync(path.join(configsDir, 'tsconfig.json'), JSON.stringify(tsconfigJson, null, 2));
    generatedItems.configs.push('tsconfig.json');
    
    // Create tailwind.config.js
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Use the brand guide colors
        primary: '${inputData.brandGuide?.palette?.colors?.[0] || '#3490dc'}',
        secondary: '${inputData.brandGuide?.palette?.colors?.[1] || '#ffed4a'}',
        accent: '${inputData.brandGuide?.palette?.colors?.[2] || '#f687b3'}',
        background: '${inputData.brandGuide?.palette?.colors?.[4] || '#ffffff'}',
        text: '${inputData.brandGuide?.palette?.colors?.[3] || '#2d3748'}',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};
`;
    
    fs.writeFileSync(path.join(configsDir, 'tailwind.config.js'), tailwindConfig);
    generatedItems.configs.push('tailwind.config.js');
    
    // Create postcss.config.js
    const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
    
    fs.writeFileSync(path.join(configsDir, 'postcss.config.js'), postcssConfig);
    generatedItems.configs.push('postcss.config.js');
    
    // Create a basic README.md
    const readme = `# ${inputData.name || 'Restaurant Website'}

This project was generated with AI CMS.

## Getting Started

First, install the dependencies:

\`\`\`bash
npm install
# or
yarn install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

${Object.keys(sitemap || {}).map(page => `- ${page}`).join('\n')}

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
`;
    
    fs.writeFileSync(path.join(configsDir, 'README.md'), readme);
    generatedItems.configs.push('README.md');
    
    // Create next.config.js
    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
`;
    
    fs.writeFileSync(path.join(configsDir, 'next.config.js'), nextConfig);
    generatedItems.configs.push('next.config.js');
    
    // Create .gitignore
    const gitignore = `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`;
    
    fs.writeFileSync(path.join(configsDir, '.gitignore'), gitignore);
    generatedItems.configs.push('.gitignore');
    
    // Create public directory structure
    if (publicDir) {
      // Mock restaurant image
      if (fs.existsSync(path.join(process.cwd(), 'public', 'restaurant-bg.jpg'))) {
        // Copy from existing public directory if available
        fs.copyFileSync(
          path.join(process.cwd(), 'public', 'restaurant-bg.jpg'),
          path.join(publicDir, 'restaurant-bg.jpg')
        );
      } else {
        // Create a placeholder text file explaining the image
        fs.writeFileSync(
          path.join(publicDir, 'restaurant-bg.txt'),
          'This is a placeholder for a restaurant background image.'
        );
        generatedItems.assets.push('restaurant-bg.txt');
      }
      
      // Create favicon.ico placeholder
      fs.writeFileSync(path.join(publicDir, 'favicon.ico'), '');
      generatedItems.assets.push('favicon.ico');
    }
    
    // Create src directory structure if it doesn't exist
    const srcDir = path.join(configsDir, 'src');
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }
    
    // Create src/styles directory with globals.css
    const stylesDir = path.join(srcDir, 'styles');
    if (!fs.existsSync(stylesDir)) {
      fs.mkdirSync(stylesDir, { recursive: true });
    }
    
    const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}

@layer components {
  .container {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }
}
`;
    
    fs.writeFileSync(path.join(stylesDir, 'globals.css'), globalsCss);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  if (progressCallback) {
    progressCallback('Final Steps', 'Quality Check', 'Validating generated code');
  }
  
  // Simulate final validation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return generatedItems;
}

// Function to create a basic React component template
function componentTemplate(name: string, props?: string) {
  return `
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
}

// Function to create a basic React page template
function pageTemplate(name: string, sections: string[], allPages: string[] = [], isIndex = false) {
  return `
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
              ${allPages.map(page => `<li><Link href="/generated/${page.toLowerCase()}">${page}</Link></li>`).join('\n              ')}
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
}

// Function to generate files based on sitemap and brand guide
async function generateFiles(
  sitemap: any,
  brandGuide: any,
  pagesDir: string,
  componentsDir: string,
  progressCallback?: (page: string, section: string, status: string) => void
): Promise<{
  pages: string[],
  components: string[]
}> {
  const generatedItems = {
    pages: [] as string[],
    components: [] as string[]
  };
  
  // Create components directory if it doesn't exist
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }
  
  // Create pages directory if it doesn't exist
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
  }
  
  // Generate CSS file with color variables based on the brand guide
  const cssFilePath = path.join(componentsDir, 'styles.css');
  const cssContent = `
:root {
  --primary-color: ${brandGuide.colors.primary};
  --secondary-color: ${brandGuide.colors.secondary};
  --accent-color: ${brandGuide.colors.accent};
  --background-color: ${brandGuide.colors.background};
  --text-color: ${brandGuide.colors.text};
  --heading-font: ${brandGuide.typography.headings};
  --body-font: ${brandGuide.typography.body};
}

body {
  font-family: var(--body-font);
  color: var(--text-color);
  background-color: var(--background-color);
  margin: 0;
  padding: 0;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--heading-font);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}
`;
  
  fs.writeFileSync(cssFilePath, cssContent);
  
  // Create common layout components
  const layoutComponents = [
    {
      name: 'Layout',
      content: `
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './styles.css';

interface LayoutProps {
  children: React.ReactNode;
  activeUrl?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeUrl }) => {
  return (
    <div className="site-wrapper">
      <Header activeUrl={activeUrl} />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
      `
    },
    {
      name: 'Header',
      content: `
import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  activeUrl?: string;
}

const Header: React.FC<HeaderProps> = ({ activeUrl }) => {
  const pages = ${JSON.stringify(Object.keys(sitemap))};
  
  return (
    <header style={{ 
      backgroundColor: 'var(--primary-color)', 
      color: 'white', 
      padding: '1rem 0' 
    }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="logo">
            <h1 style={{ margin: 0 }}>Restaurant Name</h1>
          </div>
          <nav>
            <ul style={{ 
              display: 'flex', 
              listStyle: 'none', 
              margin: 0, 
              padding: 0, 
              gap: '1.5rem' 
            }}>
              {pages.map(page => (
                <li key={page}>
                  <Link 
                    href={\`/\${page.toLowerCase() === 'home' ? '' : page.toLowerCase()}\`}
                    style={{ 
                      color: 'white',
                      textDecoration: 'none',
                      fontWeight: activeUrl === page.toLowerCase() ? 'bold' : 'normal',
                      borderBottom: activeUrl === page.toLowerCase() ? '2px solid white' : 'none',
                      padding: '0.25rem 0'
                    }}
                  >
                    {page}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
      `
    },
    {
      name: 'Footer',
      content: `
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{ 
      backgroundColor: 'var(--primary-color)', 
      color: 'white', 
      padding: '2rem 0',
      marginTop: '2rem'
    }}>
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '2rem'
        }}>
          <div>
            <h3>Contact Us</h3>
            <p>123 Main Street</p>
            <p>City, State ZIP</p>
            <p>Phone: (123) 456-7890</p>
            <p>Email: info@restaurant.com</p>
          </div>
          <div>
            <h3>Hours</h3>
            <p>Monday - Friday: 11am - 10pm</p>
            <p>Saturday: 10am - 11pm</p>
            <p>Sunday: 10am - 9pm</p>
          </div>
          <div>
            <h3>Follow Us</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="#" style={{ color: 'white' }}>Facebook</a>
              <a href="#" style={{ color: 'white' }}>Instagram</a>
              <a href="#" style={{ color: 'white' }}>Twitter</a>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p>&copy; {new Date().getFullYear()} Restaurant Name. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
      `
    }
  ];
  
  // Write layout components
  for (const component of layoutComponents) {
    if (progressCallback) {
      progressCallback('Setup', 'Layout', `Creating ${component.name} component`);
    }
    
    const filePath = path.join(componentsDir, `${component.name}.tsx`);
    fs.writeFileSync(filePath, component.content);
    generatedItems.components.push(`${component.name}.tsx`);
  }
  
  // Generate page components from sitemap
  for (const [pageName, sections] of Object.entries(sitemap)) {
    if (progressCallback) {
      progressCallback(pageName, 'Page', `Generating ${pageName} page`);
    }
    
    // Create components for each section in the page
    const pageSections = (sections as any[]);
    
    // Create the page file
    const pageFileName = `${pageName.toLowerCase() === 'home' ? 'index' : pageName.toLowerCase()}.tsx`;
    const pageContent = `
import React from 'react';
import Layout from '../components/Layout';

const ${pageName}Page: React.FC = () => {
  return (
    <Layout activeUrl="${pageName.toLowerCase()}">
      <div className="container" style={{ padding: '2rem 0' }}>
        <h1>${pageName}</h1>
        ${pageSections.map((section, index) => `
        <section key="${index}" style={{ marginBottom: '2rem' }}>
          <h2>${section.type}</h2>
          <p>${section.description || 'Section content will be displayed here.'}</p>
        </section>
        `).join('')}
      </div>
    </Layout>
  );
};

export default ${pageName}Page;
    `;
    
    const pageFilePath = path.join(pagesDir, pageFileName);
    fs.writeFileSync(pageFilePath, pageContent);
    generatedItems.pages.push(pageFileName);
  }
  
  return generatedItems;
}

// Function to get generated files from a directory
function getGeneratedFiles(
  pagesDir: string,
  componentsDir: string
): {
  pages: string[],
  components: string[]
} {
  let pages: string[] = [];
  let components: string[] = [];
  
  if (fs.existsSync(pagesDir)) {
    pages = fs.readdirSync(pagesDir)
      .filter(file => file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'));
  }
  
  if (fs.existsSync(componentsDir)) {
    components = fs.readdirSync(componentsDir)
      .filter(file => file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css'));
  }
  
  return { pages, components };
} 