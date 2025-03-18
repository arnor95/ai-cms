// Test script for sitemap generation
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

// Test data
const testData = {
  name: 'Test Restaurant',
  description: 'A test restaurant description',
};

// Path to the Python script
const scriptPath = path.join(process.cwd(), 'agents/sitemap_agent.py');
const outputPath = path.join(process.cwd(), 'sitemap.json');

console.log('Testing sitemap generation...');
console.log('ANTHROPIC_API_KEY present:', Boolean(process.env.ANTHROPIC_API_KEY));
console.log('Script path:', scriptPath);
console.log('Script exists:', fs.existsSync(scriptPath));

// Run the Python script
const python = spawn('python3', [scriptPath, testData.name, testData.description]);

python.stdout.on('data', (data) => {
  console.log('Python stdout:', data.toString());
});

python.stderr.on('data', (data) => {
  console.error('Python stderr:', data.toString());
});

python.on('close', (code) => {
  console.log(`Python process exited with code ${code}`);
  
  if (code === 0) {
    // Check if the output file was created
    if (fs.existsSync(outputPath)) {
      console.log('Output file found at:', outputPath);
      try {
        const sitemap = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        console.log('Sitemap generated successfully:', sitemap);
      } catch (error) {
        console.error('Error parsing sitemap:', error);
      }
    } else {
      console.error('Output file not found:', outputPath);
    }
  }
}); 