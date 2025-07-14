
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Save, Download, Copy, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

interface MonacoCodeEditorProps {
  file: CodeFile;
  onContentChange: (fileId: string, content: string) => void;
  onRun?: (code: string) => void;
  onSave?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  file,
  onContentChange,
  onRun,
  onSave,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [wordCount, setWordCount] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    onContentChange(file.id, newContent);
    setHasUnsavedChanges(true);
    setWordCount(newContent.split(/\s+/).filter(word => word.length > 0).length);
    updateCursorPosition(e.target);
  };

  const updateCursorPosition = (textarea: HTMLTextAreaElement) => {
    const value = textarea.value;
    const selectionStart = textarea.selectionStart;
    const lines = value.substring(0, selectionStart).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    setCursorPosition({ line, column });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab insertion
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      
      onContentChange(file.id, newValue);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        updateCursorPosition(textarea);
      }, 0);
    }

    // Save shortcut
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave?.();
      setHasUnsavedChanges(false);
    }

    // Run shortcut
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun?.(file.content);
    }
  };

  const handleSave = () => {
    onSave?.();
    setHasUnsavedChanges(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file.content);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLanguageMode = (language: string) => {
    switch (language.toLowerCase()) {
      case 'typescript':
      case 'tsx':
        return 'typescript';
      case 'javascript':
      case 'jsx':
        return 'javascript';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'json':
        return 'json';
      case 'markdown':
        return 'markdown';
      default:
        return 'text';
    }
  };

  useEffect(() => {
    setWordCount(file.content.split(/\s+/).filter(word => word.length > 0).length);
    setHasUnsavedChanges(false);
  }, [file.content]);

  return (
    <div className={`flex flex-col h-full bg-slate-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-4 py-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-300">{file.name}</span>
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-400">● Unsaved</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRun?.(file.content)}
            className="text-green-400 hover:text-green-300 hover:bg-slate-700"
          >
            <Play className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
          >
            <Save className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="text-slate-400 hover:text-slate-300 hover:bg-slate-700"
          >
            <Copy className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className="text-slate-400 hover:text-slate-300 hover:bg-slate-700"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          {onToggleFullscreen && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleFullscreen}
              className="text-slate-400 hover:text-slate-300 hover:bg-slate-700"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 relative">
        <textarea
          ref={editorRef}
          value={file.content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onClick={(e) => updateCursorPosition(e.currentTarget)}
          onKeyUp={(e) => updateCursorPosition(e.currentTarget)}
          className="w-full h-full bg-slate-900 text-slate-100 font-mono text-sm p-4 pl-16 border-0 resize-none focus:outline-none"
          placeholder={`Write your ${file.language} code here...`}
          spellCheck={false}
          style={{
            tabSize: 2,
            fontFamily: '"Fira Code", "JetBrains Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace'
          }}
        />
        
        {/* Line Numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-800 border-r border-slate-700 flex flex-col text-slate-500 text-xs font-mono pt-4 overflow-hidden">
          {file.content.split('\n').map((_, index) => (
            <div key={index} className="h-[1.25rem] flex items-center justify-end pr-2 leading-5">
              {index + 1}
            </div>
          ))}
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-1 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
          <span>{file.content.length} chars</span>
          <span>{wordCount} words</span>
          <span className="capitalize">{getLanguageMode(file.language)}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>UTF-8</span>
          <span>LF</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${hasUnsavedChanges ? 'bg-amber-500' : 'bg-green-500'}`}></div>
            <span>{hasUnsavedChanges ? 'Modified' : 'Saved'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
