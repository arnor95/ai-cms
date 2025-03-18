import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Executes a Python script with the given arguments
 * @param scriptPath Path to the Python script
 * @param args Arguments to pass to the script
 * @returns Promise resolving with the script's output
 */
export function runPythonScript(scriptPath: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    // Handle absolute path correctly - check if it's already absolute
    const absoluteScriptPath = scriptPath.startsWith('/') 
      ? scriptPath 
      : path.join(process.cwd(), scriptPath);
      
    console.log(`[DEBUG] Running Python script at: ${absoluteScriptPath}`);
    console.log(`[DEBUG] Script arguments:`, args);
    console.log(`[DEBUG] Current working directory: ${process.cwd()}`);
    
    // Verify the script exists
    if (!fs.existsSync(absoluteScriptPath)) {
      console.error(`[ERROR] Script not found at: ${absoluteScriptPath}`);
      return reject(new Error(`Python script not found at ${absoluteScriptPath}`));
    } else {
      console.log(`[DEBUG] Script file exists and is accessible`);
      
      try {
        const scriptStats = fs.statSync(absoluteScriptPath);
        console.log(`[DEBUG] Script file size: ${scriptStats.size} bytes`);
        console.log(`[DEBUG] Script file permissions: ${scriptStats.mode.toString(8)}`);
      } catch (err) {
        console.warn(`[WARN] Could not get script file stats: ${err}`);
      }
    }

    // Check if python3 exists first (for macOS/Linux)
    const pythonCommands = ['python3', 'python', 'py'];
    const safeArgs = args.map(arg => `"${arg.replace(/"/g, '\\"')}"`);
    
    console.log(`[DEBUG] Will try these Python commands in order:`, pythonCommands);
    
    // Try each Python command until one works
    tryPythonCommands(pythonCommands, absoluteScriptPath, safeArgs, resolve, reject);
  });
}

/**
 * Try multiple Python commands until one works
 */
function tryPythonCommands(
  commands: string[], 
  scriptPath: string, 
  args: string[], 
  resolve: (value: string) => void, 
  reject: (reason: Error) => void,
  index = 0
) {
  if (index >= commands.length) {
    console.error('[ERROR] None of the Python commands worked');
    return reject(new Error('Could not find a working Python installation'));
  }
  
  const command = `${commands[index]} "${scriptPath}" ${args.join(' ')}`;
  console.log(`[DEBUG] Trying command: ${command}`);
  
  // Pass the current environment with ANTHROPIC_API_KEY
  const options = { 
    // Increase buffer size to handle larger outputs (50MB)
    maxBuffer: 50 * 1024 * 1024,
    // Set a longer timeout value (3 minutes)
    timeout: 180000,
    env: { ...process.env }
  };
  
  console.log(`[DEBUG] Environment includes ANTHROPIC_API_KEY:`, Boolean(options.env.ANTHROPIC_API_KEY));
  if (!options.env.ANTHROPIC_API_KEY) {
    console.error('[ERROR] ANTHROPIC_API_KEY is missing from environment variables');
  } else {
    console.log(`[DEBUG] API key exists and is ${options.env.ANTHROPIC_API_KEY.length} characters long`);
    console.log(`[DEBUG] API key starts with: ${options.env.ANTHROPIC_API_KEY.substring(0, 10)}***`);
  }
  
  console.log(`[DEBUG] Starting exec with command: ${commands[index]} and script: ${scriptPath}`);
  console.log(`[DEBUG] Command buffer size: ${options.maxBuffer} bytes, timeout: ${options.timeout}ms`);
  
  exec(command, options, (error, stdout, stderr) => {
    if (error) {
      console.warn(`[WARN] Command '${commands[index]}' failed with error code ${error.code}:`);
      console.warn(`[WARN] Error message: ${error.message}`);
      
      // Check for specific error types
      if (error.code === 'ETIMEDOUT' || (error.message && error.message.includes('timeout'))) {
        console.error(`[ERROR] Command timed out after ${options.timeout}ms`);
      } else if (error.code === 'ENOENT') {
        console.error(`[ERROR] Command not found: ${commands[index]}`);
      } else if (error.message && error.message.includes('maxBuffer')) {
        console.error(`[ERROR] Command output exceeded buffer size of ${options.maxBuffer} bytes`);
      }
      
      // Try the next command
      console.log(`[DEBUG] Trying next Python command...`);
      return tryPythonCommands(commands, scriptPath, args, resolve, reject, index + 1);
    }
    
    if (stderr) {
      console.warn(`[WARN] Python script stderr output: ${stderr}`);
    }
    
    console.log(`[DEBUG] Python script executed successfully with ${commands[index]}`);
    console.log(`[DEBUG] Python script stdout length: ${stdout.length} characters`);
    console.log(`[DEBUG] Python output start: ${stdout.substring(0, 200)}${stdout.length > 200 ? '...' : ''}`);
    
    // Check if the output contains useful information
    if (stdout.includes('Error:') || stdout.includes('Exception:')) {
      console.warn(`[WARN] Python script output contains error messages`);
    }
    
    resolve(stdout);
  });
}

/**
 * Reads and parses a JSON file produced by a Python script
 * @param filePath Path to the JSON file
 * @returns Promise resolving with the parsed JSON data
 */
export function readScriptOutput(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const absoluteFilePath = filePath.startsWith('/')
      ? filePath
      : path.join(process.cwd(), filePath);
      
    console.log(`[DEBUG] Reading output file at: ${absoluteFilePath}`);
    
    // Check if the file exists before trying to read it
    if (!fs.existsSync(absoluteFilePath)) {
      console.error(`[ERROR] Output file does not exist: ${absoluteFilePath}`);
      return reject(new Error(`Output file not found: ${absoluteFilePath}`));
    }
    
    console.log(`[DEBUG] Output file exists, attempting to read...`);
    
    fs.readFile(absoluteFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`[ERROR] Error reading file: ${err.message}`);
        return reject(err);
      }
      
      console.log(`[DEBUG] Successfully read file with ${data.length} characters`);
      console.log(`[DEBUG] File content starts with: ${data.substring(0, 100)}...`);
      
      try {
        const jsonData = JSON.parse(data);
        console.log(`[DEBUG] Successfully parsed JSON with ${Object.keys(jsonData).length} top-level keys`);
        console.log(`[DEBUG] JSON keys: ${Object.keys(jsonData).join(', ')}`);
        resolve(jsonData);
      } catch (parseErr) {
        console.error(`[ERROR] Error parsing JSON: ${parseErr}`);
        console.error(`[ERROR] Invalid JSON content: ${data.substring(0, 200)}...`);
        reject(parseErr);
      }
    });
  });
} 