import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import { runPythonScript, readScriptOutput } from '@/middleware/pythonRunner';
import { config } from 'dotenv';

// Load environment variables
config();

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

// Default sitemap to use if Python script fails
const createDefaultSitemap = (name: string) => {
  console.log(`[DEBUG] Creating default sitemap for ${name}`);
  return {
    'Forsíða': [
      { type: 'hero', description: `Fullskjá hero hluti með kynningu á ${name}` },
      { type: 'features', description: 'Helstu kostir veitingastaðsins' }
    ],
    'Um okkur': [
      { type: 'about', description: 'Upplýsingar um veitingastaðinn og sögu hans' },
      { type: 'team', description: 'Kynning á starfsfólki' }
    ],
    'Matseðill': [
      { type: 'menu', description: 'Matseðill veitingastaðsins' }
    ],
    'Hafðu samband': [
      { type: 'contact', description: 'Samskiptaform og upplýsingar' },
      { type: 'map', description: 'Kort sem sýnir staðsetningu' }
    ]
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`[DEBUG] API handler started at ${new Date().toISOString()}`);
  console.log(`[DEBUG] Request method: ${req.method}`);
  console.log(`[DEBUG] Request headers:`, JSON.stringify(req.headers, null, 2));
  
  if (req.method !== 'POST') {
    console.log(`[ERROR] Method not allowed: ${req.method}`);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const startTime = Date.now();
  console.log(`[DEBUG] Starting sitemap generation process`);
  
  try {
    console.log(`[DEBUG] Parsing request body`);
    const data = req.body as RestaurantData;
    console.log(`[DEBUG] Restaurant data received:`, JSON.stringify({
      name: data.name,
      descriptionLength: data.description?.length || 0,
      menuLength: data.menu?.length || 0,
      hasLocation: Boolean(data.location),
      hasOpeningHours: Boolean(data.openingHours),
      hasPhone: Boolean(data.phone),
      hasEmail: Boolean(data.email),
      hasSocialMedia: Boolean(data.socialMedia)
    }, null, 2));
    
    if (!data.name) {
      console.log(`[ERROR] Restaurant name missing in request`);
      return res.status(400).json({ message: 'Restaurant name is required' });
    }

    // Log API key status (without showing the key)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log(`[DEBUG] API Key availability check`);
    console.log(`[DEBUG] API Key available: ${Boolean(apiKey)}`);
    console.log(`[DEBUG] API Key length: ${apiKey?.length || 0}`);
    
    if (!apiKey) {
      console.log(`[WARN] No ANTHROPIC_API_KEY found in environment, using default sitemap`);
      return res.status(200).json({ sitemap: createDefaultSitemap(data.name) });
    }

    // Sanitize text for command line
    const sanitizeText = (text: string) => {
      if (!text) return '';
      const sanitized = text
        .replace(/"/g, '\\"')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$')
        .replace(/\n/g, ' ');
        
      console.log(`[DEBUG] Sanitized text length: ${sanitized.length} (original: ${text.length})`);
      return sanitized;
    };

    // Construct a business description from the provided data
    console.log(`[DEBUG] Constructing business description from data fields`);
    const businessDescription = sanitizeText(`
      ${data.description}
      
      Menu: ${data.menu}
      
      Location: ${data.location}
      
      Opening Hours: ${data.openingHours}
      
      Contact: 
      Phone: ${data.phone}
      Email: ${data.email}
      Social Media: ${data.socialMedia}
    `);
    console.log(`[DEBUG] Business description length: ${businessDescription.length} characters`);

    // Use absolute paths for the script and output file - avoiding duplication by passing the full path
    const scriptPath = path.resolve(process.cwd(), 'agents/sitemap_agent.py');
    const outputPath = path.resolve(process.cwd(), 'sitemap.json');
    
    console.log(`[DEBUG] Script path (absolute): ${scriptPath}`);
    console.log(`[DEBUG] Output path (absolute): ${outputPath}`);
    console.log(`[DEBUG] Script exists: ${fs.existsSync(scriptPath)}`);
    console.log(`[DEBUG] Output file exists before running: ${fs.existsSync(outputPath)}`);
    
    let sitemap;
    
    // Check if the Python script exists
    if (fs.existsSync(scriptPath)) {
      try {
        // Check if any existing sitemap output file should be removed first
        if (fs.existsSync(outputPath)) {
          console.log(`[DEBUG] Removing existing sitemap output file before proceeding`);
          try {
            fs.unlinkSync(outputPath);
            console.log(`[DEBUG] Successfully removed existing sitemap file`);
          } catch (unlinkErr) {
            console.warn(`[WARN] Failed to remove existing sitemap file: ${unlinkErr}`);
          }
        }
        
        // Pass the API key as an environment variable
        process.env.ANTHROPIC_API_KEY = apiKey;
        
        // Try running the AI-powered Python script to generate the sitemap
        console.log(`[DEBUG] Running AI-powered sitemap agent at ${new Date().toISOString()}`);
        console.log(`[DEBUG] Business name for agent: "${data.name}"`);
        console.log(`[DEBUG] Starting Python script execution with timeout monitoring`);
        
        // Create a timeout to monitor long-running Python process
        let scriptTimedOut = false;
        const scriptTimeoutId = setTimeout(() => {
          scriptTimedOut = true;
          console.error(`[ERROR] Python script execution taking too long (>55 seconds)`);
        }, 55000);
        
        try {
          // Pass "api" as the fourth argument to indicate this is an API call and skip manual editing
          const scriptOutput = await runPythonScript(scriptPath, [data.name, businessDescription, "", "api"]);
          clearTimeout(scriptTimeoutId);
          
          if (scriptTimedOut) {
            console.log(`[DEBUG] Python script continued execution after timeout warning`);
          }
          
          console.log(`[DEBUG] Script completed successfully at ${new Date().toISOString()}`);
          console.log(`[DEBUG] Script execution time: ${Date.now() - startTime}ms`);
          console.log(`[DEBUG] Script output length: ${scriptOutput.length} characters`);
          console.log(`[DEBUG] Script output snippet: ${scriptOutput.substring(0, 500)}`);
        } catch (scriptErr) {
          clearTimeout(scriptTimeoutId);
          throw scriptErr;
        }
        
        // Check if the output file was created
        console.log(`[DEBUG] Checking for output file at ${outputPath}`);
        console.log(`[DEBUG] Output file exists: ${fs.existsSync(outputPath)}`);
        
        if (fs.existsSync(outputPath)) {
          try {
            const fileStats = fs.statSync(outputPath);
            console.log(`[DEBUG] Output file size: ${fileStats.size} bytes`);
            console.log(`[DEBUG] Output file created at: ${fileStats.birthtime.toISOString()}`);
            console.log(`[DEBUG] Current time: ${new Date().toISOString()}`);
          } catch (statErr) {
            console.warn(`[WARN] Could not get output file stats: ${statErr}`);
          }
          
          console.log(`[DEBUG] Reading sitemap output from file at ${new Date().toISOString()}`);
          sitemap = await readScriptOutput(outputPath);
          console.log(`[DEBUG] Successfully read sitemap from file at ${new Date().toISOString()}`);
          console.log(`[DEBUG] Sitemap keys: ${Object.keys(sitemap).join(', ')}`);
          
          // Validate the sitemap structure
          if (!sitemap || typeof sitemap !== 'object' || Object.keys(sitemap).length === 0) {
            console.error(`[ERROR] Sitemap is empty or invalid`);
            console.log(`[DEBUG] Using default sitemap fallback due to invalid structure`);
            sitemap = createDefaultSitemap(data.name);
          }
        } else {
          console.error(`[ERROR] Sitemap output file not found after script execution`);
          console.log(`[DEBUG] Using default sitemap fallback due to missing output file`);
          sitemap = createDefaultSitemap(data.name);
        }
      } catch (error) {
        console.error(`[ERROR] Error running Python script:`, error);
        console.log(`[DEBUG] Error type: ${error instanceof Error ? error.constructor.name : typeof error}`);
        console.log(`[DEBUG] Error message: ${error instanceof Error ? error.message : String(error)}`);
        if (error instanceof Error && error.stack) {
          console.log(`[DEBUG] Error stack: ${error.stack}`);
        }
        console.log(`[DEBUG] Using default sitemap fallback after error`);
        sitemap = createDefaultSitemap(data.name);
      }
    } else {
      console.error(`[ERROR] Python script not found at ${scriptPath}`);
      console.log(`[DEBUG] Using default sitemap fallback due to missing script`);
      sitemap = createDefaultSitemap(data.name);
    }
    
    // Return the generated or default sitemap
    console.log(`[DEBUG] API handler completed in ${Date.now() - startTime}ms`);
    console.log(`[DEBUG] Returning sitemap to client`);
    return res.status(200).json({ sitemap });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`[ERROR] Unhandled error in API handler after ${executionTime}ms:`, error);
    console.log(`[DEBUG] Error type: ${error instanceof Error ? error.constructor.name : typeof error}`);
    console.log(`[DEBUG] Error message: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.stack) {
      console.log(`[DEBUG] Error stack: ${error.stack}`);
    }
    
    return res.status(500).json({ 
      message: 'Error generating sitemap', 
      error: error instanceof Error ? error.message : String(error),
      executionTime
    });
  }
} 