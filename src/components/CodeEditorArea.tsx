
import React, { useRef, useState, useEffect } from 'react';

interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

interface CodeEditorAreaProps {
  file: CodeFile;
  onContentChange: (fileId: string, content: string) => void;
}

export const CodeEditorArea: React.FC<CodeEditorAreaProps> = ({ file, onContentChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    onContentChange(file.id, newContent);
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
      
      // Set cursor position after the inserted tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        updateCursorPosition(textarea);
      }, 0);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    updateCursorPosition(e.currentTarget);
  };

  useEffect(() => {
    if (textareaRef.current) {
      updateCursorPosition(textareaRef.current);
    }
  }, [file.content]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={file.content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onClick={handleClick}
          onKeyUp={(e) => updateCursorPosition(e.currentTarget)}
          className="w-full h-full bg-slate-800 text-slate-100 font-mono text-sm p-4 pl-16 border-0 resize-none focus:outline-none"
          placeholder={`Write your ${file.language} code here...`}
          spellCheck={false}
        />
        
        {/* Line Numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-900 border-r border-slate-700 flex flex-col text-slate-500 text-xs font-mono pt-4">
          {file.content.split('\n').map((_, index) => (
            <div key={index} className="h-[1.25rem] flex items-center justify-end pr-2">
              {index + 1}
            </div>
          ))}
        </div>
      </div>
      
      {/* Status Line */}
      <div className="bg-slate-900 border-t border-slate-700 px-4 py-1 text-xs text-slate-400 flex items-center justify-between">
        <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
        <span className="capitalize">{file.language}</span>
      </div>
    </div>
  );
};
