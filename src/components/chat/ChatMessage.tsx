import React, { useState, useEffect } from 'react';
import { ChatMessage as IChatMessage } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';

interface ChatMessageProps {
  message: IChatMessage;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { user } = useAuth();
  const isCurrentUser = user?.id === message.created_by;
  const [displayName, setDisplayName] = useState<string>(isCurrentUser ? 'You' : 'User');
  
  // Fetch user display name if available
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (message.created_by && !isCurrentUser) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', message.created_by)
            .single();
            
          if (data && !error) {
            setDisplayName(data.display_name || data.email || 'User');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    
    fetchUserProfile();
  }, [message.created_by, isCurrentUser]);
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name || name === 'You' || name === 'User') return name.substring(0, 1).toUpperCase();
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={`flex items-start gap-2 mb-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 mt-0.5">
        <AvatarFallback className={isCurrentUser ? 'bg-primary/20' : 'bg-muted'}>
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>
      <div className={`max-w-[80%] ${isCurrentUser ? 'text-right' : 'text-left'}`}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`text-sm font-medium ${isCurrentUser ? 'ml-auto' : ''}`}>
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>
        <div 
          className={`px-3 py-2 rounded-lg ${
            isCurrentUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-foreground'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 