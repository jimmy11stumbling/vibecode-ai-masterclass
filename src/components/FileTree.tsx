import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;
}

interface FileTreeProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  selectedFileId?: string;
}

export const FileTree: React.FC<FileTreeProps> = ({ files, onFileSelect, selectedFileId }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const renderFileNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedFileId === node.id;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center space-x-2 py-1 px-2 cursor-pointer hover:bg-gray-100 rounded ${
            isSelected ? 'bg-blue-50 border border-blue-200' : ''
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.id);
            } else {
              onFileSelect(node);
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-600" />
              ) : (
                <Folder className="h-4 w-4 text-blue-600" />
              )}
            </>
          ) : (
            <>
              <div className="w-4 h-4" /> {/* Spacer for alignment */}
              <File className="h-4 w-4 text-gray-600" />
            </>
          )}
          <span className={`text-sm ${isSelected ? 'font-medium text-blue-900' : 'text-gray-900'}`}>
            {node.name}
          </span>
        </div>
        
        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (files.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Folder className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm">No files yet</p>
        <p className="text-xs text-gray-400 mt-1">Ask the AI to create an application</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      {files.map(file => renderFileNode(file))}
    </div>
  );
};