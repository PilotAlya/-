import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Search, Plus, Download, RefreshCw, Database, Smartphone, QrCode, Heart } from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onOpenPhoneModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenExportModal,
  onOpenPhoneModal,
}) => {
  const {
    setIsSearchOpen,
    articles,
    scripts,
    glossary,
    resetDatabase,
    favoriteArticleIds,
    favoriteScriptIds,
    tab,
    setTab
  } = useDatabase();

  const totalFavorites = favoriteArticleIds.length + favoriteScriptIds.length;

  const handleReset = () => {
    if (window.confirm('Восстановить исходные данные базы? Все пользовательские изменения будут сброшены.')) {
      resetDatabase();
    }
  };

  return (
    <header
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-3 sm:px-4 lg:px-8 pb-2.5 sm:pb-3 transition-colors shadow-2xs"
      style={{
        paddingTop: 'max(0.625rem, calc(env(safe-area-inset-top, 0px) + 0.375rem))'
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#9AE600] to-[#72B600] text-white flex items-center justify-center font-extrabold text-sm sm:text-base shadow-sm border border-lime-600/20 shrink-0">
            <span className="font-['Manrope'] font-black tracking-tighter">АВ</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-[#1E201E] font-['Manrope'] truncate">
                База поддержки
              </h1>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                <Database className="w-3 h-3" /> Аврелия
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-[#6B7280]">
              {articles.length} ст. · {scripts.length} скр. · {glossary.length} терм.
            </p>
          </div>
        </div>

        {/* Global search trigger */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-[#6B7280] bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl transition-all shadow-xs cursor-pointer text-left"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#9CA3AF]" />
              <span>Поиск по всей базе (статьи, скрипты, нормы)...</span>
            </span>
            <kbd className="hidden lg:inline-block px-2 py-0.5 text-[11px] font-mono font-medium text-[#4B5563] bg-white border border-[#D1D5DB] rounded shadow-2xs">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Favorites quick button */}
          <button
            onClick={() => setTab('favorites')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 h-9 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              tab === 'favorites'
                ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] shadow-2xs font-bold'
                : 'text-[#4B5563] bg-[#F9FAFB] hover:bg-[#F3F4F6] border-[#E5E7EB] hover:text-[#EF4444]'
            }`}
            title="Перейти в Избранное оператора"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                tab === 'favorites' || totalFavorites > 0
                  ? 'text-[#EF4444] fill-current'
                  : 'text-[#9CA3AF]'
              }`}
            />
            <span className="hidden sm:inline">Избранное</span>
            {totalFavorites > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#FEE2E2] text-[#DC2626] font-bold">
                {totalFavorites}
              </span>
            )}
          </button>

          {/* Mobile search button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-[#4B5563] hover:bg-[#F3F4F6] active:bg-[#E5E7EB] rounded-xl border border-[#E5E7EB] transition-colors"
            title="Поиск"
            aria-label="Поиск по базе"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Open on Phone / PWA button */}
          <button
            onClick={onOpenPhoneModal}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 h-9 text-xs font-semibold text-[#1E201E] bg-[#F3F4F6] hover:bg-[#E5E7EB] active:bg-[#E2E8F0] border border-[#E5E7EB] rounded-xl transition-colors"
            title="Открыть на телефоне или установить на ПК"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#65A30D]" />
            <span className="hidden sm:inline">На телефон</span>
            <QrCode className="w-3.5 h-3.5 text-[#6B7280] hidden sm:inline" />
          </button>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 h-9 text-xs sm:text-sm font-semibold text-[#1E201E] bg-[#84CC16] hover:bg-[#65A30D] active:bg-[#4D7C0F] rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#1E201E]" />
            <span className="hidden sm:inline">Добавить</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="hidden sm:flex items-center justify-center w-9 h-9 text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] transition-colors"
            title="Импорт / Экспорт базы данных"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className="flex items-center justify-center w-9 h-9 text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] active:bg-[#FEE2E2] rounded-xl border border-[#E5E7EB] transition-colors"
            title="Сбросить к исходной базе"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
