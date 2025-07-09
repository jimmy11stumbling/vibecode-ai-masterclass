
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TabsList } from '@/components/ui/tabs';
import { FileTab } from './FileTab';

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
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const createNewFile = () => {
    if (!newFileName.trim()) return;
    
    onCreateFile(newFileName.trim());
    setIsCreatingFile(false);
    setNewFileName('');
  };

  return (
    <div className="flex items-center border-b border-slate-700">
      <TabsList className="bg-slate-800 border-b border-slate-700 rounded-none justify-start h-auto p-0 flex-1">
        {files.map((file) => (
          <FileTab
            key={file.id}
            file={file}
            canDelete={files.length > 1}
            onDelete={onDeleteFile}
          />
        ))}
      </TabsList>
      
      <div className="p-2">
        {isCreatingFile ? (
          <div className="flex items-center space-x-2">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.tsx"
              className="w-32 h-6 text-xs bg-slate-800 border-slate-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter') createNewFile();
                if (e.key === 'Escape') {
                  setIsCreatingFile(false);
                  setNewFileName('');
                }
              }}
              autoFocus
            />
            <Button size="sm" onClick={createNewFile} className="h-6 px-2 text-xs">
              Add
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCreatingFile(true)}
            className="text-slate-400 hover:text-white h-6 w-6 p-0"
          >
            <Plus className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
