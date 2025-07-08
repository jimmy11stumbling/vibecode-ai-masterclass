
import React, { useState } from 'react';
import { Folder, Plus, Trash2, Edit3, Save, FolderOpen, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [files, setFiles] = useState<ProjectFile[]>([
    {
      id: '1',
      name: 'src',
      type: 'folder',
      children: [
        {
          id: '2',
          name: 'components',
          type: 'folder',
          parentId: '1',
          children: [
            { id: '3', name: 'App.tsx', type: 'file', parentId: '2', content: 'App component code' },
            { id: '4', name: 'Header.tsx', type: 'file', parentId: '2', content: 'Header component code' }
          ]
        },
        { id: '5', name: 'index.tsx', type: 'file', parentId: '1', content: 'Main entry point' },
        { id: '6', name: 'styles.css', type: 'file', parentId: '1', content: 'Global styles' }
      ]
    },
    { id: '7', name: 'package.json', type: 'file', content: 'Package configuration' },
    { id: '8', name: 'README.md', type: 'file', content: 'Project documentation' }
  ]);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1', '2']));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const startEditing = (file: ProjectFile) => {
    setEditingId(file.id);
    setEditingName(file.name);
  };

  const saveEdit = () => {
    if (!editingId || !editingName.trim()) return;

    const updateFiles = (fileList: ProjectFile[]): ProjectFile[] => {
      return fileList.map(file => {
        if (file.id === editingId) {
          return { ...file, name: editingName.trim() };
        }
        if (file.children) {
          return { ...file, children: updateFiles(file.children) };
        }
        return file;
      });
    };

    const updatedFiles = updateFiles(files);
    setFiles(updatedFiles);
    setEditingId(null);
    setEditingName('');
    onProjectChange?.(updatedFiles);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const createNewFile = (parentId?: string, type: 'file' | 'folder' = 'file') => {
    const newFile: ProjectFile = {
      id: Date.now().toString(),
      name: type === 'file' ? 'newFile.tsx' : 'newFolder',
      type,
      parentId,
      content: type === 'file' ? '// New file content' : undefined,
      children: type === 'folder' ? [] : undefined
    };

    if (parentId) {
      const updateFiles = (fileList: ProjectFile[]): ProjectFile[] => {
        return fileList.map(file => {
          if (file.id === parentId && file.type === 'folder') {
            return {
              ...file,
              children: [...(file.children || []), newFile]
            };
          }
          if (file.children) {
            return { ...file, children: updateFiles(file.children) };
          }
          return file;
        });
      };
      setFiles(updateFiles(files));
    } else {
      setFiles([...files, newFile]);
    }

    startEditing(newFile);
  };

  const deleteFile = (fileId: string) => {
    const removeFile = (fileList: ProjectFile[]): ProjectFile[] => {
      return fileList
        .filter(file => file.id !== fileId)
        .map(file => ({
          ...file,
          children: file.children ? removeFile(file.children) : undefined
        }));
    };

    const updatedFiles = removeFile(files);
    setFiles(updatedFiles);
    onProjectChange?.(updatedFiles);
  };

  const renderFile = (file: ProjectFile, depth: number = 0) => {
    const isExpanded = expandedFolders.has(file.id);
    const isEditing = editingId === file.id;

    return (
      <div key={file.id}>
        <div
          className={`flex items-center space-x-2 py-1 px-2 hover:bg-slate-700 rounded cursor-pointer`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {file.type === 'folder' && (
            <button
              onClick={() => toggleFolder(file.id)}
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
                onChange={(e) => setEditingName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') saveEdit();
                  if (e.key === 'Escape') cancelEdit();
                }}
                className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={saveEdit}>
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
                    startEditing(file);
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
                    deleteFile(file.id);
                  }}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

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
