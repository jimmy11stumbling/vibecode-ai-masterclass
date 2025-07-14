
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  SortAsc, 
  FileText, 
  Folder, 
  Image, 
  Code, 
  Database,
  Settings,
  Download,
  Upload,
  FolderPlus,
  FilePlus
} from 'lucide-react';
import { FileTreeItem } from './FileTreeItem';
import { useProjectFiles } from '@/hooks/useProjectFiles';

interface FileExplorerProps {
  onFileSelect?: (file: any) => void;
  onProjectChange?: (files: any[]) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  onFileSelect,
  onProjectChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size' | 'type'>('name');
  const [filterType, setFilterType] = useState<'all' | 'files' | 'folders'>('all');

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

  const getFileIcon = (fileName: string, isFolder: boolean) => {
    if (isFolder) return <Folder className="w-4 h-4 text-blue-400" />;
    
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'jsx':
      case 'ts':
      case 'js':
        return <Code className="w-4 h-4 text-green-400" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="w-4 h-4 text-purple-400" />;
      case 'json':
        return <Database className="w-4 h-4 text-yellow-400" />;
      case 'css':
      case 'scss':
        return <Settings className="w-4 h-4 text-pink-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const renderFiles = (fileList: any[], depth: number = 0) => {
    return fileList
      .filter(file => {
        if (!searchQuery) return true;
        return file.name.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .filter(file => {
        if (filterType === 'all') return true;
        if (filterType === 'files') return file.type === 'file';
        if (filterType === 'folders') return file.type === 'folder';
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'type':
            if (a.type !== b.type) {
              return a.type === 'folder' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
          default:
            return a.name.localeCompare(b.name);
        }
      })
      .map((file) => (
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Add file to project
        console.log('Uploading file:', file.name, content);
      };
      reader.readAsText(file);
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-700 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">File Explorer</h3>
        
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => createNewFile(undefined, 'folder')}
            className="text-slate-400 hover:text-white h-8 w-8 p-0"
          >
            <FolderPlus className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => createNewFile(undefined, 'file')}
            className="text-slate-400 hover:text-white h-8 w-8 p-0"
          >
            <FilePlus className="w-4 h-4" />
          </Button>
          
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".js,.jsx,.ts,.tsx,.css,.json,.md,.txt"
            />
            <Button
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:text-white h-8 w-8 p-0"
              asChild
            >
              <span>
                <Upload className="w-4 h-4" />
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-slate-700 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="pl-10 bg-slate-800 border-slate-600 text-white text-sm h-8"
          />
        </div>

        {/* Filter and Sort */}
        <div className="flex items-center space-x-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-slate-800 border border-slate-600 text-white text-xs rounded px-2 py-1 flex-1"
          >
            <option value="all">All</option>
            <option value="files">Files Only</option>
            <option value="folders">Folders Only</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-800 border border-slate-600 text-white text-xs rounded px-2 py-1 flex-1"
          >
            <option value="name">Sort by Name</option>
            <option value="type">Sort by Type</option>
            <option value="modified">Sort by Modified</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {files.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No files in project</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => createNewFile(undefined, 'file')}
                className="mt-2"
              >
                Create First File
              </Button>
            </div>
          ) : (
            renderFiles(files)
          )}
        </div>
      </ScrollArea>

      {/* Stats */}
      <div className="border-t border-slate-700 px-4 py-2">
        <div className="text-xs text-slate-400 text-center">
          {files.length} items • {files.filter(f => f.type === 'file').length} files
        </div>
      </div>
    </div>
  );
};
