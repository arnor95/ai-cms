import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

type ProjectInfo = {
  id: string;
  name?: string;
  created: string;
  modified: string;
  size: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Projects are stored in temp/generated_projects/{projectId}
    const projectsDir = path.join(process.cwd(), 'temp', 'generated_projects');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(projectsDir)) {
      fs.mkdirSync(projectsDir, { recursive: true });
      return res.status(200).json({ projects: [] });
    }
    
    const dirEntries = await readdir(projectsDir, { withFileTypes: true });
    const dirs = dirEntries.filter(entry => entry.isDirectory());
    
    const projects: ProjectInfo[] = [];
    
    for (const dir of dirs) {
      const projectPath = path.join(projectsDir, dir.name);
      const stats = await stat(projectPath);
      
      let projectName = dir.name;
      
      // Try to read package.json if it exists to get the project name
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
          if (packageJson.name) {
            projectName = packageJson.name;
          }
        } catch (err) {
          console.error(`Failed to parse package.json for project ${dir.name}:`, err);
        }
      }
      
      projects.push({
        id: dir.name,
        name: projectName,
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        size: stats.size,
      });
    }
    
    // Sort by creation date, newest first
    projects.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    
    return res.status(200).json({ projects });
  } catch (error) {
    console.error('Error listing projects:', error);
    return res.status(500).json({ error: 'Failed to list projects' });
  }
} 