
import React, { useState, useEffect } from 'react';
import { ProjectFileManager } from './ProjectFileManager';
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { dynamicCodeModifier } from '@/services/dynamicCodeModifier';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
  parentId?: string;
  path: string;
  size?: number;
  lastModified?: Date;
}

interface ProjectManagerProps {
  onFileSelect?: (file: ProjectFile) => void;
  onProjectChange?: (files: ProjectFile[]) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  onFileSelect,
  onProjectChange
}) => {
  const {
    files,
    expandedFolders,
    editingId,
    editingName,
    setEditingName,
    toggleFolder,
    startEditing,
    saveEdit,
    createNewFile,
    deleteFile,
    updateFiles
  } = useProjectFiles(onProjectChange);

  const [selectedFileId, setSelectedFileId] = useState<string>();

  // Initialize with some default project structure
  useEffect(() => {
    if (files.length === 0) {
      const defaultFiles: ProjectFile[] = [
        {
          id: 'src',
          name: 'src',
          type: 'folder',
          path: '/src',
          children: [
            {
              id: 'components',
              name: 'components',
              type: 'folder',
              path: '/src/components',
              parentId: 'src',
              children: []
            },
            {
              id: 'pages',
              name: 'pages',
              type: 'folder',
              path: '/src/pages',
              parentId: 'src',
              children: []
            },
            {
              id: 'app',
              name: 'App.tsx',
              type: 'file',
              path: '/src/App.tsx',
              parentId: 'src',
              content: `import React from "react";

function App() {
  return (
    <div className="App">
      <h1>Hello Sovereign IDE</h1>
    </div>
  );
}

export default App;`,
              lastModified: new Date()
            }
          ]
        },
        {
          id: 'public',
          name: 'public',
          type: 'folder',
          path: '/public',
          children: []
        },
        {
          id: 'package',
          name: 'package.json',
          type: 'file',
          path: '/package.json',
          content: `{
  "name": "sovereign-ide-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0"
  }
}`,
          lastModified: new Date()
        }
      ];
      
      updateFiles(defaultFiles);
    }
  }, [files.length, updateFiles]);

  // Sync with dynamic code modifier
  useEffect(() => {
    const syncFiles = async () => {
      for (const file of files) {
        if (file.type === 'file' && file.content) {
          await dynamicCodeModifier.writeFile(file.path, file.content);
        }
      }
    };
    
    if (files.length > 0) {
      syncFiles();
    }
  }, [files]);

  const handleFileSelect = (file: ProjectFile) => {
    setSelectedFileId(file.id);
    onFileSelect?.(file);
  };

  const handleFilesChange = (newFiles: ProjectFile[]) => {
    updateFiles(newFiles);
  };

  return (
    <ProjectFileManager
      files={files}
      onFilesChange={handleFilesChange}
      onFileSelect={handleFileSelect}
      selectedFileId={selectedFileId}
    />
  );
};
