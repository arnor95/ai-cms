import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

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

    // 1. Check if Python is available
    try {
      const { stdout } = await execAsync('python --version');
      status.pythonAvailable = true;
      status.version = stdout.trim();
    } catch (error) {
      try {
        // Try python3 if python command not found
        const { stdout } = await execAsync('python3 --version');
        status.pythonAvailable = true;
        status.version = stdout.trim();
      } catch (error) {
        status.error = 'Python not found. Please install Python 3.x';
        return res.status(200).json(status);
      }
    }

    // 2. Check if script exists
    const scriptPath = process.env.PYTHON_SCRIPT_PATH 
      ? path.join(process.cwd(), process.env.PYTHON_SCRIPT_PATH)
      : path.join(process.cwd(), 'agents', 'code_action_agent.py');

    if (fs.existsSync(scriptPath)) {
      status.scriptFound = true;
    } else {
      status.error = `Script not found at path: ${scriptPath}`;
      return res.status(200).json(status);
    }

    // 3. Check if ANTHROPIC_API_KEY is set
    if (process.env.ANTHROPIC_API_KEY) {
      status.anthropicKeySet = true;
    } else {
      status.error = 'ANTHROPIC_API_KEY environment variable is not set';
      return res.status(200).json(status);
    }

    // All checks passed
    status.ready = status.scriptFound && status.anthropicKeySet && status.pythonAvailable;
    
    return res.status(200).json(status);
  } catch (error) {
    return res.status(500).json({ 
      ready: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 