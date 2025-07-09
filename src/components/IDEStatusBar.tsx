
import React from 'react';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
}

interface IDEStatusBarProps {
  selectedFile: ProjectFile | null;
  layout: string;
}

export const IDEStatusBar: React.FC<IDEStatusBarProps> = ({ selectedFile, layout }) => {
  return (
    <div className="bg-slate-800 border-t border-slate-700 px-4 py-1">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <span>Ready</span>
          <span>•</span>
          <span>TypeScript</span>
          <span>•</span>
          <span>UTF-8</span>
          {selectedFile && (
            <>
              <span>•</span>
              <span>{selectedFile.name}</span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span>Ln 1, Col 1</span>
          <span>•</span>
          <span>Spaces: 2</span>
          <span>•</span>
          <span>Layout: {layout}</span>
        </div>
      </div>
    </div>
  );
};
