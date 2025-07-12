
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
  const lineCount = file.content.split('\n').length;
  const charCount = file.content.length;

  return (
    <div className="bg-slate-800 border-t border-slate-700 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
      <div className="flex items-center space-x-4">
        <span>Line {lineCount}</span>
        <span>{charCount} characters</span>
        <span className="capitalize">{file.language}</span>
      </div>
      <div className="flex items-center space-x-4">
        <span>UTF-8</span>
        <span>LF</span>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
};
