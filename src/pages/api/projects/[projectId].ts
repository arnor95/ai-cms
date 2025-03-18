import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId, file } = req.query;
  const action = req.query.action as string | undefined;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  // Determine the project path
  const projectPath = path.join(process.cwd(), 'temp', 'generated_projects', projectId);

  if (!fs.existsSync(projectPath)) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Action: Download the entire project as a zip file
  if (action === 'download') {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${projectId}.zip`);

    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    archive.on('error', (err: Error) => {
      console.error('Archive error:', err);
      res.status(500).end();
    });

    // Pipe the archive to the response
    archive.pipe(res);

    // Add the entire project directory to the archive
    archive.directory(projectPath, false);

    // Finalize the archive
    await archive.finalize();
    return;
  }

  // Action: Get project metadata
  if (action === 'metadata') {
    try {
      // Basic project info
      const stats = fs.statSync(projectPath);
      
      // Get count of files and directories
      const countFiles = (dirPath: string): { files: number, dirs: number, size: number } => {
        let result = { files: 0, dirs: 0, size: 0 };
        
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const itemStats = fs.statSync(itemPath);
          
          if (itemStats.isDirectory()) {
            result.dirs += 1;
            const subCount = countFiles(itemPath);
            result.files += subCount.files;
            result.dirs += subCount.dirs;
            result.size += subCount.size;
          } else {
            result.files += 1;
            result.size += itemStats.size;
          }
        }
        
        return result;
      };
      
      const counts = countFiles(projectPath);
      
      // Try to read package.json to get project info
      let packageInfo = {};
      try {
        const packagePath = path.join(projectPath, 'package.json');
        if (fs.existsSync(packagePath)) {
          packageInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        }
      } catch (err) {
        console.error('Failed to read package.json:', err);
      }
      
      return res.status(200).json({
        id: projectId,
        created: stats.birthtime,
        modified: stats.mtime,
        size: counts.size,
        files: counts.files,
        directories: counts.dirs,
        package: packageInfo
      });
    } catch (err) {
      console.error('Error getting project metadata:', err);
      return res.status(500).json({ error: 'Failed to get project metadata' });
    }
  }

  // If no specific file is requested, return the project structure
  if (!file) {
    try {
      const getDirectoryStructure = (dirPath: string, relativePath = ''): Record<string, any> => {
        const items = fs.readdirSync(dirPath);
        const result: Record<string, any> = {};
        
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const itemRelativePath = path.join(relativePath, item);
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            result[item] = {
              type: 'directory',
              path: itemRelativePath,
              children: getDirectoryStructure(itemPath, itemRelativePath)
            };
          } else {
            const ext = path.extname(item).toLowerCase();
            const isText = ['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.md', '.yml', '.yaml', '.txt'].includes(ext);
            
            result[item] = {
              type: 'file',
              path: itemRelativePath,
              size: stats.size,
              ext,
              isText
            };
          }
        }
        
        return result;
      };
      
      const structure = getDirectoryStructure(projectPath);
      return res.status(200).json(structure);
    } catch (err) {
      console.error('Error getting project structure:', err);
      return res.status(500).json({ error: 'Failed to get project structure' });
    }
  }

  // Serving a specific file
  try {
    const filePath = Array.isArray(file) 
      ? path.join(projectPath, ...file)
      : path.join(projectPath, file as string);
    
    // Security check - ensure the file is within the project directory
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(projectPath))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Handle directory request similar to the project structure
      const getDirectoryStructure = (dirPath: string): Record<string, any> => {
        const items = fs.readdirSync(dirPath);
        const result: Record<string, any> = {};
        
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            result[item] = {
              type: 'directory',
              children: getDirectoryStructure(itemPath)
            };
          } else {
            const ext = path.extname(item).toLowerCase();
            const isText = ['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.md', '.yml', '.yaml', '.txt'].includes(ext);
            
            result[item] = {
              type: 'file',
              size: stats.size,
              ext,
              isText
            };
          }
        }
        
        return result;
      };
      
      const structure = getDirectoryStructure(filePath);
      return res.status(200).json(structure);
    }
    
    // For text files, return the content
    const ext = path.extname(filePath).toLowerCase();
    const isText = ['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.md', '.yml', '.yaml', '.txt'].includes(ext);
    
    if (isText) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return res.status(200).json({ content });
    }
    
    // For binary files, stream them directly
    const contentType = 
      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
      ext === '.png' ? 'image/png' :
      ext === '.gif' ? 'image/gif' :
      ext === '.svg' ? 'image/svg+xml' :
      ext === '.ico' ? 'image/x-icon' :
      'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    
    const fileStream = fs.createReadStream(filePath);
    await pipelineAsync(fileStream, res);
  } catch (err) {
    console.error('Error serving file:', err);
    return res.status(500).json({ error: 'Failed to serve file' });
  }
} 