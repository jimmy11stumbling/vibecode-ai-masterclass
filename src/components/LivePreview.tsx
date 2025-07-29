import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { dynamicCodeModifier } from '@/services/dynamicCodeModifier';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;
}

interface LivePreviewProps {
  files: FileNode[];
}

export const LivePreview: React.FC<LivePreviewProps> = ({ files }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const hasHtmlFile = files.some(file => 
    file.type === 'file' && file.name.toLowerCase().endsWith('.html')
  );

  const generatePreview = async () => {
    if (!hasHtmlFile) return;

    setIsLoading(true);
    setError(null);

    try {
      // Find index.html or the first HTML file
      const htmlFile = files.find(file => 
        file.name.toLowerCase() === 'index.html'
      ) || files.find(file => 
        file.type === 'file' && file.name.toLowerCase().endsWith('.html')
      );

      if (!htmlFile) {
        throw new Error('No HTML file found');
      }

      // Get the HTML content
      const htmlContent = await dynamicCodeModifier.readFile(htmlFile.path);
      
      if (!htmlContent) {
        throw new Error('HTML file is empty');
      }

      // Create a blob URL for the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      // Load the content in the iframe
      if (iframeRef.current) {
        iframeRef.current.src = url;
      }

    } catch (err) {
      console.error('Preview generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPreview = () => {
    generatePreview();
  };

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  useEffect(() => {
    generatePreview();
    
    // Cleanup blob URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [files]);

  if (!hasHtmlFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Preview Available</h3>
        <p className="text-muted-foreground">
          Create an HTML file to see a live preview of your application.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium">Live Preview</h3>
          <Badge variant={error ? "destructive" : isLoading ? "secondary" : "default"}>
            {error ? "Error" : isLoading ? "Loading..." : "Ready"}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={refreshPreview}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={openInNewTab}
            disabled={!previewUrl || isLoading}
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Preview Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refreshPreview} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Live Preview"
          />
        )}
      </div>
    </div>
  );
};