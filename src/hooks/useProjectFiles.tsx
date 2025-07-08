
import { useState } from 'react';

export interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
  parentId?: string;
}

export const useProjectFiles = (onProjectChange?: (files: ProjectFile[]) => void) => {
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

  const updateFiles = (updatedFiles: ProjectFile[]) => {
    setFiles(updatedFiles);
    onProjectChange?.(updatedFiles);
  };

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

    const updateFileNames = (fileList: ProjectFile[]): ProjectFile[] => {
      return fileList.map(file => {
        if (file.id === editingId) {
          return { ...file, name: editingName.trim() };
        }
        if (file.children) {
          return { ...file, children: updateFileNames(file.children) };
        }
        return file;
      });
    };

    const updatedFiles = updateFileNames(files);
    updateFiles(updatedFiles);
    setEditingId(null);
    setEditingName('');
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
      const updateFileStructure = (fileList: ProjectFile[]): ProjectFile[] => {
        return fileList.map(file => {
          if (file.id === parentId && file.type === 'folder') {
            return {
              ...file,
              children: [...(file.children || []), newFile]
            };
          }
          if (file.children) {
            return { ...file, children: updateFileStructure(file.children) };
          }
          return file;
        });
      };
      updateFiles(updateFileStructure(files));
    } else {
      updateFiles([...files, newFile]);
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

    updateFiles(removeFile(files));
  };

  return {
    files,
    expandedFolders,
    editingId,
    editingName,
    setEditingName,
    toggleFolder,
    startEditing,
    saveEdit,
    cancelEdit,
    createNewFile,
    deleteFile
  };
};
