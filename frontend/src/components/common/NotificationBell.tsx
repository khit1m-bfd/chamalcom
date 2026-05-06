'use client';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notificationApi } from '@/lib/api';
import type { Notification } from '@/types/api.types';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.list().then((r) => r.data),
    refetchInterval: 30000,
    retry: false,
  });

  const marquerLue = useMutation({
    mutationFn: (id: number) => notificationApi.marquerLue(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const marquerToutes = useMutation({
    mutationFn: () => notificationApi.marquerToutesLues(),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Fermer en cliquant dehors
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const notifications = (data?.data ?? []) as Notification[];
  const unread = data?.unread ?? 0;

  function handleClick(n: Notification) {
    void marquerLue.mutate(n.id);
    setOpen(false);
    if (n.lien) router.push(n.lien);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `${mins} د`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} س`;
    return `${Math.floor(hrs / 24)} ي`;
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-8 h-8 flex items-center justify-center hover:text-gold transition-colors"
        aria-label="الإشعارات"
      >
        <span className="text-xl">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-1 -end-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-10 w-80 bg-white rounded-2xl shadow-modal border border-sand-dark z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-sand-dark bg-sand">
            <span className="font-bold text-primary text-sm">الإشعارات</span>
            {unread > 0 && (
              <button
                onClick={() => marquerToutes.mutate()}
                className="text-xs text-primary-mid hover:underline"
              >
                قراءة الكل
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-sand-dark">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">🔕</p>
                <p className="text-sm">لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-start px-4 py-3 hover:bg-sand/60 transition-colors ${!n.lu ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.lu ? 'bg-primary' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium text-primary line-clamp-1 ${!n.lu ? 'font-bold' : ''}`}>
                        {n.titre}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
