import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already running standalone or user dismissed, don't show
  if (isInstalled || dismissed) {
    return null;
  }

  // If not installable and not iOS, hide
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <div className="bg-[#1E201E] text-white px-4 py-2.5 flex items-center justify-between gap-3 text-xs border-b border-[#374151]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#84CC16]/20 border border-[#84CC16]/40 flex items-center justify-center text-[#A3E635] shrink-0">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <span className="font-semibold text-white">Установите базу на устройство:</span>{' '}
            <span className="text-[#9CA3AF] hidden sm:inline">
              работает оффлайн, быстрый доступ с рабочего стола и телефона
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isInstallable && (
            <button
              onClick={install}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#84CC16] hover:bg-[#65A30D] text-[#1E201E] font-bold rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Установить</span>
            </button>
          )}

          {isIOS && (
            <button
              onClick={() => setShowIOSModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#84CC16] hover:bg-[#65A30D] text-[#1E201E] font-bold rounded-lg transition-colors shadow-xs"
            >
              <Share className="w-3.5 h-3.5" />
              <span>На экран «Домой»</span>
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-[#9CA3AF] hover:text-white rounded-md transition-colors"
            title="Скрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Installation Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1E201E] font-['Manrope']">
                Установка на iPhone
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#4B5563] leading-relaxed">
              Чтобы использовать приложение как нативную программу на iPhone:
            </p>

            <div className="space-y-2.5 text-xs text-[#1E201E]">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="w-6 h-6 rounded-full bg-[#1E201E] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  В Safari нажмите кнопку <strong>«Поделиться»</strong>{' '}
                  <Share className="w-3.5 h-3.5 inline text-[#2563EB]" /> внизу экрана.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="w-6 h-6 rounded-full bg-[#1E201E] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  Прокрутите список вниз и выберите{' '}
                  <strong className="text-[#15803D]">«На экран «Домой»»</strong>{' '}
                  <PlusSquare className="w-3.5 h-3.5 inline text-[#65A30D]" />.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="w-6 h-6 rounded-full bg-[#1E201E] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  3
                </div>
                <div>
                  Нажмите <strong>«Добавить»</strong> в правом верхнем углу. Готово!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-[#84CC16] hover:bg-[#65A30D] text-[#1E201E] font-bold rounded-xl text-xs transition-colors"
            >
              Всё понятно
            </button>
          </div>
        </div>
      )}
    </>
  );
};
