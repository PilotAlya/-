import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Smartphone, ArrowRight, Share, PlusSquare, Sparkles } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // App production preview URL from AI Studio environment
  const targetUrl =
    typeof window !== 'undefined' && window.location.origin.includes('run.app')
      ? window.location.href
      : 'https://ais-pre-tx4jrwlzjq3752rfo25fjn-837635296805.europe-west2.run.app';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(targetUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#1E201E',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen, targetUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#84CC16]/20 flex items-center justify-center text-[#65A30D]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E201E] font-['Manrope']">
                Открыть на телефоне
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                Сканируйте QR-код камерой смартфона
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-center">
          {/* QR Code image */}
          <div className="inline-block p-4 bg-white rounded-2xl border-2 border-[#84CC16]/30 shadow-md">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code for mobile"
                className="w-56 h-56 mx-auto rounded-lg"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-[#9CA3AF]">
                Генерация QR...
              </div>
            )}
          </div>

          {/* Copy Link Button */}
          <div className="flex items-center gap-2 max-w-sm mx-auto">
            <input
              type="text"
              readOnly
              value={targetUrl}
              className="flex-1 px-3 py-2 text-[11px] font-mono bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#4B5563] truncate outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-3 py-2 bg-[#1E201E] hover:bg-[#374151] text-white rounded-xl text-xs font-semibold shrink-0 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#84CC16]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Скопировано' : 'Копировать'}</span>
            </button>
          </div>

          {/* Step by Step Instructions */}
          <div className="text-left bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E201E]">
              <Sparkles className="w-3.5 h-3.5 text-[#84CC16]" />
              <span>Как установить на экран телефона:</span>
            </div>

            <div className="space-y-2 text-[11px] text-[#4B5563]">
              <div className="p-2 bg-white rounded-xl border border-[#E5E7EB] space-y-1">
                <div className="font-bold text-[#1E201E] flex items-center gap-1">
                  <span>🍏 На iPhone (Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-0.5 pl-1 leading-relaxed">
                  <li>Откройте ссылку в Safari</li>
                  <li>
                    Нажмите кнопку «Поделиться» <Share className="w-3 h-3 inline text-[#2563EB]" /> внизу экрана
                  </li>
                  <li>
                    Выберите <strong className="text-[#1E201E]">«На экран «Домой»»</strong> <PlusSquare className="w-3 h-3 inline text-[#65A30D]" />
                  </li>
                  <li>Приложение появится как отдельная иконка на рабочем столе!</li>
                </ol>
              </div>

              <div className="p-2 bg-white rounded-xl border border-[#E5E7EB] space-y-1">
                <div className="font-bold text-[#1E201E]">
                  🤖 На Android (Chrome / Яндекс):
                </div>
                <p className="leading-relaxed pl-1">
                  В меню браузера (три точки) нажмите <strong className="text-[#1E201E]">«Установить приложение»</strong> или нажмите зеленую кнопку установки внизу сайта.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#1E201E] bg-[#E5E7EB] hover:bg-[#D1D5DB] rounded-xl transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
