'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

export function useChatSSE(orderId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const retriesRef = useRef(0);

  const connect = useCallback(() => {
    esRef.current?.close();

    const es = new EventSource(`/api/messages/${orderId}/stream`);
    esRef.current = es;

    es.onopen = () => {
      retriesRef.current = 0;
      setIsConnected(true);
    };

    es.onmessage = (event) => {
      try {
        const { messages: msgs } = JSON.parse(event.data);
        setMessages(msgs);
      } catch {}
    };

    es.onerror = () => {
      es.close();
      setIsConnected(false);
      if (retriesRef.current < 30) {
        retriesRef.current++;
        setTimeout(connect, Math.min(1000 * Math.pow(1.5, retriesRef.current), 10000));
      }
    };
  }, [orderId]);

  useEffect(() => {
    connect();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') connect();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [connect]);

  const sendMessage = useCallback(async (text: string) => {
    const res = await fetch(`/api/messages/${orderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const { message } = await res.json();
      setMessages(prev => [...prev, message]);
    }
    return res.ok;
  }, [orderId]);

  return { messages, isConnected, sendMessage };
}
