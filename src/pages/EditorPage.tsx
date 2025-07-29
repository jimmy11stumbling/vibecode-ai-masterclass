import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileTree } from '@/components/FileTree';
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { realTimeAIAgent } from '@/services/realTimeAIAgent';
import { dynamicCodeModifier } from '@/services/dynamicCodeModifier';
import { Send, Play, Folder, File, Loader2, Eye } from 'lucide-react';
import { LivePreview } from '@/components/LivePreview';
import { useToast } from '@/hooks/use-toast';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;
}

interface StreamingStats {
  tokensReceived: number;
  responseTime: number;
  status: 'idle' | 'streaming' | 'complete' | 'error';
}

const EditorPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [streamingStats, setStreamingStats] = useState<StreamingStats>({
    tokensReceived: 0,
    responseTime: 0,
    status: 'idle'
  });
  
  const streamingRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { 
    files: projectFiles, 
    updateFileContent 
  } = useProjectFiles((updatedFiles) => {
    // Convert project files to FileNode format
    const convertToFileNodes = (files: any[]): FileNode[] => {
      return files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        path: file.path,
        children: file.children ? convertToFileNodes(file.children) : undefined,
        content: file.content
      }));
    };
    setFiles(convertToFileNodes(updatedFiles));
  });

  const handleSendPrompt = async () => {
    if (!prompt.trim() || isStreaming) return;

    setIsStreaming(true);
    setStreamingContent('');
    setStreamingStats({ tokensReceived: 0, responseTime: 0, status: 'streaming' });

    try {
      console.log('🚀 Starting AI code generation with prompt:', prompt);
      
      await realTimeAIAgent.streamCodeGeneration(
        prompt,
        (token: string) => {
          // Real-time token streaming
          setStreamingContent(prev => prev + token);
          if (streamingRef.current) {
            streamingRef.current.scrollTop = streamingRef.current.scrollHeight;
          }
        },
        (operation: { type: 'create' | 'update' | 'delete', path: string, content?: string }) => {
          // Real-time file operations
          console.log('📁 File operation:', operation);
          toast({
            title: `File ${operation.type}d`,
            description: operation.path,
            duration: 2000,
          });
          
          // Refresh file list immediately
          dynamicCodeModifier.getProjectStructure().then(structure => {
            const convertToFileNodes = (nodes: any[]): FileNode[] => {
              return nodes.map(node => ({
                id: node.path.replace(/[^a-zA-Z0-9]/g, '_'),
                name: node.path.split('/').pop() || node.path,
                type: node.type,
                path: node.path,
                children: node.children ? convertToFileNodes(node.children) : undefined,
                content: node.content || ''
              }));
            };
            setFiles(convertToFileNodes(structure));
          });
        },
        (stats: StreamingStats) => {
          setStreamingStats(stats);
        }
      );

      setStreamingStats(prev => ({ ...prev, status: 'complete' }));
      toast({
        title: "✅ Code generation complete!",
        description: "Your application has been generated successfully.",
      });

    } catch (error) {
      console.error('❌ Streaming error:', error);
      setStreamingStats(prev => ({ ...prev, status: 'error' }));
      toast({
        title: "❌ Generation failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
      setPrompt('');
    }
  };

  const handleFileSelect = async (file: FileNode) => {
    setSelectedFile(file);
    if (file.type === 'file') {
      try {
        const content = await dynamicCodeModifier.readFile(file.path);
        setFileContent(content);
      } catch (error) {
        console.error('Failed to read file:', error);
        setFileContent('// Error loading file content');
      }
    }
  };

  const handleContentChange = async (newContent: string) => {
    setFileContent(newContent);
    if (selectedFile && selectedFile.type === 'file') {
      try {
        await dynamicCodeModifier.updateFile(selectedFile.path, newContent);
        await updateFileContent(selectedFile.id, newContent);
      } catch (error) {
        console.error('Failed to update file:', error);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">🚀 AI Code Studio</h1>
            <Badge variant={isStreaming ? "default" : "secondary"}>
              {isStreaming ? "Generating..." : "Ready"}
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Tokens: {streamingStats.tokensReceived}</span>
            <span>Time: {Math.round(streamingStats.responseTime)}ms</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - File Explorer */}
        <div className="w-80 border-r bg-card">
          <div className="p-4 border-b">
            <h3 className="font-medium flex items-center space-x-2">
              <Folder className="h-4 w-4" />
              <span>Project Files</span>
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <FileTree 
              files={files} 
              onFileSelect={handleFileSelect}
              selectedFileId={selectedFile?.id}
            />
          </ScrollArea>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Left Panel - AI Chat & Code Editor */}
          <div className="flex-1 flex flex-col">
            {/* AI Chat & Streaming Response */}
            <div className="h-80 border-b flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-medium">AI Assistant</h3>
              </div>
              
              {/* Streaming Response Area */}
              <ScrollArea className="flex-1 p-4" ref={streamingRef}>
                {streamingContent && (
                  <div className="bg-muted rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                    {streamingContent}
                    {isStreaming && <span className="animate-pulse">|</span>}
                  </div>
                )}
                {!streamingContent && !isStreaming && (
                  <div className="text-center text-muted-foreground py-8">
                    <div className="text-4xl mb-2">🤖</div>
                    <p>Ask me to build anything!</p>
                    <p className="text-sm">E.g., "Create a todo app with React and TypeScript"</p>
                  </div>
                )}
              </ScrollArea>

              {/* Prompt Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you want to build..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendPrompt()}
                    disabled={isStreaming}
                  />
                  <Button 
                    onClick={handleSendPrompt} 
                    disabled={isStreaming || !prompt.trim()}
                  >
                    {isStreaming ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-medium flex items-center space-x-2">
                  <File className="h-4 w-4" />
                  <span>{selectedFile ? selectedFile.name : 'Select a file to edit'}</span>
                </h3>
              </div>
              
              {selectedFile && selectedFile.type === 'file' ? (
                <div className="flex-1 p-4">
                  <textarea
                    value={fileContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-full font-mono text-sm bg-background border rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="File content will appear here..."
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a file to start editing</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="w-96 border-l bg-card">
            <div className="p-4 border-b">
              <h3 className="font-medium flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Live Preview</span>
              </h3>
            </div>
            <div className="flex-1">
              <LivePreview files={files} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;