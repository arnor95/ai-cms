import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { runPythonScript } from '@/middleware/pythonRunner';

const execAsync = promisify(exec);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const status = {
      ready: false,
      scriptFound: false,
      anthropicKeySet: false,
      error: null as string | null,
      pythonAvailable: false,
      version: null as string | null,
    };

    // 1. Check if Python is available by trying to run a simple Python command
    try {
      const stdout = await runPythonScript('-c', ['print("Python is available")']);
      status.pythonAvailable = true;
      
      // Try to get the Python version
      try {
        const versionOutput = await runPythonScript('-c', ['import sys; print(sys.version)']);
        status.version = versionOutput.trim();
      } catch (versionError) {
        console.warn("Could not determine Python version:", versionError);
        status.version = "Unknown";
      }
    } catch (error) {
      status.error = 'Python not found. Please install Python 3.x';
      return res.status(200).json(status);
    }

    // 2. Check if script exists
    const scriptPath = process.env.PYTHON_SCRIPT_PATH 
      ? path.join(process.cwd(), process.env.PYTHON_SCRIPT_PATH)
      : path.join(process.cwd(), 'agents', 'code_action_agent.py');

    if (fs.existsSync(scriptPath)) {
      status.scriptFound = true;
    } else {
      status.error = `AI agent script not found at path: ${scriptPath}`;
      return res.status(200).json(status);
    }

    // 3. Check if ANTHROPIC_API_KEY is set
    if (process.env.ANTHROPIC_API_KEY) {
      status.anthropicKeySet = true;
    } else {
      status.error = 'ANTHROPIC_API_KEY environment variable is not set. Please add it to your .env file.';
      return res.status(200).json(status);
    }

    // All checks passed
    status.ready = status.scriptFound && status.anthropicKeySet && status.pythonAvailable;
    
    return res.status(200).json(status);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Agent status check failed:", errorMessage);
    
    return res.status(500).json({ 
      ready: false,
      error: errorMessage
    });
  }
} 