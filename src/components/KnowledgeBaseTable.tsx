import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { KBArticle } from '../types';
import {
  Search,
  Filter,
  Heart,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  List,
  RotateCcw,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  Tag,
  AlertTriangle,
  SlidersHorizontal,
  ChevronDown,
  Plus,
  X,
  Sparkles,
  Flame,
  CheckCircle2,
  Package,
  CreditCard,
  Percent,
  Star,
  Monitor,
  Globe,
  Layers,
  History,
  Clock
} from 'lucide-react';
import { TagAssignModal } from './TagAssignModal';
import { ArticleVersionHistoryModal } from './ArticleVersionHistoryModal';

interface KnowledgeBaseTableProps {
  onEditArticle: (article: KBArticle) => void;
}

type SortKey = 'code' | 'title' | 'category' | 'updatedAt' | 'rules';
type SortOrder = 'asc' | 'desc';

// Presets for tag filtering bar
const STATUS_FILTER_PRESETS = [
  { tag: 'штраф окк', label: 'Штраф ОКК ⚠️', aliases: ['штрафы', 'окк', 'штраф окк'] },
  { tag: 'актуально', label: 'Актуально 🟢' },
  { tag: 'срочно', label: 'Срочно 🔥' },
  { tag: 'важно', label: 'Важно 📌' },
  { tag: 'обновлено', label: 'Обновлено 🆕' },
  { tag: 'запрет', label: 'Строгий запрет 🛑' }
];

const CATEGORY_FILTER_PRESETS = [
  { tag: 'доставка', label: 'Доставка 📦' },
  { tag: 'оплата', label: 'Оплата / СБП 💳' },
  { tag: 'возврат', label: 'Возврат ↩️' },
  { tag: 'промокоды', label: 'Промокоды 🏷️' },
  { tag: 'лояльность', label: 'Лояльность ⭐' },
  { tag: 'бонусы', label: 'Бонусы ✨' },
  { tag: 'нексус', label: 'Нексус 🖥️' },
  { tag: 'ирис', label: 'Ирис 🔍' },
  { tag: 'казахстан', label: 'Казахстан 🇰🇿' },
  { tag: 'беларусь', label: 'Беларусь 🇧🇾' },
  { tag: 'претензии', label: 'Претензии ⚖️' }
];

export const KnowledgeBaseTable: React.FC<KnowledgeBaseTableProps> = ({ onEditArticle }) => {
  const {
    articles,
    updateArticle,
    deleteArticle,
    selectedArticleId,
    setSelectedArticleId,
    favoriteArticleIds,
    toggleFavoriteArticle,
    isFavoriteArticle
  } = useDatabase();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [tagFilterMode, setTagFilterMode] = useState<'all' | 'status' | 'category'>('all');
  const [isBrowseTagsOpen, setIsBrowseTagsOpen] = useState(false);
  const [browseTagsSearch, setBrowseTagsSearch] = useState('');
  const [tagAssignArticle, setTagAssignArticle] = useState<KBArticle | null>(null);
  const [versionHistoryArticle, setVersionHistoryArticle] = useState<KBArticle | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>('code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract categories with counts
  const categoriesWithCount = useMemo(() => {
    const map = new Map<string, number>();
    articles.forEach((a) => {
      map.set(a.category, (map.get(a.category) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0], 'ru'))
      .map(([name, count]) => ({ name, count }));
  }, [articles]);

  // Extract all unique tags with occurrence count
  const allTagsWithCount = useMemo(() => {
    const counts = new Map<string, number>();
    articles.forEach((a) => {
      a.tags.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [articles]);

  const allExistingTags = useMemo(() => {
    return allTagsWithCount.map((t) => t.tag);
  }, [allTagsWithCount]);

  // Popular tags
  const popularTags = useMemo(() => {
    return allTagsWithCount.slice(0, 8).map((t) => t.tag);
  }, [allTagsWithCount]);

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchCat = selectedCategory === 'all' || a.category === selectedCategory;
      const matchFavorites = !onlyFavorites || isFavoriteArticle(a.id);
      
      let matchTag = true;
      if (selectedTag) {
        const lowerTag = selectedTag.toLowerCase();
        if (lowerTag === 'штраф окк' || lowerTag === 'штрафы' || lowerTag === 'окк') {
          matchTag =
            a.tags.some((t) => {
              const tl = t.toLowerCase();
              return tl === 'штраф окк' || tl === 'штрафы' || tl === 'окк';
            }) || (a.rules && a.rules.length > 0);
        } else {
          matchTag = a.tags.some((t) => t.toLowerCase() === lowerTag);
        }
      }

      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.content.some((c) => c.toLowerCase().includes(q));

      return matchCat && matchFavorites && matchTag && matchSearch;
    });
  }, [articles, selectedCategory, onlyFavorites, selectedTag, search, favoriteArticleIds]);

  // Sort articles
  const sortedArticles = useMemo(() => {
    return [...filteredArticles].sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'code') {
        const numA = parseInt(a.code, 10);
        const numB = parseInt(b.code, 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          comparison = numA - numB;
        } else {
          comparison = a.code.localeCompare(b.code, undefined, { numeric: true });
        }
      } else if (sortKey === 'title') {
        comparison = a.title.localeCompare(b.title, 'ru');
      } else if (sortKey === 'category') {
        comparison = a.category.localeCompare(b.category, 'ru');
      } else if (sortKey === 'updatedAt') {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortKey === 'rules') {
        const rulesA = a.rules?.length || 0;
        const rulesB = b.rules?.length || 0;
        comparison = rulesA - rulesB;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredArticles, sortKey, sortOrder]);

  const activeArticle = useMemo(() => {
    return articles.find((a) => a.id === selectedArticleId) || null;
  }, [articles, selectedArticleId]);

  const handleCopySummary = (article: KBArticle) => {
    const text = `${article.code} · ${article.title}\n\n${article.summary}\n\nПравила:\n${(article.rules || []).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(article.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleColumnSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const isFiltered =
    search !== '' ||
    selectedCategory !== 'all' ||
    selectedTag !== null ||
    onlyFavorites ||
    sortKey !== 'code' ||
    sortOrder !== 'asc';

  const resetAllFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedTag(null);
    setOnlyFavorites(false);
    setSortKey('code');
    setSortOrder('asc');
  };

  return (
    <div className="space-y-4">
      {/* Controls & Filter Panel */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3.5">
        {/* Top row: Search, Category Quick-Select, Sorting & View Toggle */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Поиск по регламентам, коду, ключевым словам..."
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

          {/* Right Controls: Category Dropdown, Sort Dropdown & View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown (convenient for deep selection) */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none text-xs font-semibold pl-8 pr-7 py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-xl text-[#374151] outline-none cursor-pointer transition-colors"
              >
                <option value="all">Все категории ({articles.length})</option>
                {categoriesWithCount.map(({ name, count }) => (
                  <option key={name} value={name}>
                    {name} ({count})
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
            </div>

            {/* Sorting Dropdown */}
            <div className="relative flex items-center">
              <select
                value={`${sortKey}-${sortOrder}`}
                onChange={(e) => {
                  const [key, order] = e.target.value.split('-') as [SortKey, SortOrder];
                  setSortKey(key);
                  setSortOrder(order);
                }}
                className="appearance-none text-xs font-semibold pl-8 pr-7 py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-xl text-[#374151] outline-none cursor-pointer transition-colors"
              >
                <option value="code-asc">По коду раздела (00 → 28)</option>
                <option value="code-desc">По коду раздела (28 → 00)</option>
                <option value="title-asc">По названию (А → Я)</option>
                <option value="title-desc">По названию (Я → А)</option>
                <option value="category-asc">По категории (А → Я)</option>
                <option value="updatedAt-desc">Сначала новые (по дате)</option>
                <option value="rules-desc">Сначала со штрафами ОКК</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
            </div>

            {/* Reset filters button if active */}
            {isFiltered && (
              <button
                onClick={resetAllFilters}
                className="p-2 text-xs font-medium text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] rounded-xl transition-colors flex items-center gap-1"
                title="Сбросить все фильтры и сортировку"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Сброс</span>
              </button>
            )}

            {/* View Mode Switcher */}
            <div className="p-1 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl flex items-center gap-0.5 ml-auto sm:ml-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#1E201E] shadow-2xs font-semibold'
                    : 'text-[#6B7280] hover:text-[#1E201E]'
                }`}
                title="Отображение карточками"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-[#1E201E] shadow-2xs font-semibold'
                    : 'text-[#6B7280] hover:text-[#1E201E]'
                }`}
                title="Отображение таблицей"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Row with item counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#F3F4F6] text-xs pb-1 scrollbar-none">
          <span className="text-[#9CA3AF] text-[11px] font-mono shrink-0 uppercase tracking-wider font-semibold mr-1">
            Категории:
          </span>

          <button
            onClick={() => {
              setOnlyFavorites((prev) => !prev);
              if (!onlyFavorites) {
                // Keep category as-is or reset if desired
              }
            }}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
              onlyFavorites
                ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] font-bold shadow-2xs'
                : 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6] hover:text-[#EF4444]'
            }`}
            title="Показать только статьи из избранного"
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'text-[#EF4444] fill-current' : 'text-[#9CA3AF]'}`} />
            <span>Избранные</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                onlyFavorites ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              {favoriteArticleIds.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#1E201E] text-white shadow-xs'
                : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
            }`}
          >
            <span>Все</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'all' ? 'bg-[#374151] text-[#A3E635]' : 'bg-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              {articles.length}
            </span>
          </button>

          {categoriesWithCount.map(({ name, count }) => (
            <button
              key={name}
              onClick={() => setSelectedCategory(name)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === name
                  ? 'bg-[#1E201E] text-white shadow-xs'
                  : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
              }`}
            >
              <span>{name}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  selectedCategory === name ? 'bg-[#374151] text-[#A3E635]' : 'bg-[#E5E7EB] text-[#6B7280]'
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Active Favorites Banner */}
        {onlyFavorites && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <Heart className="w-3.5 h-3.5 text-[#EF4444] fill-current shrink-0" />
              <span className="text-[#991B1B] text-[11px] font-medium">Фильтр:</span>
              <span className="font-bold text-[#991B1B] bg-white px-2 py-0.5 rounded border border-[#FECACA] text-xs truncate">
                Только избранные статьи
              </span>
              <span className="text-[#B91C1C] text-[11px] font-mono shrink-0">
                (в списке: <strong>{sortedArticles.length}</strong> из {favoriteArticleIds.length})
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
              <span className="text-[#4B5563] text-[11px] font-medium">Фильтр по тегу:</span>
              <span className="font-mono font-bold text-[#1E201E] bg-white px-2 py-0.5 rounded border border-[#84CC16]/30 text-xs truncate">
                #{selectedTag}
              </span>
              <span className="text-[#6B7280] text-[11px] font-mono shrink-0">
                (найдено: <strong>{sortedArticles.length}</strong>)
              </span>
            </div>
            <button
              onClick={() => setSelectedTag(null)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DC2626] hover:bg-[#DC2626]/10 px-2 py-1 rounded-lg cursor-pointer transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
              Сбросить
            </button>
          </div>
        )}

        {/* Tag Filters Section */}
        <div className="space-y-2 pt-2 border-t border-[#F3F4F6] text-xs">
          {/* Sub-tabs for Tag Filtering */}
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
                onClick={() => setTagFilterMode('status')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  tagFilterMode === 'status'
                    ? 'bg-white text-[#DC2626] font-bold shadow-2xs'
                    : 'text-[#6B7280] hover:text-[#1E201E]'
                }`}
              >
                <AlertTriangle className="w-2.5 h-2.5" />
                Статусы регламента
              </button>
              <button
                onClick={() => setTagFilterMode('category')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  tagFilterMode === 'category'
                    ? 'bg-white text-[#1E201E] font-bold shadow-2xs'
                    : 'text-[#6B7280] hover:text-[#1E201E]'
                }`}
              >
                <Package className="w-2.5 h-2.5" />
                Категории и темы
              </button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setIsBrowseTagsOpen(true)}
                className="text-[11px] font-medium text-[#4B5563] hover:text-[#1E201E] bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#E5E7EB] px-2.5 py-1 rounded-xl transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Tag className="w-3 h-3 text-[#84CC16]" />
                Все теги ({allTagsWithCount.length}) ▾
              </button>
              <div className="text-[11px] text-[#6B7280] font-mono shrink-0 hidden sm:block">
                Статей: <strong>{sortedArticles.length}</strong> / {articles.length}
              </div>
            </div>
          </div>

          {/* Quick Tag Pills Row based on active mode */}
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
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                        isSelected
                          ? 'bg-[#84CC16] text-[#1E201E] font-bold shadow-2xs'
                          : 'bg-[#F9FAFB] text-[#4B5563] hover:bg-[#F3F4F6] border border-[#E5E7EB]'
                      }`}
                    >
                      <Tag className="w-2.5 h-2.5" />
                      <span>#{tag}</span>
                    </button>
                  );
                })}
              </>
            )}

            {tagFilterMode === 'status' && (
              <>
                <span className="text-[#DC2626] font-mono shrink-0 uppercase tracking-wider font-semibold mr-1">
                  Статусы:
                </span>
                {STATUS_FILTER_PRESETS.map(({ tag, label }) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(isSelected ? null : tag)}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0 font-medium ${
                        isSelected
                          ? 'bg-[#DC2626] text-white font-bold shadow-2xs'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      <span>{label}</span>
                    </button>
                  );
                })}
              </>
            )}

            {tagFilterMode === 'category' && (
              <>
                <span className="text-[#65A30D] font-mono shrink-0 uppercase tracking-wider font-semibold mr-1">
                  Темы:
                </span>
                {CATEGORY_FILTER_PRESETS.map(({ tag, label }) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(isSelected ? null : tag)}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0 font-medium ${
                        isSelected
                          ? 'bg-[#84CC16] text-[#1E201E] font-bold shadow-2xs'
                          : 'bg-[#F9FAFB] text-[#374151] hover:bg-[#F3F4F6] border border-[#E5E7EB]'
                      }`}
                    >
                      <span>{label}</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: Grid Cards */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {sortedArticles.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-[#E5E7EB] text-sm text-[#9CA3AF] space-y-2">
              <Search className="w-8 h-8 mx-auto text-[#D1D5DB]" />
              <p>По заданным параметрам поиска и фильтрации ничего не найдено</p>
              {isFiltered && (
                <button
                  onClick={resetAllFilters}
                  className="px-4 py-1.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1E201E] text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Сбросить фильтры
                </button>
              )}
            </div>
          ) : (
            sortedArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => setSelectedArticleId(article.id)}
                className="bg-white border border-[#E5E7EB] hover:border-[#84CC16] rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#1E201E] group-hover:bg-[#84CC16] transition-colors">
                        #{article.code}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setVersionHistoryArticle(article);
                        }}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F3F4F6] hover:bg-[#84CC16]/20 text-[#4B5563] hover:text-[#1E201E] border border-[#E5E7EB] flex items-center gap-1 transition-colors cursor-pointer"
                        title="История версий регламента"
                      >
                        <History className="w-2.5 h-2.5 text-[#84CC16]" />
                        <span>v.{article.version || (article.versions?.length || 1)}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory(article.category);
                        }}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] border border-[#E5E7EB] transition-colors"
                        title={`Фильтровать по категории «${article.category}»`}
                      >
                        {article.category}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteArticle(article.id);
                        }}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isFavoriteArticle(article.id)
                            ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA] hover:bg-[#FEE2E2]'
                            : 'bg-[#F9FAFB] text-[#9CA3AF] border-[#E5E7EB] hover:text-[#EF4444] hover:bg-[#FEF2F2]'
                        }`}
                        title={isFavoriteArticle(article.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavoriteArticle(article.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#1E201E] group-hover:text-[#65A30D] transition-colors leading-snug font-['Manrope']">
                    {article.title}
                  </h3>

                  <p className="text-xs text-[#4B5563] line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>

                  {/* Key Numbers chips */}
                  {article.keyNumbers && article.keyNumbers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {article.keyNumbers.slice(0, 3).map((kn, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151]"
                        >
                          <span className="text-[#9CA3AF]">{kn.label}:</span>
                          <strong className="text-[#1E201E] font-semibold">{kn.value}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Has OKK rules indicator */}
                  {article.rules && article.rules.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-[#DC2626] font-medium pt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{article.rules.length} {article.rules.length === 1 ? 'правило ОКК' : 'правила ОКК'}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-[#F3F4F6] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 max-w-[200px]">
                    {article.tags.slice(0, 2).map((t) => {
                      const isStatus =
                        t.includes('штраф') ||
                        t.includes('срочн') ||
                        t.includes('актуал') ||
                        t.includes('запрет');
                      const isSelected = selectedTag === t;
                      return (
                        <button
                          key={t}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTag(isSelected ? null : t);
                          }}
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md transition-all shrink-0 cursor-pointer ${
                            isSelected
                              ? 'bg-[#84CC16] text-[#1E201E] font-bold shadow-2xs'
                              : isStatus
                              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                              : 'bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563]'
                          }`}
                          title={`Фильтровать по тегу #${t}`}
                        >
                          #{t}
                        </button>
                      );
                    })}
                    {article.tags.length > 2 && (
                      <span className="text-[10px] text-[#9CA3AF] font-mono shrink-0">
                        +{article.tags.length - 2}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTagAssignArticle(article);
                      }}
                      className="text-[10px] text-[#6B7280] hover:text-[#1E201E] hover:bg-[#F3F4F6] p-1 rounded-md transition-colors cursor-pointer shrink-0 flex items-center gap-0.5 border border-dashed border-[#D1D5DB] hover:border-[#84CC16]"
                      title="Присвоить или изменить теги статьи"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <Tag className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedArticleId(article.id);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#65A30D] hover:underline cursor-pointer shrink-0 ml-auto"
                  >
                    Читать <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW MODE 2: Compact Table List with interactive sortable headers */}
      {viewMode === 'table' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold select-none">
                  <th
                    onClick={() => handleColumnSort('code')}
                    className="py-3 px-4 font-mono w-20 cursor-pointer hover:bg-[#F3F4F6] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Код</span>
                      {sortKey === 'code' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#84CC16]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#84CC16]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-[#9CA3AF]" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleColumnSort('title')}
                    className="py-3 px-4 cursor-pointer hover:bg-[#F3F4F6] transition-colors min-w-[220px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Регламент / Название</span>
                      {sortKey === 'title' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#84CC16]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#84CC16]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-[#9CA3AF]" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleColumnSort('category')}
                    className="py-3 px-4 cursor-pointer hover:bg-[#F3F4F6] transition-colors w-44"
                  >
                    <div className="flex items-center gap-1">
                      <span>Категория</span>
                      {sortKey === 'category' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#84CC16]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#84CC16]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-[#9CA3AF]" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 min-w-[240px]">Суть / Нормативы</th>
                  <th className="py-3 px-4 w-36">Теги</th>
                  <th className="py-3 px-4 text-right w-28">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {sortedArticles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#9CA3AF]">
                      По заданным критериям ничего не найдено
                    </td>
                  </tr>
                ) : (
                  sortedArticles.map((article) => (
                    <tr
                      key={article.id}
                      onClick={() => setSelectedArticleId(article.id)}
                      className="hover:bg-[#F9FAFB] cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#1E201E]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-[#F3F4F6] group-hover:bg-[#84CC16] transition-colors">
                            #{article.code}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setVersionHistoryArticle(article);
                            }}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F3F4F6] hover:bg-[#84CC16]/20 text-[#4B5563] hover:text-[#1E201E] border border-[#E5E7EB] flex items-center gap-1 transition-colors cursor-pointer"
                            title="История версий регламента"
                          >
                            <History className="w-2.5 h-2.5 text-[#84CC16]" />
                            <span>v.{article.version || (article.versions?.length || 1)}</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1E201E] group-hover:text-[#65A30D] transition-colors font-['Manrope']">
                          {article.title}
                        </div>
                        {article.rules && article.rules.length > 0 && (
                          <div className="text-[10px] text-[#DC2626] font-medium flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Штраф ОКК за нарушение</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(article.category);
                          }}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] border border-[#E5E7EB] transition-colors"
                        >
                          {article.category}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-[#4B5563]">
                        <div className="line-clamp-2 leading-relaxed">
                          {article.summary}
                        </div>
                        {article.keyNumbers && article.keyNumbers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {article.keyNumbers.map((kn, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-mono px-1.5 py-0.2 bg-white border border-[#E5E7EB] rounded text-[#1E201E]"
                              >
                                {kn.label}: <strong>{kn.value}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#6B7280]">
                        <div className="flex items-center flex-wrap gap-1 max-w-[160px]">
                          {article.tags.slice(0, 2).map((t) => {
                            const isStatus =
                              t.includes('штраф') ||
                              t.includes('срочн') ||
                              t.includes('актуал') ||
                              t.includes('запрет');
                            const isSelected = selectedTag === t;
                            return (
                              <button
                                key={t}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTag(isSelected ? null : t);
                                }}
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#84CC16] text-[#1E201E] font-bold shadow-2xs'
                                    : isStatus
                                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                    : 'bg-[#F3F4F6] hover:bg-[#84CC16] hover:text-[#1E201E]'
                                }`}
                              >
                                #{t}
                              </button>
                            );
                          })}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTagAssignArticle(article);
                            }}
                            className="text-[10px] text-[#9CA3AF] hover:text-[#1E201E] p-0.5 hover:bg-[#E5E7EB] rounded cursor-pointer border border-dashed border-[#D1D5DB] hover:border-[#84CC16]"
                            title="Присвоить тег"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteArticle(article.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors inline-block mr-1 cursor-pointer ${
                            isFavoriteArticle(article.id)
                              ? 'text-[#EF4444] hover:bg-[#FEE2E2]'
                              : 'text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#FEF2F2]'
                          }`}
                          title={isFavoriteArticle(article.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFavoriteArticle(article.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopySummary(article);
                          }}
                          className="p-1.5 text-[#6B7280] hover:text-[#1E201E] hover:bg-[#E5E7EB] rounded-lg transition-colors inline-block mr-1"
                          title="Скопировать выжимку"
                        >
                          {copiedId === article.id ? (
                            <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedArticleId(article.id);
                          }}
                          className="px-2 py-1 text-xs font-semibold text-[#65A30D] hover:bg-[#F7FEE7] rounded-lg transition-colors inline-flex items-center gap-0.5"
                        >
                          Открыть <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Article Detail Drawer / Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[90vh] bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#1E201E] text-white">
                    Раздел {activeArticle.code}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCategory(activeArticle.category);
                      setSelectedArticleId(null);
                    }}
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] transition-colors"
                  >
                    {activeArticle.category}
                  </button>
                  <button
                    onClick={() => setVersionHistoryArticle(activeArticle)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F3F4F6] hover:bg-[#84CC16]/20 text-[#374151] hover:text-[#1E201E] border border-[#D1D5DB] hover:border-[#84CC16] text-xs font-semibold transition-colors cursor-pointer"
                    title="Просмотреть историю версий и изменений статьи"
                  >
                    <History className="w-3.5 h-3.5 text-[#84CC16]" />
                    <span>v.{activeArticle.version || (activeArticle.versions?.length || 1)}</span>
                    <span className="text-[#9CA3AF]">·</span>
                    <span className="text-[11px] text-[#6B7280]">История версий</span>
                  </button>
                </div>
                <h2 className="text-xl font-bold text-[#1E201E] font-['Manrope']">
                  {activeArticle.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavoriteArticle(activeArticle.id)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                    isFavoriteArticle(activeArticle.id)
                      ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA] hover:bg-[#FEE2E2]'
                      : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:text-[#EF4444] hover:bg-[#FEF2F2]'
                  }`}
                  title={isFavoriteArticle(activeArticle.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                >
                  <Heart className={`w-4 h-4 ${isFavoriteArticle(activeArticle.id) ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">
                    {isFavoriteArticle(activeArticle.id) ? 'В избранном' : 'В избранное'}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedArticleId(null)}
                  className="w-8 h-8 rounded-full bg-[#E5E7EB] hover:bg-[#D1D5DB] flex items-center justify-center text-[#4B5563] shrink-0 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              {/* Summary box */}
              <div className="p-4 rounded-2xl bg-[#F3F4F6] border border-[#E5E7EB]">
                <div className="text-xs font-mono uppercase text-[#6B7280] font-semibold mb-1">
                  Суть регламента:
                </div>
                <p className="text-sm font-medium text-[#1E201E] leading-relaxed">
                  {activeArticle.summary}
                </p>
              </div>

              {/* Key numbers */}
              {activeArticle.keyNumbers && activeArticle.keyNumbers.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#9CA3AF] font-bold mb-2">
                    Нормативы и цифры:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {activeArticle.keyNumbers.map((kn, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] shadow-2xs"
                      >
                        <div className="text-[11px] text-[#6B7280]">{kn.label}</div>
                        <div className="text-sm font-bold text-[#1E201E] mt-0.5 font-mono">
                          {kn.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Points */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#9CA3AF] font-bold mb-2">
                  Подробные положения:
                </h4>
                <div className="space-y-2">
                  {activeArticle.content.map((point, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAFAFA] border border-[#F3F4F6] text-[#374151]"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#84CC16] mt-2 shrink-0" />
                      <p className="leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules / Penalties */}
              {activeArticle.rules && activeArticle.rules.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#DC2626]">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Строгие запреты и штрафы ОКК:</span>
                  </div>
                  <ul className="space-y-1.5 pl-5 list-disc text-xs text-[#991B1B]">
                    {activeArticle.rules.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags & Statuses Management Panel */}
              <div className="pt-3 border-t border-[#F3F4F6] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#4B5563] flex items-center gap-1.5 uppercase font-mono tracking-wider text-[11px]">
                    <Tag className="w-3.5 h-3.5 text-[#84CC16]" />
                    Теги и статусы регламента:
                  </span>
                  <button
                    onClick={() => setTagAssignArticle(activeArticle)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#1E201E] bg-[#F3F4F6] hover:bg-[#84CC16] rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Управление тегами
                  </button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeArticle.tags.length === 0 ? (
                    <span className="text-xs text-[#9CA3AF] italic">Теги еще не присвоены этой статье</span>
                  ) : (
                    activeArticle.tags.map((tag) => {
                      const isStatus =
                        tag.includes('штраф') ||
                        tag.includes('срочн') ||
                        tag.includes('актуал') ||
                        tag.includes('запрет');
                      return (
                        <div
                          key={tag}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            isStatus
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-[#F9FAFB] text-[#374151] border-[#E5E7EB]'
                          }`}
                        >
                          <button
                            onClick={() => {
                              setSelectedTag(tag);
                              setSelectedArticleId(null);
                            }}
                            className="hover:underline font-mono text-[11px]"
                            title="Фильтровать базу знаний по этому тегу"
                          >
                            #{tag}
                          </button>
                          <button
                            onClick={() => {
                              const newTags = activeArticle.tags.filter((t) => t !== tag);
                              updateArticle(activeArticle.id, { tags: newTags });
                            }}
                            className="w-3.5 h-3.5 rounded-full hover:bg-black/10 flex items-center justify-center text-inherit cursor-pointer ml-0.5"
                            title="Удалить тег из статьи"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      );
                    })
                  )}

                  <button
                    onClick={() => setTagAssignArticle(activeArticle)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#6B7280] hover:text-[#1E201E] bg-white border border-dashed border-[#D1D5DB] hover:border-[#84CC16] rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Добавить тег
                  </button>
                </div>

                {/* Quick 1-Click Status Toggles */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-[#9CA3AF] font-mono">Быстрый статус:</span>
                  {[
                    { tag: 'штраф окк', label: 'Штраф ОКК ⚠️', isDanger: true },
                    { tag: 'актуально', label: 'Актуально 🟢' },
                    { tag: 'срочно', label: 'Срочно 🔥', isDanger: true },
                    { tag: 'важно', label: 'Важно 📌' }
                  ].map(({ tag, label, isDanger }) => {
                    const hasTag = activeArticle.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          const newTags = hasTag
                            ? activeArticle.tags.filter((t) => t !== tag)
                            : [...activeArticle.tags, tag];
                          updateArticle(activeArticle.id, { tags: newTags });
                        }}
                        className={`text-[11px] px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 border ${
                          hasTag
                            ? isDanger
                              ? 'bg-[#DC2626] text-white border-[#DC2626] font-bold'
                              : 'bg-[#84CC16] text-[#1E201E] border-[#84CC16] font-bold'
                            : 'bg-[#F9FAFB] text-[#6B7280] hover:bg-[#F3F4F6] border-[#E5E7EB]'
                        }`}
                      >
                        {hasTag ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 py-3.5 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopySummary(activeArticle)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] text-[#374151] rounded-xl transition-colors shadow-2xs cursor-pointer"
                >
                  {copiedId === activeArticle.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#059669]" /> Скопировано!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Скопировать выжимку
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVersionHistoryArticle(activeArticle)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1E201E] bg-[#84CC16]/20 hover:bg-[#84CC16]/30 border border-[#84CC16]/40 rounded-xl transition-colors cursor-pointer"
                  title="История изменений и откат версий"
                >
                  <History className="w-3.5 h-3.5 text-[#4D7C0F]" />
                  <span>История (v.{activeArticle.version || (activeArticle.versions?.length || 1)})</span>
                </button>

                <button
                  onClick={() => {
                    onEditArticle(activeArticle);
                    setSelectedArticleId(null);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#1E201E] bg-[#E5E7EB] hover:bg-[#D1D5DB] rounded-xl transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Редактировать
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Удалить статью «${activeArticle.title}»?`)) {
                      deleteArticle(activeArticle.id);
                      setSelectedArticleId(null);
                    }
                  }}
                  className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl transition-colors cursor-pointer"
                  title="Удалить статью"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tag Assignment Modal */}
      <TagAssignModal
        article={tagAssignArticle}
        isOpen={!!tagAssignArticle}
        onClose={() => setTagAssignArticle(null)}
        onUpdateTags={(articleId, newTags) => {
          updateArticle(articleId, { tags: newTags });
          if (tagAssignArticle && tagAssignArticle.id === articleId) {
            setTagAssignArticle({ ...tagAssignArticle, tags: newTags });
          }
        }}
        allExistingTags={allExistingTags}
      />

      {/* Full Tag Browser Modal */}
      {isBrowseTagsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[85vh] bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#84CC16]" />
                <h3 className="font-bold text-base text-[#1E201E]">Все теги базы знаний</h3>
                <span className="text-xs font-mono bg-[#E5E7EB] text-[#4B5563] px-2 py-0.5 rounded-full">
                  {allTagsWithCount.length}
                </span>
              </div>
              <button
                onClick={() => setIsBrowseTagsOpen(false)}
                className="p-1 rounded-lg hover:bg-[#E5E7EB] text-[#6B7280] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-[#E5E7EB]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={browseTagsSearch}
                  onChange={(e) => setBrowseTagsSearch(e.target.value)}
                  placeholder="Поиск тега..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#84CC16] focus:bg-white"
                />
              </div>
            </div>

            <div className="p-5 overflow-y-auto max-h-[50vh]">
              <div className="flex flex-wrap gap-2">
                {allTagsWithCount
                  .filter(({ tag }) => !browseTagsSearch || tag.toLowerCase().includes(browseTagsSearch.toLowerCase()))
                  .map(({ tag, count }) => {
                    const isSelected = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTag(isSelected ? null : tag);
                          setIsBrowseTagsOpen(false);
                        }}
                        className={`text-xs px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-[#84CC16] text-[#1E201E] border-[#84CC16] font-bold shadow-2xs'
                            : 'bg-[#F9FAFB] text-[#374151] hover:bg-[#F3F4F6] border-[#E5E7EB]'
                        }`}
                      >
                        <span className="font-mono">#{tag}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-[#1E201E] text-[#84CC16]' : 'bg-[#E5E7EB] text-[#6B7280]'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end">
              <button
                onClick={() => setIsBrowseTagsOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-[#1E201E] text-white rounded-xl hover:bg-black cursor-pointer transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Version History Modal */}
      <ArticleVersionHistoryModal
        isOpen={!!versionHistoryArticle}
        onClose={() => setVersionHistoryArticle(null)}
        article={versionHistoryArticle}
      />
    </div>
  );
};
