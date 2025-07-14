
import React from 'react';
import { FileExplorer } from './FileExplorer';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
  parentId?: string;
}

interface ProjectManagerProps {
  onFileSelect?: (file: ProjectFile) => void;
  onProjectChange?: (files: ProjectFile[]) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  onFileSelect,
  onProjectChange
}) => {
  return (
    <FileExplorer 
      onFileSelect={onFileSelect}
      onProjectChange={onProjectChange}
    />
  );
};
