
import { useState } from 'react';

export interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
  parentId?: string;
}

export const useProjectFiles = (onProjectChange?: (files: ProjectFile[]) => void) => {
  const [files, setFiles] = useState<ProjectFile[]>([
    {
      id: '1',
      name: 'src',
      type: 'folder',
      children: [
        {
          id: '2',
          name: 'components',
          type: 'folder',
          parentId: '1',
          children: [
            { 
              id: '3', 
              name: 'App.tsx', 
              type: 'file', 
              parentId: '2', 
              content: `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <h1 className="text-4xl font-bold text-center py-8">Welcome to Your App</h1>
      <p className="text-center text-muted-foreground">
        Start building your application with the AI assistant!
      </p>
    </div>
  );
}

export default App;` 
            },
            { 
              id: '4', 
              name: 'Header.tsx', 
              type: 'file', 
              parentId: '2', 
              content: `import React from 'react';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = "My App" }) => {
  return (
    <header className="bg-primary text-primary-foreground p-4">
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
};` 
            }
          ]
        },
        { 
          id: '5', 
          name: 'main.tsx', 
          type: 'file', 
          parentId: '1', 
          content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);` 
        },
        { 
          id: '6', 
          name: 'index.css', 
          type: 'file', 
          parentId: '1', 
          content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}` 
        }
      ]
    },
    { 
      id: '7', 
      name: 'package.json', 
      type: 'file', 
      content: `{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^4.0.0"
  }
}` 
    },
    { 
      id: '8', 
      name: 'README.md', 
      type: 'file', 
      content: `# My App

This is a React application built with the AI IDE.

## Getting Started

1. Use the AI assistant to add features
2. Preview your changes in real-time
3. Deploy when ready!
` 
    }
  ]);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1', '2']));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const updateFiles = (updatedFiles: ProjectFile[]) => {
    console.log('Updating project files:', updatedFiles);
    setFiles(updatedFiles);
    onProjectChange?.(updatedFiles);
  };

  const applyFileChanges = (changes: Array<{path: string; operation: string; content?: string}>) => {
    console.log('Applying file changes:', changes);
    
    let updatedFiles = [...files];
    
    changes.forEach(change => {
      const pathParts = change.path.split('/').filter(part => part.length > 0);
      const fileName = pathParts[pathParts.length - 1];
      
      if (change.operation === 'create' || change.operation === 'update') {
        // Find existing file or create new one
        const existingFile = findFileByPath(updatedFiles, change.path);
        
        if (existingFile) {
          // Update existing file
          updatedFiles = updateFileContent(updatedFiles, existingFile.id, change.content || '');
        } else {
          // Create new file
          const newFile: ProjectFile = {
            id: Date.now().toString() + Math.random(),
            name: fileName,
            type: 'file',
            content: change.content || '',
            parentId: findParentId(updatedFiles, pathParts.slice(0, -1))
          };
          
          updatedFiles = addFileToStructure(updatedFiles, newFile, pathParts.slice(0, -1));
        }
      } else if (change.operation === 'delete') {
        // Delete file
        updatedFiles = deleteFileByPath(updatedFiles, change.path);
      }
    });
    
    updateFiles(updatedFiles);
  };

  const findFileByPath = (fileList: ProjectFile[], path: string): ProjectFile | null => {
    const pathParts = path.split('/').filter(part => part.length > 0);
    
    const searchInFiles = (files: ProjectFile[], parts: string[]): ProjectFile | null => {
      if (parts.length === 0) return null;
      
      for (const file of files) {
        if (file.name === parts[0]) {
          if (parts.length === 1) {
            return file;
          } else if (file.children) {
            return searchInFiles(file.children, parts.slice(1));
          }
        }
      }
      return null;
    };
    
    return searchInFiles(fileList, pathParts);
  };

  const updateFileContent = (fileList: ProjectFile[], fileId: string, content: string): ProjectFile[] => {
    return fileList.map(file => {
      if (file.id === fileId) {
        return { ...file, content };
      }
      if (file.children) {
        return { ...file, children: updateFileContent(file.children, fileId, content) };
      }
      return file;
    });
  };

  const findParentId = (fileList: ProjectFile[], pathParts: string[]): string | undefined => {
    if (pathParts.length === 0) return undefined;
    
    const searchInFiles = (files: ProjectFile[], parts: string[]): string | undefined => {
      for (const file of files) {
        if (file.name === parts[0]) {
          if (parts.length === 1) {
            return file.id;
          } else if (file.children) {
            return searchInFiles(file.children, parts.slice(1));
          }
        }
      }
      return undefined;
    };
    
    return searchInFiles(fileList, pathParts);
  };

  const addFileToStructure = (fileList: ProjectFile[], newFile: ProjectFile, parentPath: string[]): ProjectFile[] => {
    if (parentPath.length === 0) {
      return [...fileList, newFile];
    }
    
    return fileList.map(file => {
      if (file.name === parentPath[0]) {
        if (parentPath.length === 1) {
          return {
            ...file,
            children: [...(file.children || []), newFile]
          };
        } else if (file.children) {
          return {
            ...file,
            children: addFileToStructure(file.children, newFile, parentPath.slice(1))
          };
        }
      }
      return file;
    });
  };

  const deleteFileByPath = (fileList: ProjectFile[], path: string): ProjectFile[] => {
    const pathParts = path.split('/').filter(part => part.length > 0);
    const fileName = pathParts[pathParts.length - 1];
    
    const removeFile = (files: ProjectFile[]): ProjectFile[] => {
      return files
        .filter(file => file.name !== fileName)
        .map(file => ({
          ...file,
          children: file.children ? removeFile(file.children) : undefined
        }));
    };
    
    return removeFile(fileList);
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const startEditing = (file: ProjectFile) => {
    setEditingId(file.id);
    setEditingName(file.name);
  };

  const saveEdit = () => {
    if (!editingId || !editingName.trim()) return;

    const updateFileNames = (fileList: ProjectFile[]): ProjectFile[] => {
      return fileList.map(file => {
        if (file.id === editingId) {
          return { ...file, name: editingName.trim() };
        }
        if (file.children) {
          return { ...file, children: updateFileNames(file.children) };
        }
        return file;
      });
    };

    const updatedFiles = updateFileNames(files);
    updateFiles(updatedFiles);
    setEditingId(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const createNewFile = (parentId?: string, type: 'file' | 'folder' = 'file') => {
    const newFile: ProjectFile = {
      id: Date.now().toString(),
      name: type === 'file' ? 'NewComponent.tsx' : 'newFolder',
      type,
      parentId,
      content: type === 'file' ? `import React from 'react';

export const NewComponent: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">New Component</h2>
      <p>Start building your component here!</p>
    </div>
  );
};

export default NewComponent;` : undefined,
      children: type === 'folder' ? [] : undefined
    };

    if (parentId) {
      const updateFileStructure = (fileList: ProjectFile[]): ProjectFile[] => {
        return fileList.map(file => {
          if (file.id === parentId && file.type === 'folder') {
            return {
              ...file,
              children: [...(file.children || []), newFile]
            };
          }
          if (file.children) {
            return { ...file, children: updateFileStructure(file.children) };
          }
          return file;
        });
      };
      updateFiles(updateFileStructure(files));
    } else {
      updateFiles([...files, newFile]);
    }

    startEditing(newFile);
  };

  const deleteFile = (fileId: string) => {
    const removeFile = (fileList: ProjectFile[]): ProjectFile[] => {
      return fileList
        .filter(file => file.id !== fileId)
        .map(file => ({
          ...file,
          children: file.children ? removeFile(file.children) : undefined
        }));
    };

    updateFiles(removeFile(files));
  };

  return {
    files,
    expandedFolders,
    editingId,
    editingName,
    setEditingName,
    toggleFolder,
    startEditing,
    saveEdit,
    cancelEdit,
    createNewFile,
    deleteFile,
    applyFileChanges
  };
};
