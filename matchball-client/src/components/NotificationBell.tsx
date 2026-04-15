import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationsApi, invitationsApi } from '../services/api';
import type { Notification } from '../types';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const pollRef = useRef<number | null>(null);

  const load = async () => {
    try {
      const [list, count] = await Promise.all([
        notificationsApi.getAll(),
        notificationsApi.unreadCount(),
      ]);
      setNotifications(list.data);
      setUnread(count.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    load();
    pollRef.current = window.setInterval(load, 15000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) load();
  };

  const handleAct = async (n: Notification, action: 'accept' | 'reject') => {
    if (!n.relatedEntityId) return;
    try {
      if (action === 'accept') await invitationsApi.accept(n.relatedEntityId);
      else await invitationsApi.reject(n.relatedEntityId);
      await notificationsApi.markRead(n.id);
      load();
    } catch {
      alert('Failed to respond');
    }
  };

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id);
    load();
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.17V11a6 6 0 1 0-12 0v3.17a2 2 0 0 1-.6 1.43L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={async () => { await notificationsApi.markAllRead(); load(); }}
                className="text-xs text-emerald-600 hover:underline"
              >
                Mark all read
              </button>
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-sm text-gray-500 text-center">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b border-gray-50 ${!n.read ? 'bg-emerald-50/50' : ''}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    {!n.read && (
                      <button onClick={() => handleMarkRead(n.id)} className="text-[10px] text-gray-400 hover:text-gray-600">
                        mark read
                      </button>
                    )}
                  </div>
                  {n.type === 'InvitationReceived' && n.relatedEntityId && (
                    <div className="mt-2 flex gap-2">
                      <Link
                        to={`/invitations/${n.relatedEntityId}`}
                        onClick={() => setOpen(false)}
                        className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        View details
                      </Link>
                      <button
                        onClick={() => handleAct(n, 'accept')}
                        className="text-xs px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleAct(n, 'reject')}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
