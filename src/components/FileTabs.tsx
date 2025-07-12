
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X, Plus, File, Folder } from 'lucide-react';

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

export const FileTabs: React.FC<FileTabsProps> = ({ files, onDeleteFile, onCreateFile }) => {
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setNewFileName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="border-b border-slate-700 bg-slate-800">
      <div className="flex items-center">
        <TabsList className="bg-transparent h-auto p-0 space-x-0">
          {files.map((file) => (
            <div key={file.id} className="relative group">
              <TabsTrigger
                value={file.id}
                className="data-[state=active]:bg-slate-700 data-[state=inactive]:bg-slate-800 border-r border-slate-700 rounded-none px-4 py-2 flex items-center space-x-2"
              >
                <File className="w-4 h-4" />
                <span className="text-sm">{file.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(file.id);
                  }}
                  className="ml-2 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-slate-600"
                >
                  <X className="w-3 h-3" />
                </Button>
              </TabsTrigger>
            </div>
          ))}
        </TabsList>
        
        {isCreating ? (
          <div className="flex items-center space-x-2 px-4 py-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.tsx"
              className="bg-slate-700 text-white text-sm px-2 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFile();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              autoFocus
            />
            <Button size="sm" onClick={handleCreateFile} className="h-6 px-2 text-xs">
              Add
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCreating(true)}
            className="ml-2 h-8 w-8 p-0 text-slate-400 hover:text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
