
import React from 'react';
import { FileText, X } from 'lucide-react';
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
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(file.id);
  };

  return (
    <TabsTrigger
      value={file.id}
      className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 rounded-none border-r border-slate-700 px-4 py-2 relative group"
    >
      <div className="flex items-center space-x-2">
        <FileText className="w-3 h-3" />
        <span>{file.name}</span>
        {canDelete && (
          <div
            onClick={handleDelete}
            className="ml-1 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X className="w-3 h-3" />
          </div>
        )}
      </div>
    </TabsTrigger>
  );
};
