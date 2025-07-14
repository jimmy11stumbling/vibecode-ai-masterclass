
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X, Plus, FileText } from 'lucide-react';

interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

interface FileTabsProps {
  files: CodeFile[];
  onDeleteFile: (fileId: string) => void;
  onCreateFile: (fileName: string) => void;
}

export const FileTabs: React.FC<FileTabsProps> = ({
  files,
  onDeleteFile,
  onCreateFile
}) => {
  const [newFileName, setNewFileName] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setNewFileName('');
      setIsCreating(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'jsx':
        return '⚛️';
      case 'ts':
      case 'js':
        return '📜';
      case 'css':
        return '🎨';
      case 'json':
        return '📋';
      case 'md':
        return '📖';
      default:
        return '📄';
    }
  };

  return (
    <div className="flex items-center bg-slate-800 border-b border-slate-700 px-2 py-1">
      <TabsList className="bg-transparent h-8 p-0 space-x-1 flex-1">
        {files.map((file) => (
          <div key={file.id} className="flex items-center bg-slate-700 rounded-md">
            <TabsTrigger
              value={file.id}
              className="flex items-center space-x-2 px-3 py-1 text-sm data-[state=active]:bg-slate-600 data-[state=active]:text-white"
            >
              <span>{getFileIcon(file.name)}</span>
              <span>{file.name}</span>
            </TabsTrigger>
            {files.length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDeleteFile(file.id)}
                className="h-6 w-6 p-0 text-slate-400 hover:text-red-400 hover:bg-slate-600"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
      </TabsList>

      <div className="flex items-center space-x-2 ml-2">
        {isCreating ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFile();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              onBlur={handleCreateFile}
              placeholder="filename.tsx"
              className="bg-slate-700 text-white text-sm px-2 py-1 rounded border border-slate-600 focus:border-blue-400 focus:outline-none w-32"
              autoFocus
            />
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCreating(true)}
            className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <Plus className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
