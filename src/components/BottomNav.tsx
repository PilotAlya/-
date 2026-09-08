import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { DatabaseTab } from '../types';
import {
  BookOpen,
  MessageSquareCode,
  GitFork,
  Calculator,
  MoreHorizontal,
  GraduationCap,
  BookA,
  Search,
  Plus,
  Smartphone,
  Download,
  X,
  KeyRound,
  Calendar,
  Heart
} from 'lucide-react';

interface BottomNavProps {
  onOpenAddModal: () => void;
  onOpenPhoneModal: () => void;
  onOpenExportModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onOpenAddModal,
  onOpenPhoneModal,
  onOpenExportModal,
}) => {
  const {
    tab,
    setTab,
    setIsSearchOpen,
    articles,
    scripts,
    favoriteArticleIds,
    favoriteScriptIds
  } = useDatabase();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const totalFavorites = favoriteArticleIds.length + favoriteScriptIds.length;

  const mainTabs: { id: DatabaseTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'kb', label: 'База', icon: BookOpen, badge: articles.length },
    { id: 'cheatsheet', label: 'Шпаргалка', icon: KeyRound, badge: 8 },
    { id: 'calendar', label: 'График', icon: Calendar },
    { id: 'scripts', label: 'Скрипты', icon: MessageSquareCode, badge: scripts.length },
  ];

  return (
    <>
      {/* "More" Bottom Sheet Overlay */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setIsMoreOpen(false)}
          />
          <div
            className="relative bg-white rounded-t-3xl border-t border-[#E5E7EB] p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto"
            style={{
              paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))'
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F6]">
              <div className="w-10 h-1 rounded-full bg-[#D1D5DB] mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
              <h3 className="text-sm font-bold text-[#1E201E] font-['Manrope'] mt-2">
                Все разделы и инструменты
              </h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="w-7 h-7 rounded-full bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center mt-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => {
                  setTab('favorites');
                  setIsMoreOpen(false);
                }}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-colors col-span-2 ${
                  tab === 'favorites'
                    ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
                    : 'bg-[#FFF5F5] border-[#FED7D7] hover:bg-[#FEE2E2] text-[#991B1B]'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-[#FECACA] flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 text-[#EF4444] fill-current" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-[#1E201E] flex items-center justify-between">
                    <span>Избранное оператора</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-[#DC2626] font-bold border border-[#FECACA]">
                      {totalFavorites} {totalFavorites === 1 ? 'запись' : 'записей'}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#6B7280]">
                    Быстрый доступ к сохраненным статьям и скриптам
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setTab('schemes');
                  setIsMoreOpen(false);
                }}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-colors ${
                  tab === 'schemes'
                    ? 'bg-[#F7FEE7] border-[#84CC16] text-[#1E201E]'
                    : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563]'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0">
                  <GitFork className="w-4 h-4 text-[#84CC16]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E201E]">Схемы</div>
                  <div className="text-[10px] text-[#6B7280]">Развилки и ветки</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setTab('kpi');
                  setIsMoreOpen(false);
                }}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-colors ${
                  tab === 'kpi'
                    ? 'bg-[#F7FEE7] border-[#84CC16] text-[#1E201E]'
                    : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563]'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0">
                  <Calculator className="w-4 h-4 text-[#84CC16]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E201E]">Калькулятор</div>
                  <div className="text-[10px] text-[#6B7280]">KPI и Зарплата</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setTab('glossary');
                  setIsMoreOpen(false);
                }}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-colors ${
                  tab === 'glossary'
                    ? 'bg-[#F7FEE7] border-[#84CC16] text-[#1E201E]'
                    : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563]'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0">
                  <BookA className="w-4 h-4 text-[#84CC16]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E201E]">Глоссарий</div>
                  <div className="text-[10px] text-[#6B7280]">Термины и роли</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setTab('tests');
                  setIsMoreOpen(false);
                }}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-colors ${
                  tab === 'tests'
                    ? 'bg-[#F7FEE7] border-[#84CC16] text-[#1E201E]'
                    : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563]'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-[#84CC16]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E201E]">Тесты и Q&A</div>
                  <div className="text-[10px] text-[#6B7280]">Аттестация</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  setIsMoreOpen(false);
                }}
                className="p-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] text-left flex items-center gap-3 transition-colors hover:border-[#84CC16]"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-[#4B5563]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E201E]">Поиск</div>
                  <div className="text-[10px] text-[#6B7280]">По всей базе</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenAddModal();
                  setIsMoreOpen(false);
                }}
                className="p-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] text-left flex items-center gap-3 transition-colors hover:border-[#84CC16]"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 text-[#84CC16]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E201E]">Добавить</div>
                  <div className="text-[10px] text-[#6B7280]">Новая запись</div>
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-[#F3F4F6] grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onOpenPhoneModal();
                  setIsMoreOpen(false);
                }}
                className="p-2.5 rounded-xl bg-[#1E201E] text-white flex items-center justify-center gap-2 text-xs font-bold"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#84CC16]" />
                <span>Установить PWA</span>
              </button>

              <button
                onClick={() => {
                  onOpenExportModal();
                  setIsMoreOpen(false);
                }}
                className="p-2.5 rounded-xl bg-[#F3F4F6] text-[#1E201E] flex items-center justify-center gap-2 text-xs font-semibold hover:bg-[#E5E7EB]"
              >
                <Download className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Экспорт JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] px-2 pt-1.5 shadow-lg"
        style={{
          paddingBottom: 'max(0.625rem, calc(env(safe-area-inset-bottom, 0px) + 0.375rem))'
        }}
      >
        <div className="flex items-center justify-around">
          {mainTabs.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive ? 'text-[#1E201E] font-bold' : 'text-[#6B7280] font-medium'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-[#84CC16] text-[#1E201E] shadow-2xs' : 'text-[#6B7280]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              tab === 'glossary' || tab === 'tests' ? 'text-[#1E201E] font-bold' : 'text-[#6B7280] font-medium'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                tab === 'glossary' || tab === 'tests' ? 'bg-[#84CC16] text-[#1E201E] shadow-2xs' : 'text-[#6B7280]'
              }`}
            >
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Ещё</span>
          </button>
        </div>
      </nav>
    </>
  );
};
