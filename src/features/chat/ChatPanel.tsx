import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';

/**
 * CHAT PANEL - Communication en jeu
 * 
 * TODO (Phase 2):
 * - Messages en temps réel (WebSocket/Supabase Realtime)
 * - Emojis quick-reply
 * - Messages prédéfinis (Bon jeu!, Bien joué!, etc.)
 * - Filtrage de contenu inapproprié
 * - Historique des messages
 * - Notifications de nouveaux messages
 * - Premium: Emojis personnalisés
 */

interface Message {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'emoji' | 'system';
}

export const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const quickReplies = ['👍', '👏', '🎉', '🤔', '😊', '🔥'];

  const sendMessage = () => {
    console.log('[CHAT] Send message:', inputText);
    // TODO: Envoyer via Supabase Realtime
    setInputText('');
  };

  const sendQuickReply = (emoji: string) => {
    console.log('[CHAT] Send emoji:', emoji);
    // TODO: Envoyer emoji
  };

  return (
    <Card className="flex flex-col h-[400px]">
      {/* Header */}
      <div className="p-3 border-b">
        <h3 className="font-bold text-sm">💬 Chat de partie</h3>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <p className="text-sm">Aucun message</p>
            <p className="text-xs mt-1">Commencez la conversation !</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-secondary/30 rounded p-2">
                <p className="text-xs font-semibold">{msg.username}</p>
                <p className="text-sm">{msg.text}</p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Quick Replies */}
      <div className="flex gap-1 px-3 py-2 border-t">
        {quickReplies.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            className="text-lg p-1 h-8 w-8"
            onClick={() => sendQuickReply(emoji)}
            disabled
          >
            {emoji}
          </Button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t">
        <Input
          placeholder="Message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          disabled
        />
        <Button 
          size="icon" 
          onClick={sendMessage}
          disabled
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground pb-2">
        Fonctionnalité en développement
      </p>
    </Card>
  );
};
