
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Play, 
  Download, 
  Copy,
  Eye,
  Code,
  Folder
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedFile {
  path: string;
  content: string;
  type: 'typescript' | 'css' | 'json' | 'html';
}

interface GeneratedAppViewerProps {
  files: GeneratedFile[];
  appName: string;
  onRunApp?: () => void;
}

export const GeneratedAppViewer: React.FC<GeneratedAppViewerProps> = ({
  files,
  appName,
  onRunApp
}) => {
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(files[0] || null);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const { toast } = useToast();

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Code copied to clipboard",
    });
  };

  const downloadFile = (file: GeneratedFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'generated-file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = () => {
    files.forEach(file => downloadFile(file));
    toast({
      title: "Download Started",
      description: `Downloading ${files.length} files`,
    });
  };

  const getFileIcon = (file: GeneratedFile) => {
    const ext = file.path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx':
      case 'ts':
        return <Code className="w-4 h-4 text-blue-400" />;
      case 'css':
        return <FileText className="w-4 h-4 text-green-400" />;
      case 'json':
        return <FileText className="w-4 h-4 text-yellow-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  if (files.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-8 text-center">
          <Folder className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">No app files generated yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full bg-slate-900 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{appName}</h2>
            <p className="text-sm text-slate-400">{files.length} files generated</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRunApp}
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            >
              <Play className="w-4 h-4 mr-2" />
              Run App
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadAllFiles}
              className="border-slate-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100%-80px)]">
        {/* File List */}
        <div className="w-1/3 border-r border-slate-700">
          <div className="p-3 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-white">Project Files</h3>
          </div>
          
          <ScrollArea className="h-full">
            <div className="p-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center p-2 rounded cursor-pointer hover:bg-slate-800 ${
                    selectedFile === file ? 'bg-slate-700' : ''
                  }`}
                  onClick={() => setSelectedFile(file)}
                >
                  {getFileIcon(file)}
                  <span className="ml-2 text-sm text-white truncate">
                    {file.path.split('/').pop()}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* File Content */}
        <div className="flex-1">
          {selectedFile ? (
            <div className="h-full flex flex-col">
              <div className="p-3 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(selectedFile)}
                    <span className="text-sm font-medium text-white">
                      {selectedFile.path}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'code' | 'preview')}>
                      <TabsList className="bg-slate-800">
                        <TabsTrigger value="code" className="text-xs">
                          <Code className="w-3 h-3 mr-1" />
                          Code
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedFile.content)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(selectedFile)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <Tabs value={viewMode} className="flex-1">
                <TabsContent value="code" className="h-full m-0">
                  <ScrollArea className="h-full">
                    <pre className="p-4 text-sm text-slate-200 bg-slate-950 overflow-auto">
                      <code>{selectedFile.content}</code>
                    </pre>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="preview" className="h-full m-0">
                  <div className="h-full bg-white">
                    {selectedFile.path.endsWith('.tsx') || selectedFile.path.endsWith('.jsx') ? (
                      <iframe
                        srcDoc={`
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                              <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                              <script src="https://cdn.tailwindcss.com"></script>
                            </head>
                            <body>
                              <div id="root"></div>
                              <script type="text/babel">
                                ${selectedFile.content}
                                const root = ReactDOM.createRoot(document.getElementById('root'));
                                try {
                                  root.render(React.createElement(App || (() => React.createElement('div', null, 'Component loaded'))));
                                } catch (error) {
                                  document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">' + error.toString() + '</div>';
                                }
                              </script>
                            </body>
                          </html>
                        `}
                        className="w-full h-full border-none"
                        title="Component Preview"
                      />
                    ) : (
                      <div className="p-4 text-center text-slate-500">
                        Preview not available for this file type
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">Select a file to view its content</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
