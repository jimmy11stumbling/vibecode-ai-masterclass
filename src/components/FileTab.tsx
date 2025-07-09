
import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TabsTrigger } from '@/components/ui/tabs';

interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

interface FileTabProps {
  file: CodeFile;
  canDelete: boolean;
  onDelete: (fileId: string) => void;
}

export const FileTab: React.FC<FileTabProps> = ({ file, canDelete, onDelete }) => {
  return (
    <TabsTrigger
      value={file.id}
      className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 rounded-none border-r border-slate-700 px-4 py-2 relative group"
    >
      <FileText className="w-3 h-3 mr-1" />
      {file.name}
      {canDelete && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(file.id);
          }}
          className="ml-2 h-4 w-4 p-0 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ×
        </Button>
      )}
    </TabsTrigger>
  );
};
