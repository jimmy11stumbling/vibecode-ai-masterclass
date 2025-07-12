
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  File, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
}

interface FileTreeItemProps {
  file: ProjectFile;
  depth: number;
  isExpanded: boolean;
  isEditing: boolean;
  editingName: string;
  onEditingNameChange: (name: string) => void;
  onToggleFolder: (folderId: string) => void;
  onStartEditing: (file: ProjectFile) => void;
  onSaveEdit: () => void;
  onDeleteFile: (fileId: string) => void;
  onFileSelect?: (file: ProjectFile) => void;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({
  file,
  depth,
  isExpanded,
  isEditing,
  editingName,
  onEditingNameChange,
  onToggleFolder,
  onStartEditing,
  onSaveEdit,
  onDeleteFile,
  onFileSelect
}) => {
  const handleClick = () => {
    if (file.type === 'folder') {
      onToggleFolder(file.id);
    } else {
      onFileSelect?.(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSaveEdit();
    } else if (e.key === 'Escape') {
      onSaveEdit();
    }
  };

  return (
    <div className="select-none">
      <div
        className="flex items-center hover:bg-slate-800 group relative py-1 px-2 rounded-md cursor-pointer"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <div className="flex items-center flex-1 min-w-0" onClick={handleClick}>
          {file.type === 'folder' && (
            <div className="flex-shrink-0 mr-1">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>
          )}
          
          <div className="flex-shrink-0 mr-2">
            {file.type === 'folder' ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-400" />
              ) : (
                <Folder className="w-4 h-4 text-blue-400" />
              )
            ) : (
              <File className="w-4 h-4 text-slate-400" />
            )}
          </div>

          {isEditing ? (
            <Input
              value={editingName}
              onChange={(e) => onEditingNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={onSaveEdit}
              className="h-6 text-xs bg-slate-700 border-slate-600 text-white"
              autoFocus
            />
          ) : (
            <span className="text-sm text-slate-200 truncate">{file.name}</span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
            <DropdownMenuItem
              onClick={() => onStartEditing(file)}
              className="text-slate-200 hover:bg-slate-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteFile(file.id)}
              className="text-red-400 hover:bg-slate-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
