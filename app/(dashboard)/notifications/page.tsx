'use client';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { notificationApi } from '@/lib/api';
import {
  Bell, BellOff, CheckCheck, UserPlus, BookOpen,
  CreditCard, Megaphone, RefreshCw, MessageSquare
} from 'lucide-react';
import Link from 'next/link';

// Matches backend Notification model exactly
interface Notif {
  id: string;
  recipientId: string;
  senderId?: string;
  senderName?: string;
  senderType?: string;
  title?: string;
  body?: string;           // backend field is "body"
  type: string;            // CONNECTION_REQUEST | CONNECTION_ACCEPTED | NEW_MESSAGE | SYSTEM
  read: boolean;
  createdAt: number;       // backend stores as long (epoch ms)
  referenceId?: string;
}

function timeAgo(ms: number): string {
  if (!ms) return '';
  const diff = (Date.now() - ms) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function dayLabel(ms: number): string {
  const d = new Date(ms);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(Date.now() - 86400000);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

const typeConfig: Record<string, { icon: React.ReactNode; bg: string; actionLabel?: string; actionHref?: string }> = {
  CONNECTION_REQUEST: { icon: <UserPlus size={16} className="text-blue-600" />, bg: 'bg-blue-100', actionLabel: 'View Requests', actionHref: '/connections' },
  CONNECTION_ACCEPTED: { icon: <UserPlus size={16} className="text-green-600" />, bg: 'bg-green-100', actionLabel: 'View Network', actionHref: '/connections' },
  NEW_MESSAGE: { icon: <MessageSquare size={16} className="text-purple-600" />, bg: 'bg-purple-100', actionLabel: 'Open Chat', actionHref: '/chat' },
  SYSTEM: { icon: <Megaphone size={16} className="text-orange-600" />, bg: 'bg-orange-100' },
  COHORT: { icon: <BookOpen size={16} className="text-blue-600" />, bg: 'bg-blue-100', actionLabel: 'View Cohorts', actionHref: '/cohorts' },
  PAYMENT: { icon: <CreditCard size={16} className="text-green-600" />, bg: 'bg-green-100', actionLabel: 'View Plans', actionHref: '/payment' },
};

const getConfig = (type: string) => typeConfig[type] || { icon: <Bell size={16} className="text-gray-500" />, bg: 'bg-gray-100' };

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationApi.getAll();
      const data: Notif[] = Array.isArray(res.data) ? res.data : [];
      // Sort newest first
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setNotifs(data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError('Authentication error — please log in again.');
      } else if (status === 404) {
        setError('Notifications endpoint not found (404). Check backend is running.');
      } else {
        setError(`Failed to load notifications (${status || 'network error'})`);
      }
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err: any) {
      console.error('markRead failed:', err?.response?.status, err?.message);
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationApi.markAllRead();
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed to mark all as read'); }
    finally { setMarkingAll(false); }
  };

  const unreadCount = notifs.filter(n => !n.read).length;
  const displayed = filter === 'UNREAD' ? notifs.filter(n => !n.read) : notifs;

  // Group by day
  const grouped: { label: string; items: Notif[] }[] = [];
  displayed.forEach(n => {
    const label = dayLabel(n.createdAt || 0);
    const last = grouped[grouped.length - 1];
    if (last?.label === label) last.items.push(n);
    else grouped.push({ label, items: [n] });
  });

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{notifs.length} total · {unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} title="Refresh"
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <RefreshCw size={16} />
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead} disabled={markingAll}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60">
              {markingAll
                ? <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                : <CheckCheck size={13} />}
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1 w-fit">
        {(['ALL', 'UNREAD'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {f === 'ALL' ? `All (${notifs.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700 font-medium">⚠️ {error}</p>
          <button onClick={load} className="text-xs text-red-500 mt-1 hover:underline">Try again</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty states */}
      {!loading && !error && displayed.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-14 text-center">
          {filter === 'UNREAD' ? (
            <>
              <CheckCheck size={40} className="text-green-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">All caught up!</p>
              <p className="text-gray-400 text-sm mt-1">No unread notifications</p>
            </>
          ) : (
            <>
              <BellOff size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No notifications yet</p>
              <p className="text-gray-400 text-sm mt-1">
                You'll be notified about connections, cohorts, and messages here
              </p>
            </>
          )}
        </div>
      )}

      {/* Notification list */}
      {!loading && !error && grouped.length > 0 && (
        <div className="space-y-6">
          {grouped.map(({ label, items }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">{label}</p>
              <div className="space-y-2">
                {items.map(n => {
                  const cfg = getConfig(n.type);
                  return (
                    <div key={n.id}
                      onClick={() => !n.read && markRead(n.id)}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${
                        n.read
                          ? 'bg-white border-gray-100 hover:bg-gray-50'
                          : 'bg-blue-50/60 border-blue-100 hover:bg-blue-50'
                      }`}>
                      <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm text-gray-900 leading-snug">
                            {n.title || n.type.replace(/_/g, ' ')}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                            {!n.read && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                          </div>
                        </div>
                        {n.body && <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>}
                        {n.senderName && <p className="text-xs text-gray-400 mt-1">From: {n.senderName}</p>}
                        {cfg.actionHref && (
                          <Link href={cfg.actionHref} onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 font-medium hover:underline">
                            {cfg.actionLabel} →
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
