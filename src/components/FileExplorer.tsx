
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { 
  FileText, 
  Folder, 
  FolderOpen, 
  Plus, 
  Trash2, 
  Edit3,
  Save,
  X,
  Copy,
  Scissors,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  GitBranch,
  Eye,
  EyeOff
} from 'lucide-react';
import { useProjectFiles } from '@/hooks/useProjectFiles';

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

interface FileExplorerProps {
  onFileSelect?: (file: ProjectFile) => void;
  onProjectChange?: (files: ProjectFile[]) => void;
  showSearch?: boolean;
  showFilter?: boolean;
  allowEdit?: boolean;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  onFileSelect,
  onProjectChange,
  showSearch = true,
  showFilter = true,
  allowEdit = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'files' | 'folders'>('all');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [clipboardItem, setClipboardItem] = useState<{ file: ProjectFile; action: 'copy' | 'cut' } | null>(null);

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
    deleteFile,
    updateFiles
  } = useProjectFiles((updatedFiles) => {
    // Ensure all files have the required path property
    const filesWithPath = updatedFiles.map(file => ({
      ...file,
      path: file.path || `/${file.name}`
    }));
    onProjectChange?.(filesWithPath);
  });

  // Initialize with default project structure
  useEffect(() => {
    if (files.length === 0) {
      const defaultFiles: ProjectFile[] = [
        {
          id: 'src',
          name: 'src',
          type: 'folder',
          path: '/src',
          children: [
            {
              id: 'components',
              name: 'components',
              type: 'folder',
              path: '/src/components',
              parentId: 'src',
              children: []
            },
            {
              id: 'pages',
              name: 'pages',
              type: 'folder',
              path: '/src/pages',
              parentId: 'src',
              children: []
            },
            {
              id: 'app',
              name: 'App.tsx',
              type: 'file',
              path: '/src/App.tsx',
              parentId: 'src',
              content: 'import React from "react";\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello Sovereign IDE</h1>\n    </div>\n  );\n}\n\nexport default App;',
              lastModified: new Date()
            }
          ]
        },
        {
          id: 'public',
          name: 'public',
          type: 'folder',
          path: '/public',
          children: []
        },
        {
          id: 'package',
          name: 'package.json',
          type: 'file',
          path: '/package.json',
          content: '{\n  "name": "sovereign-ide-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0"\n  }\n}',
          lastModified: new Date()
        }
      ];
      updateFiles(defaultFiles);
    }
  }, [files.length, updateFiles]);

  const handleFileClick = (file: ProjectFile) => {
    if (file.type === 'folder') {
      toggleFolder(file.id);
    } else {
      setSelectedFile(file.id);
      onFileSelect?.(file);
    }
  };

  const handleFileDoubleClick = (file: ProjectFile) => {
    if (file.type === 'file' && allowEdit) {
      startEditing(file);
    }
  };

  const handleCopy = (file: ProjectFile) => {
    setClipboardItem({ file, action: 'copy' });
  };

  const handleCut = (file: ProjectFile) => {
    setClipboardItem({ file, action: 'cut' });
  };

  const handlePaste = (targetFolderId?: string) => {
    if (!clipboardItem) return;

    const { file, action } = clipboardItem;
    
    if (action === 'copy') {
      // Create a copy of the file
      const newFile: ProjectFile = {
        ...file,
        id: `${file.id}_copy_${Date.now()}`,
        name: `${file.name.split('.')[0]}_copy.${file.name.split('.')[1] || ''}`,
        parentId: targetFolderId,
        path: targetFolderId ? `${getFilePath(targetFolderId)}/${file.name}` : `/${file.name}`
      };

      if (targetFolderId) {
        createNewFile(targetFolderId, file.type);
      } else {
        const filesWithPath = [...files, newFile].map(f => ({ ...f, path: f.path || `/${f.name}` }));
        updateFiles(filesWithPath);
      }
    } else if (action === 'cut') {
      // Move the file
      // Implementation for move operation would go here
    }

    setClipboardItem(null);
  };

  const getFilePath = (fileId: string): string => {
    const findPath = (files: ProjectFile[], id: string, currentPath = ''): string => {
      for (const file of files) {
        const newPath = currentPath + '/' + file.name;
        if (file.id === id) {
          return newPath;
        }
        if (file.children) {
          const found = findPath(file.children, id, newPath);
          if (found) return found;
        }
      }
      return '';
    };
    return findPath(files, fileId);
  };

  const getFileIcon = (file: ProjectFile) => {
    if (file.type === 'folder') {
      return expandedFolders.has(file.id) ? (
        <FolderOpen className="w-4 h-4 text-blue-400" />
      ) : (
        <Folder className="w-4 h-4 text-blue-400" />
      );
    }

    // File type icons based on extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'tsx':
      case 'jsx':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'ts':
      case 'js':
        return <FileText className="w-4 h-4 text-yellow-500" />;
      case 'css':
        return <FileText className="w-4 h-4 text-pink-500" />;
      case 'html':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'json':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'md':
        return <FileText className="w-4 h-4 text-gray-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const filterFiles = (files: ProjectFile[]): ProjectFile[] => {
    return files.filter(file => {
      // Search filter
      if (searchTerm && !file.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filterType !== 'all' && file.type !== filterType.slice(0, -1)) {
        return false;
      }

      // Hidden files filter
      if (!showHidden && file.name.startsWith('.')) {
        return false;
      }

      return true;
    }).map(file => ({
      ...file,
      children: file.children ? filterFiles(file.children) : undefined
    }));
  };

  const renderFileTree = (files: ProjectFile[], level = 0) => {
    const filteredFiles = filterFiles(files);

    return filteredFiles.map(file => (
      <div key={file.id}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div 
              className={`flex items-center p-2 hover:bg-slate-800 rounded cursor-pointer ${
                selectedFile === file.id ? 'bg-slate-700' : ''
              }`}
              style={{ marginLeft: `${level * 16}px` }}
              onClick={() => handleFileClick(file)}
              onDoubleClick={() => handleFileDoubleClick(file)}
            >
              {file.type === 'folder' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-4 h-4 p-0 mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(file.id);
                  }}
                >
                  {expandedFolders.has(file.id) ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </Button>
              )}
              
              {getFileIcon(file)}
              
              {editingId === file.id ? (
                <div className="flex items-center flex-1 ml-2">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 h-6 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                    onBlur={saveEdit}
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between flex-1 ml-2">
                  <span className="text-sm text-white truncate">{file.name}</span>
                  <div className="flex items-center space-x-1">
                    {file.size && (
                      <span className="text-xs text-slate-400">{formatFileSize(file.size)}</span>
                    )}
                    {file.type === 'file' && file.lastModified && (
                      <span className="text-xs text-slate-400">
                        {file.lastModified.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ContextMenuTrigger>
          
          <ContextMenuContent className="bg-slate-800 border-slate-600">
            {allowEdit && (
              <>
                <ContextMenuItem onClick={() => startEditing(file)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Rename
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleCopy(file)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleCut(file)}>
                  <Scissors className="w-4 h-4 mr-2" />
                  Cut
                </ContextMenuItem>
                {clipboardItem && file.type === 'folder' && (
                  <ContextMenuItem onClick={() => handlePaste(file.id)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Paste
                  </ContextMenuItem>
                )}
                <ContextMenuItem onClick={() => deleteFile(file.id)} className="text-red-400">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>
        
        {file.type === 'folder' && file.children && expandedFolders.has(file.id) && (
          renderFileTree(file.children, level + 1)
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center">
            <Folder className="w-4 h-4 mr-2" />
            Project Explorer
          </h3>
          
          {allowEdit && (
            <div className="flex space-x-1">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => createNewFile()}
                className="h-6 w-6 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => createNewFile(undefined, 'folder')}
                className="h-6 w-6 p-0"
              >
                <Folder className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowHidden(!showHidden)}
                className="h-6 w-6 p-0"
              >
                {showHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>
        
        {/* Search and Filter */}
        {showSearch && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 h-7 text-sm bg-slate-800 border-slate-600"
              />
            </div>
            
            {showFilter && (
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant={filterType === 'all' ? 'default' : 'ghost'}
                  onClick={() => setFilterType('all')}
                  className="h-6 text-xs"
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filterType === 'files' ? 'default' : 'ghost'}
                  onClick={() => setFilterType('files')}
                  className="h-6 text-xs"
                >
                  Files
                </Button>
                <Button
                  size="sm"
                  variant={filterType === 'folders' ? 'default' : 'ghost'}
                  onClick={() => setFilterType('folders')}
                  className="h-6 text-xs"
                >
                  Folders
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {files.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No files yet</p>
              {allowEdit && (
                <Button size="sm" className="mt-2" onClick={() => createNewFile()}>
                  Create First File
                </Button>
              )}
            </div>
          ) : (
            renderFileTree(files)
          )}
        </div>
      </ScrollArea>
      
      {/* Footer */}
      <div className="flex-shrink-0 p-2 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{files.length} items</span>
          {clipboardItem && (
            <Badge variant="outline" className="text-xs">
              {clipboardItem.action}: {clipboardItem.file.name}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
