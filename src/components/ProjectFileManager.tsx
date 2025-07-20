
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Folder, 
  Plus, 
  Trash2, 
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { dynamicCodeModifier } from '@/services/dynamicCodeModifier';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
  parentId?: string;
  path: string;
  size?: number;
  lastModified?: Date;
}

interface ProjectFileManagerProps {
  files: ProjectFile[];
  onFilesChange: (files: ProjectFile[]) => void;
  onFileSelect: (file: ProjectFile) => void;
  selectedFileId?: string;
}

export const ProjectFileManager: React.FC<ProjectFileManagerProps> = ({
  files,
  onFilesChange,
  onFileSelect,
  selectedFileId
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'components', 'pages']));

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCreateFile = async (parentId?: string) => {
    const timestamp = Date.now().toString();
    const newFile: ProjectFile = {
      id: `file-${timestamp}`,
      name: 'new-file.tsx',
      type: 'file',
      content: '',
      parentId,
      path: parentId ? `/${parentId}/new-file.tsx` : '/new-file.tsx',
      lastModified: new Date()
    };

    if (parentId) {
      const updatedFiles = addFileToParent(files, parentId, newFile);
      onFilesChange(updatedFiles);
      setExpandedFolders(prev => new Set(prev).add(parentId));
    } else {
      onFilesChange([...files, newFile]);
    }
    
    // Sync with dynamic code modifier
    await dynamicCodeModifier.createFile(newFile.path, newFile.content || '');
    
    setEditingId(newFile.id);
    setEditingName(newFile.name);
  };

  const handleCreateFolder = async (parentId?: string) => {
    const timestamp = Date.now().toString();
    const newFolder: ProjectFile = {
      id: `folder-${timestamp}`,
      name: 'new-folder',
      type: 'folder',
      children: [],
      parentId,
      path: parentId ? `/${parentId}/new-folder` : '/new-folder',
      lastModified: new Date()
    };

    if (parentId) {
      const updatedFiles = addFileToParent(files, parentId, newFolder);
      onFilesChange(updatedFiles);
      setExpandedFolders(prev => new Set(prev).add(parentId));
    } else {
      onFilesChange([...files, newFolder]);
    }
    
    setEditingId(newFolder.id);
    setEditingName(newFolder.name);
  };

  const addFileToParent = (files: ProjectFile[], parentId: string, newFile: ProjectFile): ProjectFile[] => {
    return files.map(file => {
      if (file.id === parentId && file.type === 'folder') {
        return {
          ...file,
          children: [...(file.children || []), newFile]
        };
      }
      if (file.children) {
        return {
          ...file,
          children: addFileToParent(file.children, parentId, newFile)
        };
      }
      return file;
    });
  };

  const handleSaveEdit = async () => {
    if (editingId && editingName.trim()) {
      const updatedFiles = updateFileName(files, editingId, editingName.trim());
      onFilesChange(updatedFiles);
      
      // Update in dynamic code modifier
      const file = findFileById(files, editingId);
      if (file) {
        const oldPath = file.path;
        const newPath = file.path.replace(file.name, editingName.trim());
        await dynamicCodeModifier.renameFile(oldPath, newPath);
      }
    }
    setEditingId(null);
    setEditingName('');
  };

  const findFileById = (files: ProjectFile[], id: string): ProjectFile | null => {
    for (const file of files) {
      if (file.id === id) return file;
      if (file.children) {
        const found = findFileById(file.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateFileName = (files: ProjectFile[], fileId: string, newName: string): ProjectFile[] => {
    return files.map(file => {
      if (file.id === fileId) {
        return { ...file, name: newName };
      }
      if (file.children) {
        return {
          ...file,
          children: updateFileName(file.children, fileId, newName)
        };
      }
      return file;
    });
  };

  const handleDeleteFile = async (fileId: string) => {
    const file = findFileById(files, fileId);
    if (file) {
      await dynamicCodeModifier.deleteFile(file.path);
    }
    
    const updatedFiles = removeFile(files, fileId);
    onFilesChange(updatedFiles);
  };

  const removeFile = (files: ProjectFile[], fileId: string): ProjectFile[] => {
    return files.filter(file => file.id !== fileId).map(file => ({
      ...file,
      children: file.children ? removeFile(file.children, fileId) : undefined
    }));
  };

  const renderFileTree = (files: ProjectFile[], level = 0) => {
    return files.map(file => (
      <div key={file.id}>
        <div 
          className={`flex items-center p-2 hover:bg-slate-800 rounded cursor-pointer ${
            selectedFileId === file.id ? 'bg-slate-700' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {file.type === 'folder' && (
            <button
              onClick={() => toggleFolder(file.id)}
              className="mr-1 p-0 hover:bg-slate-700 rounded"
            >
              {expandedFolders.has(file.id) ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
          )}
          
          {file.type === 'folder' ? (
            <Folder className="w-4 h-4 mr-2 text-blue-400" />
          ) : (
            <FileText className="w-4 h-4 mr-2 text-slate-400" />
          )}
          
          {editingId === file.id ? (
            <div className="flex items-center flex-1">
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="flex-1 h-6 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                <Save className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <>
              <span 
                className="flex-1 text-sm text-white"
                onClick={() => {
                  if (file.type === 'file') {
                    onFileSelect(file);
                  } else {
                    toggleFolder(file.id);
                  }
                }}
              >
                {file.name}
              </span>
              <div className="flex items-center opacity-0 group-hover:opacity-100">
                {file.type === 'folder' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleCreateFile(file.id)}
                      title="Add file"
                    >
                      <FileText className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleCreateFolder(file.id)}
                      title="Add folder"
                    >
                      <Folder className="w-3 h-3" />
                    </Button>
                  </>
                )}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setEditingId(file.id);
                    setEditingName(file.name);
                  }}
                  title="Rename"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleDeleteFile(file.id)}
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </>
          )}
        </div>
        
        {file.type === 'folder' && file.children && expandedFolders.has(file.id) && (
          <div>
            {renderFileTree(file.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 group">
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-white">Files</h3>
        <div className="flex space-x-1">
          <Button size="sm" variant="ghost" onClick={() => handleCreateFile()}>
            <FileText className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleCreateFolder()}>
            <Folder className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {files.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No files yet</p>
              <Button size="sm" className="mt-2" onClick={() => handleCreateFile()}>
                Create First File
              </Button>
            </div>
          ) : (
            renderFileTree(files)
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
