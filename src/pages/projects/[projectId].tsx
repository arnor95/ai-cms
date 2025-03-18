import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

type FileNode = {
  type: 'file';
  path: string;
  size: number;
  ext: string;
  isText: boolean;
};

type DirectoryNode = {
  type: 'directory';
  path: string;
  children: Record<string, FileNode | DirectoryNode>;
};

type ProjectMetadata = {
  id: string;
  created: string;
  modified: string;
  size: number;
  files: number;
  directories: number;
  package: any;
};

const ProjectPage = () => {
  const router = useRouter();
  const { projectId } = router.query;
  
  const [structure, setStructure] = useState<Record<string, FileNode | DirectoryNode> | null>(null);
  const [metadata, setMetadata] = useState<ProjectMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  // Load project structure
  useEffect(() => {
    if (!projectId) return;

    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Fetch project structure
        const structureRes = await fetch(`/api/projects/${projectId}`);
        if (!structureRes.ok) {
          throw new Error(`Failed to load project structure: ${structureRes.status}`);
        }
        const structureData = await structureRes.json();
        setStructure(structureData);
        
        // Fetch project metadata
        const metadataRes = await fetch(`/api/projects/${projectId}?action=metadata`);
        if (metadataRes.ok) {
          const metadataData = await metadataRes.json();
          setMetadata(metadataData);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading project:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Load file content when a file is selected
  const loadFileContent = async (filePath: string) => {
    try {
      setLoadingFile(true);
      const res = await fetch(`/api/projects/${projectId}?file=${encodeURIComponent(filePath)}`);
      if (!res.ok) {
        throw new Error(`Failed to load file: ${res.status}`);
      }
      const data = await res.text(); // Get raw text response
      try {
        // Try to parse as JSON
        const jsonData = JSON.parse(data);
        setFileContent(typeof jsonData.content === 'string' ? jsonData.content : JSON.stringify(jsonData, null, 2));
      } catch (e) {
        // If not JSON, use the raw text
        setFileContent(data);
      }
      setSelectedFile(filePath);
    } catch (err) {
      console.error('Error loading file:', err);
      setError(err instanceof Error ? err.message : 'Failed to load file');
    } finally {
      setLoadingFile(false);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const renderFileTree = (items: Record<string, FileNode | DirectoryNode>, basePath = '') => {
    return (
      <ul className="pl-5 mt-1 space-y-1">
        {Object.entries(items)
          .sort(([, a], [, b]) => {
            // Directories first, then files
            if (a.type === 'directory' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'directory') return 1;
            
            // Alphabetically by name
            return a.path.localeCompare(b.path);
          })
          .map(([name, item]) => {
            const fullPath = `${basePath}${name}`;
            
            if (item.type === 'directory') {
              return (
                <li key={fullPath} className="text-sm">
                  <div className="flex items-center text-blue-600 font-medium">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    {name}
                  </div>
                  {renderFileTree(item.children, `${fullPath}/`)}
                </li>
              );
            }
            
            return (
              <li key={fullPath} className="text-sm">
                <button 
                  onClick={() => item.isText ? loadFileContent(item.path) : null}
                  className={`flex items-center ${item.isText ? 'text-gray-700 hover:text-blue-600' : 'text-gray-500'} ${selectedFile === item.path ? 'font-bold' : ''}`}
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{name}</span>
                  <span className="ml-2 text-xs text-gray-400">({formatBytes(item.size)})</span>
                </button>
              </li>
            );
          })}
      </ul>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{projectId ? `Project: ${projectId}` : 'Project Viewer'}</title>
        <meta name="description" content="View and download generated website projects" />
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 truncate">
            {projectId ? `Project: ${projectId}` : 'Project Viewer'}
          </h1>
          <div className="flex space-x-4">
            <Link href="/" className="text-indigo-600 hover:text-indigo-800">
              Home
            </Link>
            {projectId && (
              <a 
                href={`/api/projects/${projectId}?action=download`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Download Project
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center">
            <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading project</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : structure ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Project Info */}
            <div className="md:col-span-3 bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">Project Information</h2>
              {metadata && (
                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">{new Date(metadata.created).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Size</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatBytes(metadata.size)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Files / Directories</dt>
                    <dd className="mt-1 text-sm text-gray-900">{metadata.files} / {metadata.directories}</dd>
                  </div>
                  {metadata.package && metadata.package.name && (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Package Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{metadata.package.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Version</dt>
                        <dd className="mt-1 text-sm text-gray-900">{metadata.package.version || 'N/A'}</dd>
                      </div>
                    </>
                  )}
                </dl>
              )}
            </div>
            
            {/* File Explorer */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">Files</h2>
              <div className="mt-4 overflow-auto max-h-[calc(100vh-250px)]">
                {renderFileTree(structure)}
              </div>
            </div>
            
            {/* File Content */}
            <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">
                {selectedFile ? (
                  <span className="break-all">
                    {selectedFile.split('/').pop()}
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({selectedFile})
                    </span>
                  </span>
                ) : (
                  'File Viewer'
                )}
              </h2>
              
              <div className="mt-4 overflow-auto max-h-[calc(100vh-250px)]">
                {loadingFile ? (
                  <div className="flex justify-center p-8">
                    <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : selectedFile && fileContent ? (
                  <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-xs">
                    <code>{fileContent}</code>
                  </pre>
                ) : selectedFile ? (
                  <div className="text-center p-8 text-gray-500">
                    File content cannot be displayed (binary file)
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    Select a file to view its contents
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 text-gray-500">
            No project data available
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectPage; 