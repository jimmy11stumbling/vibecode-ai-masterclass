
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileTreeItem } from './FileTreeItem';
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { Plus, FolderPlus } from 'lucide-react';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
  parentId?: string;
}

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

  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      createNewFile(undefined, 'file');
      setIsCreating(false);
      setNewFileName('');
    }
  };

  const handleCreateFolder = () => {
    createNewFile(undefined, 'folder');
  };

  const renderFiles = (fileList: ProjectFile[], depth: number = 0) => {
    return fileList.map((file) => (
      <div key={file.id}>
        <FileTreeItem
          file={file}
          depth={depth}
          isExpanded={expandedFolders.has(file.id)}
          isEditing={editingId === file.id}
          editingName={editingName}
          onEditingNameChange={setEditingName}
          onToggleFolder={toggleFolder}
          onStartEditing={startEditing}
          onSaveEdit={saveEdit}
          onDeleteFile={deleteFile}
          onFileSelect={onFileSelect}
        />
        {file.type === 'folder' && 
         expandedFolders.has(file.id) && 
         file.children && 
         renderFiles(file.children, depth + 1)}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Project Files</h3>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCreateFolder}
              className="text-slate-400 hover:text-white h-8 w-8 p-0"
            >
              <FolderPlus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCreating(true)}
              className="text-slate-400 hover:text-white h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {isCreating && (
          <div className="flex items-center space-x-2 mb-2">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.tsx"
              className="text-xs bg-slate-800 border-slate-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFile();
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewFileName('');
                }
              }}
              autoFocus
            />
            <Button size="sm" onClick={handleCreateFile} className="h-8 px-2 text-xs">
              Add
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {renderFiles(files)}
        </div>
      </ScrollArea>
    </div>
  );
};
