import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { X, Download, Upload, Copy, Check, AlertCircle } from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({ isOpen, onClose }) => {
  const { exportDatabaseJson, importDatabaseJson } = useDatabase();
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const jsonDump = exportDatabaseJson();

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonDump);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonDump], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurelia-support-database-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const ok = importDatabaseJson(importText);
    if (ok) {
      setStatusMsg({ type: 'success', text: 'База данных успешно обновлена из файла!' });
      setImportText('');
      setTimeout(() => {
        setStatusMsg(null);
        onClose();
      }, 1500);
    } else {
      setStatusMsg({ type: 'error', text: 'Ошибка: некорректный формат JSON!' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
      style={{
        paddingTop: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
        paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))'
      }}
    >
      <div className="w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
          <h3 className="text-base font-bold text-[#1E201E] font-['Manrope']">
            Экспорт и Импорт базы данных
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#E5E7EB] hover:bg-[#D1D5DB] flex items-center justify-center text-[#4B5563]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {statusMsg && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                  : 'bg-[#FEF2F2] text-[#991B1B] border border-[#FCA5A5]'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Export Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-sm text-[#1E201E]">
                1. Экспорт текущей базы (JSON)
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-xl text-xs font-semibold text-[#1E201E]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Скопировано' : 'Скопировать'}
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#84CC16] hover:bg-[#65A30D] rounded-xl text-xs font-semibold text-[#1E201E] shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Скачать файл
                </button>
              </div>
            </div>
            <textarea
              readOnly
              rows={5}
              value={jsonDump}
              className="w-full font-mono text-[11px] p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#4B5563] outline-none select-all"
            />
          </div>

          {/* Import Section */}
          <div className="space-y-2 border-t border-[#F3F4F6] pt-4">
            <label className="font-bold text-sm text-[#1E201E] block">
              2. Импорт или восстановление базы
            </label>
            <p className="text-[#6B7280]">
              Вставьте ранее сохраненный JSON-дамп для перезагрузки статей, скриптов и терминов:
            </p>
            <textarea
              rows={4}
              placeholder="Вставьте JSON базы сюда..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full font-mono text-[11px] p-3 rounded-xl bg-white border border-[#E5E7EB] text-[#1E201E] outline-none focus:border-[#84CC16]"
            />
            <div className="flex justify-end">
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E201E] disabled:opacity-50 text-white rounded-xl text-xs font-semibold hover:bg-[#374151] transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> Применить импорт
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
