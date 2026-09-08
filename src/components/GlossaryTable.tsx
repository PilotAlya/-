import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { GlossaryTerm } from '../types';
import { Search, BookA, Edit3, Trash2, Plus, Tag } from 'lucide-react';

interface GlossaryTableProps {
  onEditTerm: (term: GlossaryTerm) => void;
  onAddNewTerm: () => void;
}

export const GlossaryTable: React.FC<GlossaryTableProps> = ({ onEditTerm, onAddNewTerm }) => {
  const { glossary, deleteGlossaryTerm } = useDatabase();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const categories = ['all', 'Инструменты', 'Процессы', 'Роли', 'Организации'];

  const filteredGlossary = useMemo(() => {
    return glossary.filter((g) => {
      const matchCat = selectedCat === 'all' || g.category === selectedCat;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        g.term.toLowerCase().includes(q) ||
        g.definition.toLowerCase().includes(q) ||
        (g.exampleOrNote && g.exampleOrNote.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [glossary, selectedCat, search]);

  return (
    <div className="space-y-4">
      {/* Header / Search bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Поиск по терминам и сокращениям..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16] bg-[#F9FAFB]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCat(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCat === c
                    ? 'bg-[#1E201E] text-white'
                    : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                }`}
              >
                {c === 'all' ? 'Все категории' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredGlossary.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-[#E5E7EB] hover:border-[#84CC16] rounded-2xl p-4 shadow-xs transition-all space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#4B5563]">
                  {item.category}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditTerm(item)}
                    className="p-1 text-[#6B7280] hover:text-[#1E201E] rounded-md transition-colors"
                    title="Редактировать термин"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Удалить термин «${item.term}»?`)) {
                        deleteGlossaryTerm(item.id);
                      }
                    }}
                    className="p-1 text-[#9CA3AF] hover:text-[#DC2626] rounded-md transition-colors"
                    title="Удалить термин"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-[#1E201E] font-['Manrope']">
                {item.term}
              </h3>

              <p className="text-xs text-[#374151] leading-relaxed">
                {item.definition}
              </p>
            </div>

            {item.exampleOrNote && (
              <div className="pt-2 mt-2 border-t border-[#F3F4F6] text-[11px] text-[#6B7280] italic">
                Примечание: {item.exampleOrNote}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
