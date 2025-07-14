
import { useState, useCallback } from 'react';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
  parentId?: string;
}

export const useProjectFiles = (onProjectChange?: (files: ProjectFile[]) => void) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const updateFiles = useCallback((newFiles: ProjectFile[]) => {
    setFiles(newFiles);
    onProjectChange?.(newFiles);
  }, [onProjectChange]);

  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const startEditing = useCallback((file: ProjectFile) => {
    setEditingId(file.id);
    setEditingName(file.name);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingId && editingName.trim()) {
      const updateFileInTree = (files: ProjectFile[]): ProjectFile[] => {
        return files.map(file => {
          if (file.id === editingId) {
            return { ...file, name: editingName.trim() };
          }
          if (file.children) {
            return { ...file, children: updateFileInTree(file.children) };
          }
          return file;
        });
      };

      updateFiles(updateFileInTree(files));
    }
    setEditingId(null);
    setEditingName('');
  }, [editingId, editingName, files, updateFiles]);

  const createNewFile = useCallback((parentId?: string, type: 'file' | 'folder' = 'file') => {
    const newFile: ProjectFile = {
      id: Date.now().toString(),
      name: type === 'folder' ? 'New Folder' : 'new-file.txt',
      type,
      content: type === 'file' ? '' : undefined,
      children: type === 'folder' ? [] : undefined,
      parentId
    };

    if (parentId) {
      const addToParent = (files: ProjectFile[]): ProjectFile[] => {
        return files.map(file => {
          if (file.id === parentId && file.type === 'folder') {
            return {
              ...file,
              children: [...(file.children || []), newFile]
            };
          }
          if (file.children) {
            return { ...file, children: addToParent(file.children) };
          }
          return file;
        });
      };
      updateFiles(addToParent(files));
      setExpandedFolders(prev => new Set(prev).add(parentId));
    } else {
      updateFiles([...files, newFile]);
    }

    // Start editing the new file
    setTimeout(() => startEditing(newFile), 0);
  }, [files, updateFiles, startEditing]);

  const deleteFile = useCallback((id: string) => {
    const removeFromTree = (files: ProjectFile[]): ProjectFile[] => {
      return files.filter(file => file.id !== id).map(file => ({
        ...file,
        children: file.children ? removeFromTree(file.children) : undefined
      }));
    };

    updateFiles(removeFromTree(files));
  }, [files, updateFiles]);

  return {
    files,
    expandedFolders,
    editingId,
    editingName,
    setEditingName,
    toggleFolder,
    startEditing,
    saveEdit,
    createNewFile,
    deleteFile,
    updateFiles
  };
};
