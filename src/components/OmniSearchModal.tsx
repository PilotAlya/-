import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Search, X, BookOpen, MessageSquare, BookA, GraduationCap, ArrowRight, Calendar } from 'lucide-react';
import { DatabaseTab } from '../types';

export const OmniSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    articles,
    scripts,
    glossary,
    tests,
    setTab,
    setSelectedArticleId
  } = useDatabase();

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'articles' | 'scripts' | 'glossary' | 'tests'>('all');

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: {
      id: string;
      title: string;
      subtitle: string;
      type: 'articles' | 'scripts' | 'glossary' | 'tests';
      typeLabel: string;
      tab: DatabaseTab;
      icon: React.FC<{ className?: string }>;
      targetId: string;
    }[] = [];

    // Quick section jump for calendar
    if ('календарь смен график смены выходные отдых часы планирование 2/2 5/2'.includes(q) || q.includes('смен') || q.includes('граф') || q.includes('отдых')) {
      results.push({
        id: 'res-nav-calendar',
        title: 'Календарь смен оператора',
        subtitle: 'Графики 2/2 и 5/2 (08-20, 09-21, 10-22 МСК), учет часов и дней отдыха 🌴',
        type: 'articles',
        typeLabel: 'Инструмент',
        tab: 'calendar',
        icon: Calendar,
        targetId: 'calendar'
      });
    }

    // Search Articles
    if (filterType === 'all' || filterType === 'articles') {
      articles.forEach((a) => {
        const match =
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.content.some((c) => c.toLowerCase().includes(q)) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          (a.rules && a.rules.some((r) => r.toLowerCase().includes(q)));

        if (match) {
          results.push({
            id: `res-art-${a.id}`,
            title: `${a.code} — ${a.title}`,
            subtitle: a.summary,
            type: 'articles',
            typeLabel: 'База знаний',
            tab: 'kb',
            icon: BookOpen,
            targetId: a.id
          });
        }
      });
    }

    // Search Scripts
    if (filterType === 'all' || filterType === 'scripts') {
      scripts.forEach((s) => {
        const match =
          s.title.toLowerCase().includes(q) ||
          s.template.toLowerCase().includes(q) ||
          s.when.toLowerCase().includes(q) ||
          s.categoryLabel.toLowerCase().includes(q) ||
          (s.tags && s.tags.some((t) => t.toLowerCase().includes(q)));

        if (match) {
          results.push({
            id: `res-sc-${s.id}`,
            title: s.title,
            subtitle: s.template.slice(0, 110) + '...',
            type: 'scripts',
            typeLabel: `Скрипт · ${s.categoryLabel}`,
            tab: 'scripts',
            icon: MessageSquare,
            targetId: s.id
          });
        }
      });
    }

    // Search Glossary
    if (filterType === 'all' || filterType === 'glossary') {
      glossary.forEach((g) => {
        const match =
          g.term.toLowerCase().includes(q) ||
          g.definition.toLowerCase().includes(q) ||
          (g.exampleOrNote && g.exampleOrNote.toLowerCase().includes(q));

        if (match) {
          results.push({
            id: `res-gl-${g.id}`,
            title: g.term,
            subtitle: g.definition,
            type: 'glossary',
            typeLabel: `Термин · ${g.category}`,
            tab: 'glossary',
            icon: BookA,
            targetId: g.id
          });
        }
      });
    }

    // Search Tests
    if (filterType === 'all' || filterType === 'tests') {
      tests.forEach((t) => {
        const match =
          t.question.toLowerCase().includes(q) ||
          t.topic.toLowerCase().includes(q) ||
          t.correctAnswer.toLowerCase().includes(q);

        if (match) {
          results.push({
            id: `res-t-${t.id}`,
            title: t.question,
            subtitle: `Ответ: ${t.correctAnswer}`,
            type: 'tests',
            typeLabel: `Тест · ${t.day}`,
            tab: 'tests',
            icon: GraduationCap,
            targetId: t.id
          });
        }
      });
    }

    return results.slice(0, 25);
  }, [query, filterType, articles, scripts, glossary, tests]);

  if (!isSearchOpen) return null;

  const handleSelect = (item: (typeof filteredResults)[0]) => {
    if (item.targetId === 'kb-00') {
      setTab('cheatsheet');
    } else {
      setTab(item.tab);
      if (item.type === 'articles') {
        setSelectedArticleId(item.targetId);
      }
    }
    setIsSearchOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-3 sm:px-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
      style={{
        paddingTop: 'max(1.5rem, calc(env(safe-area-inset-top, 0px) + 1.25rem))',
        paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))'
      }}
    >
      <div className="w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E5E7EB] gap-3">
          <Search className="w-5 h-5 text-[#84CC16]" />
          <input
            type="text"
            autoFocus
            placeholder="Найти по всей базе данных (чекаут, промокод, CVC, ОКК, возврат)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm md:text-base outline-none text-[#1E201E] placeholder:text-[#9CA3AF]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#9CA3AF] hover:text-[#4B5563] rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-[#9CA3AF] hover:text-[#4B5563] rounded text-xs font-mono"
          >
            Esc
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-[#F9FAFB] border-b border-[#E5E7EB] overflow-x-auto text-xs">
          <span className="text-[#9CA3AF] font-medium mr-1">Фильтр:</span>
          {[
            { id: 'all', label: 'Все' },
            { id: 'articles', label: 'База знаний' },
            { id: 'scripts', label: 'Скрипты' },
            { id: 'glossary', label: 'Глоссарий' },
            { id: 'tests', label: 'Тесты' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterType === f.id
                  ? 'bg-[#1E201E] text-white'
                  : 'bg-white text-[#4B5563] border border-[#E5E7EB] hover:bg-[#F3F4F6]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#F3F4F6]">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-sm text-[#9CA3AF]">
              Начните вводить ключевое слово для поиска по базе данных...
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#9CA3AF]">
              Ничего не найдено по запросу «{query}»
            </div>
          ) : (
            filteredResults.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="p-3 hover:bg-[#F9FAFB] rounded-xl cursor-pointer transition-colors group flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-[#F3F4F6] text-[#4B5563] group-hover:bg-[#84CC16] group-hover:text-[#1E201E] transition-colors shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563]">
                          {item.typeLabel}
                        </span>
                        <h4 className="text-sm font-semibold text-[#1E201E] truncate group-hover:text-[#65A30D]">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#84CC16] shrink-0 mt-2 transition-colors" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
