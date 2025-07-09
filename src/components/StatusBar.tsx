
import React from 'react';

interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

interface StatusBarProps {
  file: CodeFile;
}

export const StatusBar: React.FC<StatusBarProps> = ({ file }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-t border-slate-700 text-xs text-slate-400">
      <div className="flex items-center space-x-4">
        <span>Language: {file.language}</span>
        <span>Lines: {file.content.split('\n').length}</span>
        <span>Characters: {file.content.length}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span>UTF-8</span>
        <span>•</span>
        <span>Spaces: 2</span>
      </div>
    </div>
  );
};
