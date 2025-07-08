
import React from 'react';
import { FolderOpen, Folder, File, Edit3, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectFile } from '@/hooks/useProjectFiles';

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
  return (
    <div
      className={`flex items-center space-x-2 py-1 px-2 hover:bg-slate-700 rounded cursor-pointer`}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      {file.type === 'folder' && (
        <button
          onClick={() => onToggleFolder(file.id)}
          className="text-slate-400 hover:text-white"
        >
          {isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
        </button>
      )}
      
      {file.type === 'file' && <File className="w-4 h-4 text-blue-400" />}

      {isEditing ? (
        <div className="flex-1 flex items-center space-x-1">
          <input
            type="text"
            value={editingName}
            onChange={(e) => onEditingNameChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') onSaveEdit();
            }}
            className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
            autoFocus
          />
          <Button size="sm" variant="ghost" onClick={onSaveEdit}>
            <Save className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div
          className="flex-1 flex items-center justify-between group"
          onClick={() => file.type === 'file' && onFileSelect?.(file)}
        >
          <span className="text-sm text-slate-200">{file.name}</span>
          <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onStartEditing(file);
              }}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile(file.id);
              }}
              className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
