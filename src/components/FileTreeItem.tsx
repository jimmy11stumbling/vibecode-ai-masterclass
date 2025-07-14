
import React from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
  parentId?: string;
}

interface FileTreeItemProps {
  file: ProjectFile;
  depth: number;
  isExpanded: boolean;
  isEditing: boolean;
  editingName: string;
  onEditingNameChange: (name: string) => void;
  onToggleFolder: (id: string) => void;
  onStartEditing: (file: ProjectFile) => void;
  onSaveEdit: () => void;
  onDeleteFile: (id: string) => void;
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
    } else if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSaveEdit();
    } else if (e.key === 'Escape') {
      onStartEditing({ ...file, name: file.name });
    }
  };

  const getFileIcon = () => {
    if (file.type === 'folder') {
      return isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const getFileColor = () => {
    if (file.type === 'folder') return 'text-blue-400';
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'jsx':
        return 'text-cyan-400';
      case 'ts':
      case 'js':
        return 'text-yellow-400';
      case 'css':
        return 'text-pink-400';
      case 'json':
        return 'text-green-400';
      case 'md':
        return 'text-gray-400';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div>
      <div
        className={`flex items-center group hover:bg-slate-800 rounded-sm px-2 py-1 cursor-pointer ${getFileColor()}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {file.type === 'folder' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFolder(file.id);
            }}
            className="mr-1 hover:bg-slate-700 rounded-sm p-0.5"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        )}
        
        <div className="flex items-center flex-1 min-w-0" onClick={handleClick}>
          {getFileIcon()}
          
          {isEditing ? (
            <Input
              value={editingName}
              onChange={(e) => onEditingNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={onSaveEdit}
              className="ml-2 h-6 text-xs bg-slate-700 border-slate-600 text-white"
              autoFocus
            />
          ) : (
            <span className="ml-2 text-sm truncate">{file.name}</span>
          )}
        </div>

        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onStartEditing(file);
            }}
            className="h-6 w-6 p-0 hover:bg-slate-700"
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFile(file.id);
            }}
            className="h-6 w-6 p-0 hover:bg-slate-700 text-red-400"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
