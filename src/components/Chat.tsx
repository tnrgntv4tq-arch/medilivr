'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, ChevronDown } from 'lucide-react';
import { useChatSSE } from '@/hooks/useChatSSE';

interface ChatProps {
  orderId: string;
  currentUserId: string;
  enabled: boolean;
}

export default function Chat({ orderId, currentUserId, enabled }: ChatProps) {
  const { messages, isConnected, sendMessage } = useChatSSE(orderId);
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  const unread = messages.length - lastCountRef.current;

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      lastCountRef.current = messages.length;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const ok = await sendMessage(text.trim());
    if (ok) setText('');
    setSending(false);
  };

  if (!enabled) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); lastCountRef.current = messages.length; }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 transition-all hover:scale-105 active:scale-95"
      >
        <MessageCircle className="h-6 w-6" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[340px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-dark-100 flex flex-col overflow-hidden animate-fade-in" style={{ height: '460px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary-500 text-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold text-sm">Chat</span>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-300' : 'bg-red-300'}`} />
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-dark-50/30">
        {messages.length === 0 && (
          <div className="text-center py-8 text-dark-400">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Envoyez un message</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${isMine ? 'order-2' : ''}`}>
                {!isMine && (
                  <p className="text-[10px] text-dark-400 mb-0.5 px-1">
                    {msg.sender.name}
                  </p>
                )}
                <div className={`px-3 py-2 rounded-2xl text-sm ${
                  isMine
                    ? 'bg-primary-500 text-white rounded-br-md'
                    : 'bg-white text-dark-800 border border-dark-100 rounded-bl-md'
                }`}>
                  {msg.text}
                </div>
                <p className={`text-[10px] text-dark-300 mt-0.5 px-1 ${isMine ? 'text-right' : ''}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-dark-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Votre message..."
            maxLength={500}
            className="flex-1 px-3 py-2.5 bg-dark-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-200 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center hover:bg-primary-600 disabled:opacity-40 disabled:hover:bg-primary-500 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
