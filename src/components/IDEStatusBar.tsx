
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Code, 
  FileText, 
  Users, 
  Wifi, 
  WifiOff,
  Circle,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
}

interface ProjectStats {
  files: number;
  components: number;
  lines: number;
}

interface IDEStatusBarProps {
  selectedFile?: ProjectFile | null;
  layout?: string;
  isBuilding?: boolean;
  hasUnsavedChanges?: boolean;
  projectStats?: ProjectStats;
}

export const IDEStatusBar: React.FC<IDEStatusBarProps> = ({ 
  selectedFile, 
  layout = 'horizontal',
  isBuilding = false,
  hasUnsavedChanges = false,
  projectStats = { files: 0, components: 0, lines: 0 }
}) => {
  const getStatusColor = () => {
    if (isBuilding) return 'bg-blue-500';
    if (hasUnsavedChanges) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (isBuilding) return 'Building';
    if (hasUnsavedChanges) return 'Modified';
    return 'Ready';
  };

  const getFileLanguage = (fileName: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx': return 'TypeScript React';
      case 'ts': return 'TypeScript';
      case 'jsx': return 'JavaScript React';
      case 'js': return 'JavaScript';
      case 'css': return 'CSS';
      case 'json': return 'JSON';
      case 'md': return 'Markdown';
      default: return 'Text';
    }
  };

  return (
    <div className="bg-slate-800 border-t border-slate-700 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
          <span>{getStatusText()}</span>
        </div>

        {/* File Info */}
        {selectedFile && (
          <div className="flex items-center space-x-2">
            <FileText className="w-3 h-3" />
            <span>{selectedFile.name}</span>
            <span>•</span>
            <span>{getFileLanguage(selectedFile.name)}</span>
            {selectedFile.content && (
              <>
                <span>•</span>
                <span>{selectedFile.content.length} chars</span>
                <span>•</span>
                <span>{selectedFile.content.split('\n').length} lines</span>
              </>
            )}
          </div>
        )}

        {/* Project Stats */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Code className="w-3 h-3" />
            <span>{projectStats.components} components</span>
          </div>
          <div className="flex items-center space-x-1">
            <FileText className="w-3 h-3" />
            <span>{projectStats.files} files</span>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Layout Info */}
        <div className="flex items-center space-x-1">
          <Monitor className="w-3 h-3" />
          <span className="capitalize">{layout}</span>
        </div>

        {/* Encoding */}
        <span>UTF-8</span>

        {/* Line Ending */}
        <span>LF</span>

        {/* AI Status */}
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>DeepSeek AI</span>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-1">
          <Wifi className="w-3 h-3 text-green-400" />
          <span className="text-green-400">Connected</span>
        </div>

        {/* Build Status */}
        {isBuilding ? (
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            <Circle className="w-2 h-2 mr-1 animate-pulse" />
            Building
          </Badge>
        ) : hasUnsavedChanges ? (
          <Badge variant="outline" className="text-amber-400 border-amber-400">
            <AlertTriangle className="w-2 h-2 mr-1" />
            Unsaved
          </Badge>
        ) : (
          <Badge variant="outline" className="text-green-400 border-green-400">
            <CheckCircle className="w-2 h-2 mr-1" />
            Saved
          </Badge>
        )}

        {/* Version */}
        <span className="text-slate-500">v1.0.0</span>
      </div>
    </div>
  );
};
