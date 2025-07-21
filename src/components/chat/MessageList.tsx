
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code } from 'lucide-react';
import { MessageItem } from './MessageItem';
import { Message } from './types';

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
