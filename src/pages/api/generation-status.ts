import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type Progress = {
  page: string;
  section: string; 
  status: string;
} | null;

type GenerationStatus = {
  status: string;
  message: string;
  currentProgress: Progress;
  startTime: string | null;
  lastUpdate: string | null;
  logs: string[];
};

// Track generation progress across requests
let generationStatus: GenerationStatus = {
  status: 'idle',
  message: 'No generation in progress',
  currentProgress: null,
  startTime: null,
  lastUpdate: null,
  logs: []
};

// Function to update the generation status
export function updateGenerationStatus(
  status: string, 
  message: string, 
  progress?: { page: string; section: string; status: string }
) {
  generationStatus.status = status;
  generationStatus.message = message;
  
  if (progress) {
    generationStatus.currentProgress = progress;
  }
  
  generationStatus.lastUpdate = new Date().toISOString();
  
  // Add to logs
  generationStatus.logs.push(`[${new Date().toISOString()}] ${message}`);
  
  // Keep logs limited to last 100 entries
  if (generationStatus.logs.length > 100) {
    generationStatus.logs = generationStatus.logs.slice(-100);
  }
}

// Initialize generation
export function startGeneration() {
  generationStatus = {
    status: 'generating',
    message: 'Starting website generation...',
    currentProgress: null,
    startTime: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    logs: ['[' + new Date().toISOString() + '] Starting website generation...']
  };
}

// Mark generation as complete
export function completeGeneration(success: boolean, message: string) {
  generationStatus.status = success ? 'complete' : 'error';
  generationStatus.message = message;
  generationStatus.lastUpdate = new Date().toISOString();
  generationStatus.logs.push(`[${new Date().toISOString()}] ${message}`);
}

// Add log message
export function addGenerationLog(message: string) {
  generationStatus.logs.push(`[${new Date().toISOString()}] ${message}`);
  generationStatus.lastUpdate = new Date().toISOString();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check for progress logs file - this could be created by the Python agent
  try {
    const progressFile = path.join(process.cwd(), 'temp', 'generation_progress.json');
    
    if (fs.existsSync(progressFile)) {
      const fileContent = fs.readFileSync(progressFile, 'utf8');
      const progressData = JSON.parse(fileContent);
      
      // Update our in-memory status
      if (progressData.status) {
        generationStatus.status = progressData.status;
      }
      
      if (progressData.message) {
        generationStatus.message = progressData.message;
      }
      
      if (progressData.currentProgress) {
        generationStatus.currentProgress = progressData.currentProgress;
      }
      
      if (progressData.logs && Array.isArray(progressData.logs)) {
        // Merge logs
        const newLogs = progressData.logs.filter(
          (log: string) => !generationStatus.logs.includes(log)
        );
        generationStatus.logs = [...generationStatus.logs, ...newLogs];
      }
      
      generationStatus.lastUpdate = new Date().toISOString();
    }
  } catch (error) {
    console.error('Error reading progress file:', error);
  }
  
  // Return the current status
  return res.status(200).json(generationStatus);
} 