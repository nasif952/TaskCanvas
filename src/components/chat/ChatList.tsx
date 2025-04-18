import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as IChatMessage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import ChatMessage from './ChatMessage';
import { Card, CardContent } from '@/components/ui/card';

interface ChatListProps {
  projectId: string;
  messages: IChatMessage[];
  loading: boolean;
}

const ChatList: React.FC<ChatListProps> = ({ projectId, messages, loading }) => {
  const { sendMessage } = useProject();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;
    
    try {
      setIsSending(true);
      await sendMessage(projectId, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold">Chat</h3>
      </div>

      <div className="flex flex-col h-[60vh]">
        <Card className="flex-grow overflow-y-auto mb-4">
          <CardContent className="p-4">
            {loading ? (
              <div className="flex flex-col space-y-4 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-2 animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-muted"></div>
                    <div className="space-y-2 flex-grow">
                      <div className="h-4 w-24 bg-muted rounded"></div>
                      <div className="h-12 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-lg font-medium">No messages yet.</p>
                <p className="text-muted-foreground">Start the conversation by sending a message.</p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>
        </Card>
        
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            disabled={isSending}
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={isSending || !messageText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatList; 