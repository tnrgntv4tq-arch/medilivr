'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, CheckCheck, Package, CreditCard, MessageCircle, Truck, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  orderId: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  order_created: <Package className="h-4 w-4 text-primary-500" />,
  status_change: <Truck className="h-4 w-4 text-blue-500" />,
  payment: <CreditCard className="h-4 w-4 text-emerald-500" />,
  new_message: <MessageCircle className="h-4 w-4 text-amber-500" />,
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  return `Il y a ${Math.floor(hrs / 24)}j`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastNotifIdRef = useRef<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);

      if (data.notifications.length > 0 && permissionGranted) {
        const latest = data.notifications[0];
        if (!latest.read && latest.id !== lastNotifIdRef.current) {
          lastNotifIdRef.current = latest.id;
          try {
            new window.Notification(latest.title, {
              body: latest.body,
              icon: '/icon-192.png',
              tag: latest.id,
            });
          } catch {}
        }
      }
    } catch {}
  }, [permissionGranted]);

  useEffect(() => {
    if ('Notification' in window) {
      if (window.Notification.permission === 'granted') {
        setPermissionGranted(true);
      } else if (window.Notification.permission !== 'denied') {
        window.Notification.requestPermission().then(p => setPermissionGranted(p === 'granted'));
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readAll: true }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 bg-white rounded-xl border border-dark-100 flex items-center justify-center text-dark-400 hover:text-dark-600 hover:border-dark-200 transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center animate-pulse-soft">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-dark-100 overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-50">
            <span className="font-bold text-dark-900 text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary-500 font-medium hover:underline flex items-center gap-1">
                <CheckCheck className="h-3 w-3" /> Tout lire
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-dark-400">
                <Bell className="h-6 w-6 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Aucune notification</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.read) markRead(n.id);
                    if (n.orderId) {
                      window.location.href = n.type === 'order_created'
                        ? `/pharmacy/order/${n.orderId}`
                        : `/client/track/${n.orderId}`;
                    }
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-dark-50/50 transition-colors border-b border-dark-50/50 last:border-0 ${
                    n.read ? 'opacity-60' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-dark-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {TYPE_ICONS[n.type] || <Bell className="h-4 w-4 text-dark-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark-900 truncate">{n.title}</p>
                    <p className="text-xs text-dark-500 truncate">{n.body}</p>
                    <p className="text-[10px] text-dark-300 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
