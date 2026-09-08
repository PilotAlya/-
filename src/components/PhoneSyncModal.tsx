import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Smartphone, Copy, Check, Share2, ExternalLink, QrCode, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PhoneSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhoneSyncModal: React.FC<PhoneSyncModalProps> = ({ isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'pc'>('ios');
  const { isInstallable, install, isInstalled } = usePWAInstall();

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (isOpen && currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 260,
        margin: 1.5,
        color: {
          dark: '#1E201E',
          light: '#FFFFFF'
        }
      })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in overflow-y-auto"
      style={{
        paddingTop: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
        paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))'
      }}
    >
      <div className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#84CC16]/20 flex items-center justify-center text-[#4D7C0F]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1E201E] font-['Manrope']">
                Открыть на телефоне и установить
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                Полноэкранный режим без рамок браузера и работа офлайн
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#E5E7EB] hover:bg-[#D1D5DB] flex items-center justify-center text-[#4B5563] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Direct Install Button if browser supports beforeinstallprompt */}
          {isInstallable && !isInstalled && (
            <div className="p-3.5 rounded-2xl bg-[#F7FEE7] border border-[#A3E635] flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-[#15803D] flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5" /> Установка в 1 клик на это устройство
                </div>
                <p className="text-[11px] text-[#3F6212] mt-0.5">
                  Браузер готов установить приложение на рабочий стол
                </p>
              </div>
              <button
                onClick={install}
                className="px-3.5 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-[#1E201E] font-bold text-xs rounded-xl transition-colors shrink-0 shadow-xs"
              >
                Установить
              </button>
            </div>
          )}

          {/* QR Code Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <div className="w-36 h-36 bg-white p-2 rounded-xl border border-[#E5E7EB] shadow-2xs shrink-0 flex items-center justify-center">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR-код для смартфона" className="w-full h-full object-contain" />
              ) : (
                <QrCode className="w-12 h-12 text-[#9CA3AF] animate-pulse" />
              )}
            </div>
            <div className="space-y-2 text-center sm:text-left flex-1">
              <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#1E201E] text-white">
                Быстрый вход
              </span>
              <h4 className="text-xs font-bold text-[#1E201E]">
                Наведите камеру смартфона на QR-код
              </h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Ссылка откроется в браузере телефона. Затем добавьте приложение на экран «Домой».
              </p>
              <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E5E7EB] hover:bg-[#F3F4F6] rounded-xl text-[11px] font-semibold text-[#1E201E] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
                </button>
              </div>
            </div>
          </div>

          {/* Instructions Tabs for iOS / Android / Desktop */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#1E201E]">Как закрепить на экране:</span>
              <div className="p-1 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] flex items-center text-[11px] font-semibold">
                <button
                  onClick={() => setActiveTab('ios')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeTab === 'ios' ? 'bg-[#1E201E] text-white' : 'text-[#6B7280]'
                  }`}
                >
                  iPhone (iOS)
                </button>
                <button
                  onClick={() => setActiveTab('android')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeTab === 'android' ? 'bg-[#1E201E] text-white' : 'text-[#6B7280]'
                  }`}
                >
                  Android
                </button>
                <button
                  onClick={() => setActiveTab('pc')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeTab === 'pc' ? 'bg-[#1E201E] text-white' : 'text-[#6B7280]'
                  }`}
                >
                  ПК / Windows
                </button>
              </div>
            </div>

            {activeTab === 'ios' && (
              <div className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2 text-[11px] text-[#4B5563]">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#E5E7EB] text-[#1E201E] font-bold flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </span>
                  <span>Откройте ссылку в браузере <strong>Safari</strong> на iPhone.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#E5E7EB] text-[#1E201E] font-bold flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </span>
                  <span>Нажмите кнопку «Поделиться» <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-[#2563EB]" /> (квадрат со стрелкой вверх внизу экрана).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#E5E7EB] text-[#1E201E] font-bold flex items-center justify-center shrink-0 text-[10px]">
                    3
                  </span>
                  <span>Пролистайте вниз и выберите пункт <strong>«На экран «Домой»»</strong> (+).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#E5E7EB] text-[#1E201E] font-bold flex items-center justify-center shrink-0 text-[10px]">
                    4
                  </span>
                  <span>Нажмите «Добавить». Иконка базы «АВ» появится на рабочем столе телефона!</span>
                </div>
              </div>
            )}

            {/* Sync & Auto-Update Tip */}
            <div className="p-3 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-start gap-2.5 text-[11px] text-[#065F46]">
              <Sparkles className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#047857]">Удалять приложение больше не нужно!</span>
                <p className="text-[10px] text-[#065F46] mt-0.5 leading-relaxed">
                  При выходе новых правок или регламентов вверху появится кнопка <strong>«Обновить»</strong>. Нажмите её, или просто закройте ярлык и откройте заново при наличии интернета — свежие данные подгрузятся сами.
                </p>
              </div>
            </div>

            {activeTab === 'android' && (
              <div className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2 text-[11px] text-[#4B5563]">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#E5E7EB] text-[#1E201E] font-bold flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </span>
                  <span>Откройте ссылку в браузере <strong>Google Chrome</strong> или <strong>Яндекс</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#E5E7EB] text-[#1E201E] font-bold flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </span>
                  <span>Нажмите меню (три точки <strong>⋮</strong> в правом верхнем углу).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#E5E7EB] text-[#1E201E] font-bold flex items-center justify-center shrink-0 text-[10px]">
                    3
                  </span>
                  <span>Выберите <strong>«Установить приложение»</strong> или «Добавить на главный экран».</span>
                </div>
              </div>
            )}

            {activeTab === 'pc' && (
              <div className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2 text-[11px] text-[#4B5563]">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#E5E7EB] text-[#1E201E] font-bold flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </span>
                  <span>В Chrome или Яндекс Браузере в адресной строке справа нажмите значок <strong>«Установить приложение»</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#E5E7EB] text-[#1E201E] font-bold flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </span>
                  <span>База откроется в отдельном ультра-быстром окне без лишних вкладок и рамок, её можно закрепить на панели задач Windows рядом с VDI и «Ирис»!</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1E201E] text-white text-xs font-semibold rounded-xl hover:bg-[#374151] transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
