
import React from 'react';
import { Plus, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProjectFiles, ProjectFile } from '@/hooks/useProjectFiles';
import { FileTreeItem } from './FileTreeItem';

interface ProjectManagerProps {
  onFileSelect?: (file: ProjectFile) => void;
  onProjectChange?: (files: ProjectFile[]) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ 
  onFileSelect, 
  onProjectChange 
}) => {
  const {
    files,
    expandedFolders,
    editingId,
    editingName,
    setEditingName,
    toggleFolder,
    startEditing,
    saveEdit,
    createNewFile,
    deleteFile
  } = useProjectFiles(onProjectChange);

  const renderFile = (file: ProjectFile, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(file.id);
    const isEditing = editingId === file.id;

    return (
      <div key={file.id}>
        <FileTreeItem
          file={file}
          depth={depth}
          isExpanded={isExpanded}
          isEditing={isEditing}
          editingName={editingName}
          onEditingNameChange={setEditingName}
          onToggleFolder={toggleFolder}
          onStartEditing={startEditing}
          onSaveEdit={saveEdit}
          onDeleteFile={deleteFile}
          onFileSelect={onFileSelect}
        />

        {file.type === 'folder' && isExpanded && file.children && (
          <div>
            {file.children.map(child => renderFile(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="font-semibold text-white">Project Files</h3>
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => createNewFile(undefined, 'file')}
            className="text-slate-400 hover:text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => createNewFile(undefined, 'folder')}
            className="text-slate-400 hover:text-white"
          >
            <Folder className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {files.map(file => renderFile(file))}
        </div>
      </ScrollArea>
    </div>
  );
};
