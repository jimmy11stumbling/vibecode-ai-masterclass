
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Code, 
  Play, 
  Download, 
  Copy, 
  FileText, 
  Folder,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface CodeBlock {
  id: string;
  language: string;
  code: string;
  filename?: string;
  description?: string;
}

interface CodePreviewProps {
  codeBlocks: CodeBlock[];
  onRunCode?: (code: string, language: string) => void;
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  codeBlocks,
  onRunCode
}) => {
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());

  const toggleExpanded = (blockId: string) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-600',
      typescript: 'bg-blue-600',
      jsx: 'bg-cyan-600',
      tsx: 'bg-blue-500',
      html: 'bg-orange-600',
      css: 'bg-purple-600',
      python: 'bg-green-600',
      json: 'bg-gray-600'
    };
    return colors[language.toLowerCase()] || 'bg-slate-600';
  };

  if (codeBlocks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900 text-slate-400">
        <div className="text-center">
          <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No code blocks generated yet</p>
          <p className="text-sm">Code will appear here when AI generates it</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Code Preview</h2>
            <p className="text-sm text-slate-400">
              {codeBlocks.length} code block{codeBlocks.length !== 1 ? 's' : ''} generated
            </p>
          </div>
          <Badge variant="secondary" className="bg-slate-800 text-slate-300">
            AI Generated
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {codeBlocks.map((block) => (
              <Card key={block.id} className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleExpanded(block.id)}
                        className="text-slate-400 hover:text-white"
                      >
                        {expandedBlocks.has(block.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      
                      <FileText className="w-4 h-4 text-blue-400" />
                      
                      <div>
                        <CardTitle className="text-sm font-medium text-white">
                          {block.filename || `${block.language} code`}
                        </CardTitle>
                        {block.description && (
                          <p className="text-xs text-slate-400 mt-1">
                            {block.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge 
                        className={`text-xs text-white ${getLanguageColor(block.language)}`}
                      >
                        {block.language}
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCode(block.code)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadCode(block.code, block.filename || `code.${block.language}`)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      
                      {onRunCode && (
                        <Button
                          size="sm"
                          onClick={() => onRunCode(block.code, block.language)}
                          className="h-8 px-3 bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Run
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedBlocks.has(block.id) && (
                  <CardContent className="pt-0">
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
                      <pre className="text-sm text-slate-300 overflow-x-auto">
                        <code>{block.code}</code>
                      </pre>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
