
import { useState, useCallback } from 'react';
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

export const useProjectFiles = (onProjectChange?: (files: ProjectFile[]) => void) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const updateFiles = useCallback(async (newFiles: ProjectFile[]) => {
    setFiles(newFiles);
    onProjectChange?.(newFiles);
    
    // Sync with dynamic code modifier
    for (const file of newFiles) {
      if (file.type === 'file' && file.content !== undefined) {
        await dynamicCodeModifier.writeFile(file.path, file.content);
      }
    }
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

  const saveEdit = useCallback(async () => {
    if (editingId && editingName.trim()) {
      const updateFileInTree = (files: ProjectFile[]): ProjectFile[] => {
        return files.map(file => {
          if (file.id === editingId) {
            const updatedFile = { ...file, name: editingName.trim() };
            // Update path based on new name
            const pathParts = file.path.split('/');
            pathParts[pathParts.length - 1] = editingName.trim();
            updatedFile.path = pathParts.join('/');
            return updatedFile;
          }
          if (file.children) {
            return { ...file, children: updateFileInTree(file.children) };
          }
          return file;
        });
      };

      // Find the old file for renaming
      const oldFile = findFileById(files, editingId);
      const updatedFiles = updateFileInTree(files);
      
      if (oldFile) {
        const newFile = findFileById(updatedFiles, editingId);
        if (newFile && oldFile.path !== newFile.path) {
          await dynamicCodeModifier.renameFile(oldFile.path, newFile.path);
        }
      }
      
      await updateFiles(updatedFiles);
    }
    setEditingId(null);
    setEditingName('');
  }, [editingId, editingName, files, updateFiles]);

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

  const createNewFile = useCallback(async (parentId?: string, type: 'file' | 'folder' = 'file') => {
    const timestamp = Date.now();
    const fileName = type === 'folder' ? 'New Folder' : 'new-file.tsx';
    const newFile: ProjectFile = {
      id: timestamp.toString(),
      name: fileName,
      type,
      content: type === 'file' ? '' : undefined,
      children: type === 'folder' ? [] : undefined,
      parentId,
      path: parentId ? `/${parentId}/${fileName}` : `/${fileName}`,
      lastModified: new Date()
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
      const updatedFiles = addToParent(files);
      await updateFiles(updatedFiles);
      setExpandedFolders(prev => new Set(prev).add(parentId));
    } else {
      await updateFiles([...files, newFile]);
    }

    // Create the file in the dynamic code modifier
    if (type === 'file') {
      await dynamicCodeModifier.createFile(newFile.path, newFile.content || '');
    }

    setTimeout(() => startEditing(newFile), 0);
  }, [files, updateFiles, startEditing]);

  const deleteFile = useCallback(async (id: string) => {
    const fileToDelete = findFileById(files, id);
    if (fileToDelete) {
      await dynamicCodeModifier.deleteFile(fileToDelete.path);
    }

    const removeFromTree = (files: ProjectFile[]): ProjectFile[] => {
      return files.filter(file => file.id !== id).map(file => ({
        ...file,
        children: file.children ? removeFromTree(file.children) : undefined
      }));
    };

    await updateFiles(removeFromTree(files));
  }, [files, updateFiles]);

  const updateFileContent = useCallback(async (id: string, content: string) => {
    const updateContentInTree = (files: ProjectFile[]): ProjectFile[] => {
      return files.map(file => {
        if (file.id === id && file.type === 'file') {
          return { ...file, content, lastModified: new Date() };
        }
        if (file.children) {
          return { ...file, children: updateContentInTree(file.children) };
        }
        return file;
      });
    };

    const updatedFiles = updateContentInTree(files);
    const updatedFile = findFileById(updatedFiles, id);
    
    if (updatedFile && updatedFile.type === 'file') {
      await dynamicCodeModifier.updateFile(updatedFile.path, content);
    }
    
    await updateFiles(updatedFiles);
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
    updateFiles,
    updateFileContent
  };
};
