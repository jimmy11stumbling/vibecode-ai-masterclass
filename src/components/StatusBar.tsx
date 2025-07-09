
import React from 'react';
import { FileText, Code, Clock } from 'lucide-react';

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
  const getLineCount = () => file.content.split('\n').length;
  const getCharCount = () => file.content.length;
  
  const getLanguageIcon = () => {
    switch (file.language) {
      case 'typescript':
      case 'javascript':
        return <Code className="w-3 h-3" />;
      case 'css':
        return <div className="w-3 h-3 bg-blue-400 rounded-sm" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  return (
    <div className="px-4 py-2 border-t border-slate-700 bg-slate-800 text-xs text-slate-400">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            {getLanguageIcon()}
            <span className="capitalize">{file.language}</span>
          </div>
          <span>•</span>
          <span>{getLineCount()} lines</span>
          <span>•</span>
          <span>{getCharCount()} characters</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Auto-save enabled</span>
          </div>
          <span>•</span>
          <span>UTF-8</span>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
