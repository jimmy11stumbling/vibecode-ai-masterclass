
import React from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen, 
  Plus,
  Trash2,
  Edit,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectFile } from '@/hooks/useProjectFiles';

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
  const paddingLeft = depth * 16;

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {
      return <File className="w-4 h-4 text-blue-400" />;
    } else if (fileName.endsWith('.ts') || fileName.endsWith('.js')) {
      return <File className="w-4 h-4 text-yellow-400" />;
    } else if (fileName.endsWith('.css')) {
      return <File className="w-4 h-4 text-purple-400" />;
    } else if (fileName.endsWith('.json')) {
      return <File className="w-4 h-4 text-green-400" />;
    } else if (fileName.endsWith('.md')) {
      return <File className="w-4 h-4 text-gray-400" />;
    }
    return <File className="w-4 h-4 text-gray-400" />;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSaveEdit();
    } else if (e.key === 'Escape') {
      // Handle cancel edit
    }
  };

  return (
    <div
      className="flex items-center space-x-2 py-1 px-2 hover:bg-white/10 rounded group"
      style={{ paddingLeft }}
    >
      {file.type === 'folder' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onToggleFolder(file.id)}
          className="w-4 h-4 p-0 text-gray-400 hover:text-white"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </Button>
      )}
      
      {file.type === 'file' && <div className="w-4" />}
      
      <div className="flex items-center space-x-2 flex-1">
        {file.type === 'folder' ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 text-blue-400" />
          ) : (
            <Folder className="w-4 h-4 text-blue-400" />
          )
        ) : (
          getFileIcon(file.name)
        )}
        
        {isEditing ? (
          <div className="flex items-center space-x-1 flex-1">
            <input
              type="text"
              value={editingName}
              onChange={(e) => onEditingNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm flex-1"
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSaveEdit}
              className="w-6 h-6 p-0 text-green-400 hover:text-green-300"
            >
              <Check className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 text-red-400 hover:text-red-300"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <span
            className="text-sm text-gray-300 cursor-pointer hover:text-white flex-1"
            onClick={() => file.type === 'file' && onFileSelect?.(file)}
          >
            {file.name}
          </span>
        )}
      </div>
      
      {!isEditing && (
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStartEditing(file)}
            className="w-6 h-6 p-0 text-gray-400 hover:text-white"
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDeleteFile(file.id)}
            className="w-6 h-6 p-0 text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
