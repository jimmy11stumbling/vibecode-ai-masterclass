
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code2, 
  Copy, 
  Download, 
  Play, 
  RefreshCw, 
  Eye,
  FileText,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeBlock {
  id: string;
  language: string;
  code: string;
  filename?: string;
  description?: string;
}

interface CodePreviewProps {
  codeBlocks?: CodeBlock[];
  onRunCode?: (code: string, language: string) => void;
  onSaveCode?: (code: string, filename: string) => void;
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  codeBlocks = [],
  onRunCode,
  onSaveCode
}) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [selectedBlock, setSelectedBlock] = useState<CodeBlock | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (codeBlocks.length > 0 && !selectedBlock) {
      setSelectedBlock(codeBlocks[0]);
    }
  }, [codeBlocks, selectedBlock]);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Code copied",
        description: "Code has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleDownloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'code.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Code downloaded",
      description: `${filename} has been downloaded`,
    });
  };

  const handleRunCode = async (code: string, language: string) => {
    setIsRunning(true);
    try {
      await onRunCode?.(code, language);
      toast({
        title: "Code executed",
        description: "Code has been executed successfully",
      });
    } catch (error) {
      toast({
        title: "Execution failed",
        description: "Failed to execute code",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getLanguageIcon = (language: string) => {
    switch (language.toLowerCase()) {
      case 'typescript':
      case 'tsx':
        return '🔷';
      case 'javascript':
      case 'jsx':
        return '🟨';
      case 'html':
        return '🌐';
      case 'css':
        return '🎨';
      case 'json':
        return '📋';
      default:
        return '📄';
    }
  };

  if (codeBlocks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900 rounded-lg border border-slate-700">
        <div className="text-center text-slate-400">
          <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Code to Preview</h3>
          <p className="text-sm">Generate some code to see it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-900 rounded-lg border border-slate-700 flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="border-b border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Code Preview</h3>
            <Badge variant="secondary">{codeBlocks.length} blocks</Badge>
          </div>
          
          <TabsList className="bg-slate-800 w-full">
            <TabsTrigger value="preview" className="data-[state=active]:bg-slate-700">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="blocks" className="data-[state=active]:bg-slate-700">
              <FileText className="w-4 h-4 mr-2" />
              Blocks
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="preview" className="h-full m-0">
            {selectedBlock && (
              <div className="h-full flex flex-col">
                <div className="border-b border-slate-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getLanguageIcon(selectedBlock.language)}</span>
                      <div>
                        <h4 className="font-medium text-white">
                          {selectedBlock.filename || `${selectedBlock.language} Code`}
                        </h4>
                        {selectedBlock.description && (
                          <p className="text-sm text-slate-400">{selectedBlock.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyCode(selectedBlock.code)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadCode(
                          selectedBlock.code, 
                          selectedBlock.filename || `code.${selectedBlock.language}`
                        )}
                        className="text-slate-400 hover:text-white"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      {onRunCode && (
                        <Button
                          size="sm"
                          onClick={() => handleRunCode(selectedBlock.code, selectedBlock.language)}
                          disabled={isRunning}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isRunning ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <pre className="p-4 text-sm text-slate-100 font-mono overflow-x-auto">
                    <code>{selectedBlock.code}</code>
                  </pre>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          <TabsContent value="blocks" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {codeBlocks.map((block) => (
                  <div
                    key={block.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedBlock?.id === block.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 bg-slate-800 hover:bg-slate-700'
                    }`}
                    onClick={() => setSelectedBlock(block)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span>{getLanguageIcon(block.language)}</span>
                        <span className="font-medium text-white">
                          {block.filename || `${block.language} Code`}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {block.language}
                      </Badge>
                    </div>
                    
                    {block.description && (
                      <p className="text-sm text-slate-400 mb-2">{block.description}</p>
                    )}
                    
                    <div className="text-xs text-slate-500">
                      {block.code.split('\n').length} lines • {block.code.length} chars
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
