import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { config } from 'dotenv';

// Load environment variables
config();

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
    const data = req.body;
    
    // Log the data received for debugging
    console.log(`[DEBUG] Received website generation data:`, JSON.stringify({
      input_data_summary: {
        name: data.input_data.name,
        description_length: data.input_data.description?.length || 0,
      },
      sitemap_summary: {
        page_count: Object.keys(data.sitemap).length,
        pages: Object.keys(data.sitemap),
      },
      style_guide_summary: {
        colors: data.style_guide.palette?.colors,
        font_pair: data.style_guide.fontPair,
      }
    }, null, 2));
    
    // Check if we have all required data
    if (!data.input_data || !data.sitemap || !data.style_guide) {
      console.error(`[ERROR] Missing required data for website generation`);
      return res.status(400).json({ 
        message: 'Missing required data for website generation',
        success: false
      });
    }
    
    // Transform the brandGuide/style_guide data to the format expected by the code_action_agent.py
    const transformedStyleGuide: StyleGuideOutput = transformStyleGuide(data.style_guide);
    console.log(`[DEBUG] Transformed style guide:`, JSON.stringify(transformedStyleGuide, null, 2));
    
    // For the MVP, we'll save the data and redirect to the preview
    // Later we'll implement the actual Python script execution
    
    // Uncomment this section when ready to implement actual code generation
    /*
    // In a real implementation, call the Python script to generate the website
    const scriptPath = path.resolve(process.cwd(), 'agents/code_action_agent.py');
    console.log(`[DEBUG] Looking for script at path: ${scriptPath}`);
    
    if (fs.existsSync(scriptPath)) {
      console.log(`[DEBUG] Script found, preparing to execute`);
      
      // Save input files
      const inputDataPath = path.resolve(process.cwd(), 'input_data.json');
      const sitemapPath = path.resolve(process.cwd(), 'sitemap.json');
      const brandGuidePath = path.resolve(process.cwd(), 'brand_guide.json');
      
      console.log(`[DEBUG] Writing input files`);
      fs.writeFileSync(inputDataPath, JSON.stringify(data.input_data, null, 2));
      fs.writeFileSync(sitemapPath, JSON.stringify(data.sitemap, null, 2));
      fs.writeFileSync(brandGuidePath, JSON.stringify(transformedStyleGuide, null, 2));
      
      // Check if ANTHROPIC_API_KEY is available
      const apiKey = process.env.ANTHROPIC_API_KEY;
      console.log(`[DEBUG] API Key availability: ${!!apiKey}`);
      if (apiKey) {
        console.log(`[DEBUG] API Key length: ${apiKey.length}`);
      }
      
      // Execute the Python script with environment variables
      const env = { ...process.env };
      const command = `python3 "${scriptPath}" "${inputDataPath}" "${sitemapPath}" "${brandGuidePath}"`;
      
      console.log(`[DEBUG] Executing command: ${command}`);
      
      const options = {
        env,
        maxBuffer: 1024 * 1024 * 50, // 50MB buffer for larger outputs
        timeout: 300000 // 5-minute timeout
      };
      
      exec(command, options, (error, stdout, stderr) => {
        if (error) {
          console.error(`[ERROR] Python script execution error: ${error}`);
          console.error(`[ERROR] Script stderr: ${stderr}`);
          return res.status(500).json({ 
            message: 'Error during website generation', 
            error: error.message,
            success: false
          });
        }
        
        if (stderr) {
          console.warn(`[WARN] Script stderr: ${stderr}`);
        }
        
        console.log(`[DEBUG] Python script output length: ${stdout.length} chars`);
        console.log(`[DEBUG] Python script output snippet: ${stdout.substring(0, 200)}...`);
        
        return res.status(200).json({ 
          message: 'Website generated successfully',
          websiteUrl: '/preview',
          success: true
        });
      });
    } else {
      console.error(`[ERROR] Python script not found at ${scriptPath}`);
      return res.status(500).json({ 
        message: 'Website generation script not found',
        success: false
      });
    }
    */
    
    // For the MVP/demo, just redirect to the preview page
    console.log(`[DEBUG] Simulating website generation process...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a success response with the preview URL
    return res.status(200).json({ 
      message: 'Website generation complete! Redirecting to preview...', 
      websiteUrl: '/preview',
      success: true,
      // Include the transformed data so we can store it in sessionStorage from the client
      data: {
        restaurantData: data.input_data,
        sitemap: data.sitemap,
        brandGuide: data.style_guide,
        transformedStyleGuide // Also include the transformed style guide for future use
      }
    });
  } catch (error) {
    console.error(`[ERROR] Website generation failed:`, error);
    return res.status(500).json({ 
      message: 'Error during website generation',
      error: error instanceof Error ? error.message : String(error),
      success: false
    });
  }
}

// Function to transform the brandGuide data structure to the format expected by the Python agent
function transformStyleGuide(styleGuide: BrandGuideInput): StyleGuideOutput {
  if (!styleGuide.palette || !styleGuide.palette.colors || styleGuide.palette.colors.length < 5) {
    console.warn(`[WARN] Brand guide doesn't have enough colors, using defaults`);
    return {
      colors: {
        primary: '#4A6C6F',
        secondary: '#846C5B',
        accent: '#9B8357',
        background: '#F1EDEA',
        text: '#333333'
      },
      typography: {
        headings: styleGuide.fontPair?.includes('Oswald') 
          ? 'Oswald, sans-serif' 
          : 'Playfair Display, serif',
        body: styleGuide.fontPair?.includes('Open Sans') 
          ? 'Open Sans, sans-serif' 
          : 'Montserrat, sans-serif'
      }
    };
  }
  
  return {
    colors: {
      primary: styleGuide.palette.colors[0],
      secondary: styleGuide.palette.colors[1],
      accent: styleGuide.palette.colors[2],
      text: styleGuide.palette.colors[3],
      background: styleGuide.palette.colors[4]
    },
    typography: {
      headings: styleGuide.fontPair?.includes('Oswald') 
        ? 'Oswald, sans-serif' 
        : 'Playfair Display, serif',
      body: styleGuide.fontPair?.includes('Open Sans') 
        ? 'Open Sans, sans-serif' 
        : 'Montserrat, sans-serif'
    }
  };
} 