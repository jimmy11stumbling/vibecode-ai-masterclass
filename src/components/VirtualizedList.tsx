
import React, { useRef, useMemo } from 'react';
import { useVirtualScroll } from '@/hooks/usePerformanceOptimization';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = ''
}: VirtualizedListProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const virtualScroll = useVirtualScroll(items, {
    itemHeight,
    containerHeight,
    overscan
  });

  const virtualItems = useMemo(() => {
    return virtualScroll.visibleItems.map((item, index) => {
      const actualIndex = virtualScroll.startIndex + index;
      return {
        item,
        index: actualIndex,
        offsetY: actualIndex * itemHeight
      };
    });
  }, [virtualScroll.visibleItems, virtualScroll.startIndex, itemHeight]);

  return (
    <ScrollArea 
      className={`relative ${className}`}
      style={{ height: containerHeight }}
      onScroll={virtualScroll.handleScroll}
      ref={scrollRef}
    >
      <div
        style={{
          height: virtualScroll.totalHeight,
          position: 'relative'
        }}
      >
        {virtualItems.map(({ item, index, offsetY }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: offsetY,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// Specialized components for common use cases
export const VirtualizedMessageList: React.FC<{
  messages: any[];
  onMessageSelect?: (message: any) => void;
}> = ({ messages, onMessageSelect }) => {
  return (
    <VirtualizedList
      items={messages}
      itemHeight={80}
      containerHeight={400}
      renderItem={(message, index) => (
        <div
          key={message.id || index}
          className="p-3 border-b border-slate-700 hover:bg-slate-800 cursor-pointer"
          onClick={() => onMessageSelect?.(message)}
        >
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
              {message.sender?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {message.sender || 'Assistant'}
              </p>
              <p className="text-slate-400 text-sm truncate">
                {message.content || message.text}
              </p>
            </div>
            <span className="text-xs text-slate-500">
              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
            </span>
          </div>
        </div>
      )}
    />
  );
};

export const VirtualizedFileList: React.FC<{
  files: any[];
  onFileSelect?: (file: any) => void;
}> = ({ files, onFileSelect }) => {
  return (
    <VirtualizedList
      items={files}
      itemHeight={48}
      containerHeight={300}
      renderItem={(file, index) => (
        <div
          key={file.id || index}
          className="flex items-center space-x-3 p-2 hover:bg-slate-800 cursor-pointer"
          onClick={() => onFileSelect?.(file)}
        >
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-white text-sm truncate">
            {file.name || file.path}
          </span>
          <span className="text-slate-400 text-xs ml-auto">
            {file.size ? `${Math.round(file.size / 1024)}KB` : ''}
          </span>
        </div>
      )}
    />
  );
};
