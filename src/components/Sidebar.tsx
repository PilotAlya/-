import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { DatabaseTab } from '../types';
import { BookOpen, MessageSquare, GitFork, Calculator, BookA, GraduationCap, ShieldCheck, KeyRound, Calendar, Heart } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { tab, setTab, articles, scripts, glossary, tests, favoriteArticleIds, favoriteScriptIds } = useDatabase();

  const totalFavorites = favoriteArticleIds.length + favoriteScriptIds.length;

  const navItems: { id: DatabaseTab; label: string; icon: React.FC<{ className?: string }>; count?: number; isSpecialFav?: boolean }[] = [
    { id: 'kb', label: 'База знаний', icon: BookOpen, count: articles.length },
    { id: 'favorites', label: 'Избранное', icon: Heart, count: totalFavorites, isSpecialFav: true },
    { id: 'cheatsheet', label: 'Шпаргалка систем', icon: KeyRound, count: 8 },
    { id: 'calendar', label: 'Календарь смен', icon: Calendar },
    { id: 'scripts', label: 'Скрипты «Ирис»', icon: MessageSquare, count: scripts.length },
    { id: 'schemes', label: 'Схемы и развилки', icon: GitFork, count: 3 },
    { id: 'kpi', label: 'KPI и Зарплата', icon: Calculator },
    { id: 'glossary', label: 'Глоссарий терминов', icon: BookA, count: glossary.length },
    { id: 'tests', label: 'Разбор тестов Q&A', icon: GraduationCap, count: tests.length }
  ];

  return (
    <aside className="hidden lg:block lg:w-64 shrink-0">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-3 shadow-xs space-y-1 sticky top-20">
        <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider font-semibold text-[#9CA3AF]">
          Таблицы и разделы
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1E201E] text-white font-semibold shadow-xs'
                  : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#1E201E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? item.isSpecialFav
                        ? 'text-[#F87171] fill-current'
                        : 'text-[#84CC16]'
                      : item.isSpecialFav
                      ? item.count && item.count > 0
                        ? 'text-[#EF4444] fill-current'
                        : 'text-[#9CA3AF]'
                      : 'text-[#6B7280]'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                    isActive
                      ? item.isSpecialFav
                        ? 'bg-[#991B1B] text-white'
                        : 'bg-[#374151] text-[#A3E635]'
                      : item.isSpecialFav && item.count > 0
                      ? 'bg-[#FEF2F2] text-[#DC2626] font-bold'
                      : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick reminder card */}
        <div className="pt-3 mt-3 border-t border-[#F3F4F6]">
          <div className="p-3 bg-[#F9FAFB] rounded-xl border border-[#F3F4F6] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E201E]">
              <ShieldCheck className="w-4 h-4 text-[#84CC16]" />
              <span>Главные правила линии</span>
            </div>
            <ul className="text-[11px] text-[#4B5563] space-y-1 pl-3.5 list-disc">
              <li>Только чаты, звонков нет</li>
              <li>«Я» вместо «МЫ» в переписке</li>
              <li>«Ожидает информации» — табу</li>
              <li>Промокод до 900 ₽ — выдаем сами</li>
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
};
