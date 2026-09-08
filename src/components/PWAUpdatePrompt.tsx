import React, { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, Check, DownloadCloud, ArrowUpCircle } from 'lucide-react';
// @ts-ignore virtual module provided by vite-plugin-pwa
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PWAUpdatePrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      if (r) {
        // Automatically check for updates every 20 minutes and on tab focus
        const interval = setInterval(() => {
          r.update().catch(console.error);
        }, 20 * 60 * 1000);
        return () => clearInterval(interval);
      }
    },
    onRegisterError(error: unknown) {
      console.error('SW registration error', error);
    },
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [manualChecked, setManualChecked] = useState(false);

  // Also check for service worker update when the user switches back to the app on mobile/desktop
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.update().catch(console.error);
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateServiceWorker(true);
    } catch {
      window.location.reload();
    }
  };

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in slide-in-from-top-4 duration-200">
      <div className="bg-[#1E201E] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-lime-500/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#84CC16] text-[#1E201E] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
              <span>Доступно обновление базы</span>
              <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-ping" />
            </div>
            <p className="text-[11px] text-gray-300 truncate">
              Нажмите «Обновить» для загрузки свежих правок
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="px-3 py-1.5 bg-[#84CC16] hover:bg-[#65A30D] active:bg-[#4D7C0F] text-[#1E201E] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'Загрузка...' : 'Обновить'}</span>
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg text-xs"
            title="Позже"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
