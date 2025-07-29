import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, File, FileText, Code, Palette } from 'lucide-react';

interface FileTab {
  id: string;
  name: string;
  path: string;
  isDirty?: boolean;
  language?: string;
}

interface FileTabsProps {
  tabs: FileTab[];
  activeTabId?: string | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  maxTabs?: number;
}

export const FileTabs: React.FC<FileTabsProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  maxTabs = 10
}) => {
  const getFileIcon = (fileName: string, language?: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'tsx':
      case 'jsx':
        return <Code className="h-3 w-3 text-cyan-500" />;
      case 'ts':
      case 'js':
        return <Code className="h-3 w-3 text-yellow-500" />;
      case 'css':
      case 'scss':
      case 'sass':
        return <Palette className="h-3 w-3 text-pink-500" />;
      case 'html':
        return <FileText className="h-3 w-3 text-orange-500" />;
      case 'json':
        return <File className="h-3 w-3 text-green-500" />;
      case 'md':
        return <FileText className="h-3 w-3 text-gray-500" />;
      default:
        return <File className="h-3 w-3 text-gray-400" />;
    }
  };

  const handleTabClick = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    onTabClick(tabId);
  };

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onTabClose(tabId);
  };

  const visibleTabs = tabs.slice(0, maxTabs);
  const hiddenTabsCount = Math.max(0, tabs.length - maxTabs);

  if (tabs.length === 0) {
    return (
      <div className="border-b bg-muted/20 px-4 py-2">
        <div className="text-sm text-muted-foreground">No files open</div>
      </div>
    );
  }

  return (
    <div className="border-b bg-background">
      <div className="flex items-center overflow-hidden">
        {/* File Tabs */}
        <div className="flex items-center flex-1 overflow-x-auto scrollbar-hide">
          {visibleTabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            
            return (
              <div
                key={tab.id}
                className={`
                  group flex items-center space-x-2 px-3 py-2 border-r border-border
                  cursor-pointer transition-colors hover:bg-muted/50
                  ${isActive 
                    ? 'bg-background border-b-2 border-b-primary' 
                    : 'bg-muted/20 hover:bg-muted/40'
                  }
                `}
                onClick={(e) => handleTabClick(e, tab.id)}
              >
                {getFileIcon(tab.name, tab.language)}
                
                <span className={`
                  text-sm truncate max-w-32
                  ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}
                `}>
                  {tab.name}
                </span>
                
                {tab.isDirty && (
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => handleTabClose(e, tab.id)}
                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Hidden Tabs Indicator */}
        {hiddenTabsCount > 0 && (
          <div className="px-3 py-2 border-l border-border">
            <Badge variant="secondary" className="text-xs">
              +{hiddenTabsCount} more
            </Badge>
          </div>
        )}

        {/* Tab Actions */}
        <div className="flex items-center px-2 border-l border-border">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              // Close all tabs
              tabs.forEach(tab => onTabClose(tab.id));
            }}
            className="h-6 text-xs text-muted-foreground hover:text-foreground"
          >
            Close All
          </Button>
        </div>
      </div>
    </div>
  );
};