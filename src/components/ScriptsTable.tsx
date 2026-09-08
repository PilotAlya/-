import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { ScriptItem } from '../types';
import {
  Search,
  Copy,
  Check,
  Edit3,
  Trash2,
  Sliders,
  AlertCircle,
  Info,
  Tag,
  X,
  RotateCcw,
  AlertTriangle,
  Package,
  Plus,
  Heart
} from 'lucide-react';
import { ScriptTagAssignModal, SCRIPT_TAG_PRESETS } from './ScriptTagAssignModal';

interface ScriptsTableProps {
  onEditScript: (script: ScriptItem) => void;
}

export const ScriptsTable: React.FC<ScriptsTableProps> = ({ onEditScript }) => {
  const {
    scripts,
    deleteScript,
    updateScriptTags,
    favoriteScriptIds,
    toggleFavoriteScript,
    isFavoriteScript
  } = useDatabase();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [tagFilterMode, setTagFilterMode] = useState<'all' | 'scenario' | 'product'>('all');
  const [isBrowseTagsOpen, setIsBrowseTagsOpen] = useState(false);
  const [browseTagSearch, setBrowseTagSearch] = useState('');
  const [tagModalScript, setTagModalScript] = useState<ScriptItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic variable inputs for instant personalization
  const [clientName, setClientName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [promoAmount, setPromoAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const categories = [
    { id: 'all', label: 'Все скрипты' },
    { id: 'start', label: 'Старт' },
    { id: 'otmena', label: 'Отмена и дефектура' },
    { id: 'dostavka', label: 'Доставка' },
    { id: 'promo', label: 'Промокоды' },
    { id: 'oplata', label: 'Оплата и карты' },
    { id: 'tovar', label: 'Товар и аромат' },
    { id: 'tech', label: 'Техника и чекаут' },
    { id: 'third', label: 'Третье лицо' },
    { id: 'empathy', label: 'Эмпатия' },
    { id: 'hard', label: 'Сложные клиенты' },
    { id: 'service', label: 'Служебные памятки' }
  ];

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    scripts.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [scripts]);

  // Aggregate script tags
  const allTagsWithCount = useMemo(() => {
    const counts: Record<string, number> = {};
    scripts.forEach((s) => {
      (s.tags || []).forEach((t) => {
        const norm = t.toLowerCase().trim();
        if (norm) {
          counts[norm] = (counts[norm] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [scripts]);

  const allExistingTags = useMemo(() => {
    return allTagsWithCount.map((t) => t.tag);
  }, [allTagsWithCount]);

  // Top popular tags for scripts
  const popularTags = useMemo(() => {
    return allTagsWithCount.slice(0, 8).map((t) => t.tag);
  }, [allTagsWithCount]);

  // Presets from SCRIPT_TAG_PRESETS
  const scenarioPresets = useMemo(() => {
    return SCRIPT_TAG_PRESETS.filter((p) => p.group === 'scenario');
  }, []);

  const productPresets = useMemo(() => {
    return SCRIPT_TAG_PRESETS.filter((p) => p.group === 'product');
  }, []);

  // Filter scripts
  const filteredScripts = useMemo(() => {
    return scripts.filter((s) => {
      const matchCat = selectedCat === 'all' || s.category === selectedCat;
      const matchFavorites = !onlyFavorites || isFavoriteScript(s.id);

      let matchTag = true;
      if (selectedTag) {
        const lower = selectedTag.toLowerCase();
        matchTag = (s.tags || []).some((t) => t.toLowerCase() === lower);
      }

      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.template.toLowerCase().includes(q) ||
        s.when.toLowerCase().includes(q) ||
        s.categoryLabel.toLowerCase().includes(q) ||
        (s.tags || []).some((t) => t.toLowerCase().includes(q));

      return matchCat && matchFavorites && matchTag && matchSearch;
    });
  }, [scripts, selectedCat, onlyFavorites, selectedTag, search, favoriteScriptIds]);

  // Compute text with replaced variables
  const getRenderedText = (template: string) => {
    let result = template;
    if (clientName.trim()) {
      result = result.replaceAll('[Имя]', clientName.trim());
    }
    if (orderNumber.trim()) {
      result = result
        .replaceAll('[Номер Заказа]', orderNumber.trim())
        .replaceAll('№…', `№${orderNumber.trim()}`)
        .replaceAll('[№ Заказа]', orderNumber.trim());
    }
    if (promoAmount.trim()) {
      result = result
        .replaceAll('[Сумма]', promoAmount.trim())
        .replaceAll('_____ ₽', `${promoAmount.trim()} ₽`)
        .replaceAll('___ ₽', `${promoAmount.trim()} ₽`)
        .replaceAll('[300]', promoAmount.trim());
    }
    if (deadline.trim()) {
      result = result
        .replaceAll('[Срок Действия]', deadline.trim())
        .replaceAll('[04.11.2026]', deadline.trim())
        .replaceAll('до …', `до ${deadline.trim()}`);
    }
    return result;
  };

  const handleCopy = (script: ScriptItem) => {
    const textToCopy = getRenderedText(script.template);
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(script.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const isFiltered = search !== '' || selectedCat !== 'all' || selectedTag !== null || onlyFavorites;

  const resetAllFilters = () => {
    setSearch('');
    setSelectedCat('all');
    setSelectedTag(null);
    setOnlyFavorites(false);
  };

  // Filtered tags in Browse Modal
  const browseFilteredTags = useMemo(() => {
    const q = browseTagSearch.trim().toLowerCase();
    if (!q) return allTagsWithCount;
    return allTagsWithCount.filter((t) => t.tag.toLowerCase().includes(q));
  }, [allTagsWithCount, browseTagSearch]);

  return (
    <div className="space-y-4">
      {/* Variable Autofill Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#84CC16]" />
            <h3 className="text-sm font-bold text-[#1E201E]">Быстрая подстановка переменных в скрипты</h3>
          </div>
          <span className="text-xs text-[#6B7280]">
            Заполните поля — и в скриптах автоматически подставятся имя, сумма и номер заказа
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="block text-[11px] font-medium text-[#6B7280] mb-1">Имя клиента [Имя]</label>
            <input
              type="text"
              placeholder="например, Мария"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#6B7280] mb-1">Номер заказа [№]</label>
            <input
              type="text"
              placeholder="например, 20491823"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#6B7280] mb-1">Сумма промо [Сумма]</label>
            <input
              type="text"
              placeholder="например, 400"
              value={promoAmount}
              onChange={(e) => setPromoAmount(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#6B7280] mb-1">Срок действия [Срок]</label>
            <input
              type="text"
              placeholder="например, до 15.10"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
            />
          </div>
        </div>
      </div>

      {/* Categories, Search & Tag Filters Panel */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3.5">
        {/* Search row with reset */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Поиск по скриптам, тексту, сценариям или тегам..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-8 py-2 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16] bg-[#F9FAFB] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] hover:text-[#1E201E] w-4 h-4 rounded-full flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isFiltered && (
              <button
                onClick={resetAllFilters}
                className="px-3 py-2 text-xs font-medium text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Сбросить все фильтры"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сброс фильтров</span>
              </button>
            )}

            <button
              onClick={() => setIsBrowseTagsOpen(true)}
              className="px-3 py-2 text-xs font-medium text-[#4B5563] hover:text-[#1E201E] bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Просмотреть все используемые теги скриптов"
            >
              <Tag className="w-3.5 h-3.5 text-[#84CC16]" />
              <span>Все теги скриптов ({allTagsWithCount.length}) ▾</span>
            </button>
          </div>
        </div>

        {/* Categories Row with counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-[#9CA3AF] text-[11px] font-mono shrink-0 uppercase tracking-wider font-semibold mr-1">
            Категории:
          </span>

          <button
            onClick={() => setOnlyFavorites((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
              onlyFavorites
                ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] font-bold shadow-2xs'
                : 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6] hover:text-[#EF4444]'
            }`}
            title="Показать только избранные скрипты"
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'text-[#EF4444] fill-current' : 'text-[#9CA3AF]'}`} />
            <span>Избранные</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                onlyFavorites ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              {favoriteScriptIds.length}
            </span>
          </button>

          {categories.map((c) => {
            const count = c.id === 'all' ? scripts.length : categoryCounts[c.id] || 0;
            const isSelected = selectedCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#1E201E] text-white shadow-xs'
                    : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                }`}
              >
                <span>{c.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-[#374151] text-[#A3E635]' : 'bg-[#E5E7EB] text-[#6B7280]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Favorites Banner */}
        {onlyFavorites && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <Heart className="w-3.5 h-3.5 text-[#EF4444] fill-current shrink-0" />
              <span className="text-[#991B1B] text-[11px] font-medium">Фильтр:</span>
              <span className="font-bold text-[#991B1B] bg-white px-2 py-0.5 rounded border border-[#FECACA] text-xs truncate">
                Только избранные скрипты
              </span>
              <span className="text-[#B91C1C] text-[11px] font-mono shrink-0">
                (в списке: <strong>{filteredScripts.length}</strong> из {favoriteScriptIds.length})
              </span>
            </div>
            <button
              onClick={() => setOnlyFavorites(false)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DC2626] hover:bg-[#DC2626]/10 px-2 py-1 rounded-lg cursor-pointer transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
              Показать все
            </button>
          </div>
        )}

        {/* Active Tag Filter Banner */}
        {selectedTag && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#84CC16]/15 border border-[#84CC16]/40 rounded-xl text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <Tag className="w-3.5 h-3.5 text-[#65A30D] shrink-0" />
              <span className="text-[#4B5563] text-[11px] font-medium">Фильтр по тегу скрипта:</span>
              <span className="font-mono font-bold text-[#1E201E] bg-white px-2 py-0.5 rounded border border-[#84CC16]/30 text-xs truncate">
                #{selectedTag}
              </span>
              <span className="text-[#6B7280] text-[11px] font-mono shrink-0">
                (найдено скриптов: <strong>{filteredScripts.length}</strong>)
              </span>
            </div>
            <button
              onClick={() => setSelectedTag(null)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DC2626] hover:bg-[#DC2626]/10 px-2 py-1 rounded-lg cursor-pointer transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
              Сбросить тег
            </button>
          </div>
        )}

        {/* Tag Filters Section */}
        <div className="space-y-2 pt-2 border-t border-[#F3F4F6] text-xs">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-[#F3F4F6] p-0.5 rounded-xl text-[11px] font-medium">
              <button
                onClick={() => setTagFilterMode('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  tagFilterMode === 'all'
                    ? 'bg-white text-[#1E201E] font-bold shadow-2xs'
                    : 'text-[#6B7280] hover:text-[#1E201E]'
                }`}
              >
                Популярные теги
              </button>
              <button
                onClick={() => setTagFilterMode('scenario')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  tagFilterMode === 'scenario'
                    ? 'bg-white text-[#DC2626] font-bold shadow-2xs'
                    : 'text-[#6B7280] hover:text-[#1E201E]'
                }`}
              >
                <AlertTriangle className="w-2.5 h-2.5" />
                Сценарии диалога
              </button>
              <button
                onClick={() => setTagFilterMode('product')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  tagFilterMode === 'product'
                    ? 'bg-white text-[#1E201E] font-bold shadow-2xs'
                    : 'text-[#6B7280] hover:text-[#1E201E]'
                }`}
              >
                <Package className="w-2.5 h-2.5" />
                Продукты и тематики
              </button>
            </div>

            <div className="text-[11px] text-[#6B7280] font-mono shrink-0 hidden sm:block">
              Скриптов: <strong>{filteredScripts.length}</strong> / {scripts.length}
            </div>
          </div>

          {/* Quick Tag Pills based on selected mode */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {tagFilterMode === 'all' && (
              <>
                <span className="text-[#9CA3AF] font-mono shrink-0 uppercase tracking-wider font-semibold mr-1">
                  ТОП:
                </span>
                {popularTags.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(isSelected ? null : tag)}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#1E201E] text-white border-[#1E201E] shadow-2xs'
                          : 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] hover:border-[#9CA3AF] hover:text-[#1E201E]'
                      }`}
                    >
                      <span>#{tag}</span>
                    </button>
                  );
                })}
              </>
            )}

            {tagFilterMode === 'scenario' && (
              <>
                <span className="text-[#9CA3AF] font-mono shrink-0 uppercase tracking-wider font-semibold mr-1">
                  Сценарии:
                </span>
                {scenarioPresets.map(({ tag, label, icon: Icon, colorClass }) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(isSelected ? null : tag)}
                      className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#1E201E] text-white border-[#1E201E] shadow-2xs'
                          : colorClass
                      }`}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </>
            )}

            {tagFilterMode === 'product' && (
              <>
                <span className="text-[#9CA3AF] font-mono shrink-0 uppercase tracking-wider font-semibold mr-1">
                  Продукты:
                </span>
                {productPresets.map(({ tag, label, icon: Icon, colorClass }) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(isSelected ? null : tag)}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#1E201E] text-white border-[#1E201E] shadow-2xs'
                          : colorClass
                      }`}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scripts Grid */}
      <div className="space-y-3">
        {filteredScripts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#E5E7EB] text-sm text-[#9CA3AF] space-y-2">
            <div>Скриптов по заданным критериям не найдено</div>
            {isFiltered && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-[#84CC16] hover:underline font-semibold"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        ) : (
          filteredScripts.map((script) => {
            const isCopied = copiedId === script.id;
            const renderedText = getRenderedText(script.template);
            const scriptTags = script.tags || [];

            return (
              <div
                key={script.id}
                className={`bg-white border rounded-2xl p-4 md:p-5 shadow-xs transition-all space-y-3 ${
                  script.isService
                    ? 'border-[#FCD34D] bg-[#FFFBEB]/30'
                    : 'border-[#E5E7EB] hover:border-[#84CC16]'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          script.isService
                            ? 'bg-[#FEF3C7] text-[#B45309]'
                            : 'bg-[#F3F4F6] text-[#4B5563]'
                        }`}
                      >
                        {script.categoryLabel}
                      </span>
                      {script.isService && (
                        <span className="text-[11px] font-semibold text-[#B45309] flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Внутренняя шпаргалка (клиенту не слать)
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-[#1E201E] font-['Manrope']">
                      {script.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(script)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                        isCopied
                          ? 'bg-[#059669] text-white'
                          : 'bg-[#84CC16] hover:bg-[#65A30D] text-[#1E201E]'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4" /> Скопировано!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" /> Скопировать для «Ирис»
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => toggleFavoriteScript(script.id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isFavoriteScript(script.id)
                          ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA] hover:bg-[#FEE2E2]'
                          : 'bg-white text-[#9CA3AF] border-[#E5E7EB] hover:text-[#EF4444] hover:bg-[#FEF2F2]'
                      }`}
                      title={isFavoriteScript(script.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                    >
                      <Heart className={`w-4 h-4 ${isFavoriteScript(script.id) ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => setTagModalScript(script)}
                      className="p-2 text-[#4B5563] hover:text-[#84CC16] hover:bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] transition-colors cursor-pointer flex items-center gap-1 text-xs"
                      title="Управление тегами скрипта"
                    >
                      <Tag className="w-3.5 h-3.5 text-[#84CC16]" />
                      <span className="hidden sm:inline text-[11px] font-medium">
                        Теги ({scriptTags.length})
                      </span>
                    </button>

                    <button
                      onClick={() => onEditScript(script)}
                      className="p-2 text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] transition-colors cursor-pointer"
                      title="Редактировать скрипт"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Удалить скрипт «${script.title}»?`)) {
                          deleteScript(script.id);
                        }
                      }}
                      className="p-2 text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl border border-[#E5E7EB] transition-colors cursor-pointer"
                      title="Удалить скрипт"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tags row on card */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {scriptTags.length > 0 ? (
                    scriptTags.map((tag) => {
                      const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
                      const isWarning =
                        tag.includes('штраф') || tag.includes('запрет') || tag.includes('срочн');
                      return (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(isSelected ? null : tag)}
                          className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#1E201E] text-white border-[#1E201E] shadow-2xs font-semibold'
                              : isWarning
                              ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] hover:bg-[#FEE2E2]'
                              : 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] hover:border-[#9CA3AF]'
                          }`}
                          title={`Фильтровать по тегу #${tag}`}
                        >
                          #{tag}
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-[11px] text-[#9CA3AF] italic">
                      Нет присвоенных тегов
                    </span>
                  )}

                  <button
                    onClick={() => setTagModalScript(script)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] text-[#6B7280] hover:text-[#1E201E] hover:bg-[#F3F4F6] border border-dashed border-[#D1D5DB] transition-colors cursor-pointer"
                    title="Присвоить теги скрипту"
                  >
                    <Plus className="w-3 h-3 text-[#84CC16]" />
                    <span>Добавить тег</span>
                  </button>
                </div>

                {/* When to use condition */}
                <div className="flex items-center gap-1.5 text-xs text-[#6B7280] italic">
                  <Info className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                  <span>Когда: {script.when}</span>
                </div>

                {/* Template body */}
                <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#F3F4F6] text-sm text-[#1E201E] font-sans whitespace-pre-line leading-relaxed selection:bg-[#BEF264]">
                  {renderedText}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Script Tag Assign Modal */}
      <ScriptTagAssignModal
        script={tagModalScript}
        isOpen={!!tagModalScript}
        onClose={() => setTagModalScript(null)}
        onUpdateTags={updateScriptTags}
        allExistingTags={allExistingTags}
      />

      {/* Browse All Script Tags Modal */}
      {isBrowseTagsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setIsBrowseTagsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#84CC16]" />
                <h3 className="text-sm font-bold text-[#1E201E] font-['Manrope']">
                  Все теги скриптов ({allTagsWithCount.length})
                </h3>
              </div>
              <button
                onClick={() => setIsBrowseTagsOpen(false)}
                className="w-7 h-7 rounded-full bg-[#E5E7EB] hover:bg-[#D1D5DB] flex items-center justify-center text-[#4B5563] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-[#F3F4F6]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Поиск по тегам скриптов..."
                  value={browseTagSearch}
                  onChange={(e) => setBrowseTagSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                />
              </div>
            </div>

            {/* Tag List */}
            <div className="p-5 overflow-y-auto flex-1 space-y-1.5 text-xs">
              {browseFilteredTags.length === 0 ? (
                <div className="text-center py-6 text-[#9CA3AF]">Тегов не найдено</div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {browseFilteredTags.map(({ tag, count }) => {
                    const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTag(isSelected ? null : tag);
                          setIsBrowseTagsOpen(false);
                        }}
                        className={`px-2.5 py-1 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1E201E] text-white border-[#1E201E] shadow-2xs'
                            : 'bg-white text-[#374151] border-[#E5E7EB] hover:border-[#84CC16] hover:bg-[#F9FAFB]'
                        }`}
                      >
                        <span>#{tag}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isSelected ? 'bg-[#374151] text-[#A3E635]' : 'bg-[#F3F4F6] text-[#6B7280]'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between text-xs">
              {selectedTag && (
                <button
                  onClick={() => {
                    setSelectedTag(null);
                    setIsBrowseTagsOpen(false);
                  }}
                  className="text-[11px] text-[#DC2626] hover:underline"
                >
                  Сбросить активный фильтр (#{selectedTag})
                </button>
              )}
              <button
                onClick={() => setIsBrowseTagsOpen(false)}
                className="ml-auto px-4 py-1.5 bg-[#1E201E] text-white font-bold rounded-xl text-xs hover:bg-[#374151] transition-colors cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
