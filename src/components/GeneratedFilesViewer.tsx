
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Copy, 
  CheckCircle,
  Code,
  Sparkles
} from 'lucide-react';
import { deepSeekAgentCore } from '@/services/deepSeekAgentCore';
import { useToast } from '@/hooks/use-toast';

interface GeneratedFile {
  path: string;
  content: string;
  operation: 'create' | 'update' | 'delete';
}

export const GeneratedFilesViewer: React.FC = () => {
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadGeneratedFiles();
  }, []);

  const loadGeneratedFiles = async () => {
    try {
      setIsLoading(true);
      const generatedFiles = await deepSeekAgentCore.getGeneratedFiles();
      setFiles(generatedFiles);
      if (generatedFiles.length > 0) {
        setSelectedFile(generatedFiles[0]);
      }
    } catch (error) {
      console.error('Failed to load generated files:', error);
      toast({
        title: "Error",
        description: "Failed to load generated files",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied",
        description: "Code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to copy code",
        variant: "destructive"
      });
    }
  };

  const downloadFile = (file: GeneratedFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'file.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="h-full bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading generated files...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="h-full bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center">
        <div className="text-center py-12">
          <Code className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No files generated yet</p>
          <p className="text-sm text-slate-500">Create an application to see generated files</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-green-400" />
              Generated Files
            </h2>
            <p className="text-sm text-slate-400">View and download your AI-generated code</p>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            {files.length} Files
          </Badge>
        </div>
      </div>

      <div className="flex h-full">
        {/* File List */}
        <div className="w-1/3 border-r border-slate-700">
          <div className="p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Files</h3>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedFile === file
                        ? 'bg-blue-500/20 border-blue-500/30'
                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white truncate">
                        {file.path.split('/').pop()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 truncate">
                      {file.path}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* File Viewer */}
        <div className="flex-1 flex flex-col">
          {selectedFile && (
            <>
              {/* File Header */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {selectedFile.path.split('/').pop()}
                    </h3>
                    <p className="text-sm text-slate-400">{selectedFile.path}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedFile.content)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(selectedFile)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              {/* File Content */}
              <ScrollArea className="flex-1 p-4">
                <pre className="text-sm text-slate-300 bg-slate-800 rounded-lg p-4 overflow-x-auto">
                  <code>{selectedFile.content}</code>
                </pre>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
