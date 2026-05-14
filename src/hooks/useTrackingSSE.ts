'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface TrackingData {
  deliveryLat: number | null;
  deliveryLng: number | null;
  status: string | null;
  delivery: { name: string; phone: string } | null;
  isConnected: boolean;
}

export function useTrackingSSE(orderId: string): TrackingData {
  const [data, setData] = useState<TrackingData>({
    deliveryLat: null,
    deliveryLng: null,
    status: null,
    delivery: null,
    isConnected: false,
  });

  const esRef = useRef<EventSource | null>(null);
  const retriesRef = useRef(0);
  const maxRetries = 50;

  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
    }

    const es = new EventSource(`/api/tracking/${orderId}/stream`);
    esRef.current = es;

    es.onopen = () => {
      retriesRef.current = 0;
      setData(prev => ({ ...prev, isConnected: true }));
    };

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData({
          deliveryLat: parsed.deliveryLat,
          deliveryLng: parsed.deliveryLng,
          status: parsed.status,
          delivery: parsed.delivery,
          isConnected: true,
        });
      } catch {}
    };

    es.onerror = () => {
      es.close();
      setData(prev => ({ ...prev, isConnected: false }));

      if (retriesRef.current < maxRetries) {
        retriesRef.current++;
        const delay = Math.min(1000 * Math.pow(1.5, retriesRef.current), 10000);
        setTimeout(connect, delay);
      }
    };
  }, [orderId]);

  useEffect(() => {
    connect();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !esRef.current) {
        connect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [connect]);

  return data;
}
