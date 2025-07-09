
import React, { useRef } from 'react';

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

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={file.content}
          onChange={(e) => onContentChange(file.id, e.target.value)}
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
    </div>
  );
};
