import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { KBArticle, ScriptItem } from '../types';
import {
  Heart,
  BookOpen,
  MessageSquare,
  Search,
  Copy,
  Check,
  ChevronRight,
  Edit3,
  Sliders,
  AlertTriangle,
  Info,
  Sparkles,
  RotateCcw,
  ArrowRight
} from 'lucide-react';

interface FavoritesViewProps {
  onEditArticle: (article: KBArticle) => void;
  onEditScript: (script: ScriptItem) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  onEditArticle,
  onEditScript
}) => {
  const {
    articles,
    scripts,
    favoriteArticleIds,
    favoriteScriptIds,
    toggleFavoriteArticle,
    toggleFavoriteScript,
    setSelectedArticleId,
    setTab
  } = useDatabase();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'articles' | 'scripts'>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic variable inputs for instant personalization in favorite scripts
  const [clientName, setClientName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [promoAmount, setPromoAmount] = useState('');
  const [deadline, setDeadline] = useState('');

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

  const handleCopyScript = (script: ScriptItem) => {
    const textToCopy = getRenderedText(script.template);
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(script.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCopyArticleSummary = (article: KBArticle) => {
    navigator.clipboard.writeText(`[${article.code}] ${article.title}\n${article.summary}`);
    setCopiedId(article.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Filtered favorite items
  const favArticles = useMemo(() => {
    return articles.filter((a) => favoriteArticleIds.includes(a.id));
  }, [articles, favoriteArticleIds]);

  const favScripts = useMemo(() => {
    return scripts.filter((s) => favoriteScriptIds.includes(s.id));
  }, [scripts, favoriteScriptIds]);

  const filteredFavArticles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return favArticles;
    return favArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [favArticles, search]);

  const filteredFavScripts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return favScripts;
    return favScripts.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.template.toLowerCase().includes(q) ||
        s.when.toLowerCase().includes(q) ||
        s.categoryLabel.toLowerCase().includes(q) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [favScripts, search]);

  const totalFavoritesCount = favArticles.length + favScripts.length;

  // Handler to add recommended starter favorites if empty
  const handleAddRecommended = () => {
    // Add top 2 critical articles (e.g. cancel, courier/delivery)
    const recArticles = articles.slice(0, 3).map((a) => a.id);
    recArticles.forEach((id) => {
      if (!favoriteArticleIds.includes(id)) {
        toggleFavoriteArticle(id);
      }
    });

    // Add top 3 scripts (greeting, cancellation, courier)
    const recScripts = scripts.slice(0, 3).map((s) => s.id);
    recScripts.forEach((id) => {
      if (!favoriteScriptIds.includes(id)) {
        toggleFavoriteScript(id);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#EF4444] shrink-0 shadow-2xs">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#1E201E] font-['Manrope']">
                  Избранное оператора
                </h2>
                <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                  {totalFavoritesCount}
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Личный список быстрого доступа: статьи регламентов и скрипты «Ирис» в 1 клик
              </p>
            </div>
          </div>

          {/* Subtabs */}
          <div className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-xl self-start sm:self-auto text-xs font-medium">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'all'
                  ? 'bg-white text-[#1E201E] font-bold shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#1E201E]'
              }`}
            >
              <span>Все</span>
              <span className="text-[10px] font-mono px-1 rounded-full bg-[#E5E7EB] text-[#4B5563]">
                {totalFavoritesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('articles')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'articles'
                  ? 'bg-white text-[#1E201E] font-bold shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#1E201E]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#84CC16]" />
              <span>Статьи</span>
              <span className="text-[10px] font-mono px-1 rounded-full bg-[#E5E7EB] text-[#4B5563]">
                {favArticles.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('scripts')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'scripts'
                  ? 'bg-white text-[#1E201E] font-bold shadow-2xs'
                  : 'text-[#6B7280] hover:text-[#1E201E]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Скрипты</span>
              <span className="text-[10px] font-mono px-1 rounded-full bg-[#E5E7EB] text-[#4B5563]">
                {favScripts.length}
              </span>
            </button>
          </div>
        </div>

        {/* Search row */}
        {totalFavoritesCount > 0 && (
          <div className="relative pt-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Поиск по избранным статьям и скриптам..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#EF4444] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] hover:text-[#1E201E]"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Variable Autofill Toolbar (visible when scripts exist in favorites) */}
      {favScripts.length > 0 && (activeSubTab === 'all' || activeSubTab === 'scripts') && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#84CC16]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#1E201E]">
                Быстрая подстановка в избранные скрипты
              </h3>
            </div>
            <span className="text-[11px] text-[#6B7280]">
              Значения сразу подставятся во все скрипты ниже
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-[#6B7280] mb-1">
                Имя клиента [Имя]
              </label>
              <input
                type="text"
                placeholder="например, Елена"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#6B7280] mb-1">
                Номер заказа [№]
              </label>
              <input
                type="text"
                placeholder="например, 1098234"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#6B7280] mb-1">
                Сумма промо [Сумма]
              </label>
              <input
                type="text"
                placeholder="например, 500"
                value={promoAmount}
                onChange={(e) => setPromoAmount(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#6B7280] mb-1">
                Срок действия [Срок]
              </label>
              <input
                type="text"
                placeholder="например, до 20.10"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalFavoritesCount === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-3xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#EF4444] mx-auto shadow-sm">
            <Heart className="w-8 h-8 fill-current" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-[#1E201E] font-['Manrope']">
              Список избранного пока пуст
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
              Нажмите на иконку сердечка <Heart className="w-3.5 h-3.5 inline text-[#EF4444] fill-current" /> на любой статье в Базе знаний или на шаблоне ответа в Скриптах, чтобы сформировать быстрый рабочий набор для звонков и чатов.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => setTab('kb')}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#1E201E] hover:bg-[#374151] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#84CC16]" />
              <span>Перейти в Базу знаний</span>
            </button>

            <button
              onClick={() => setTab('scripts')}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1E201E] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[#3B82F6]" />
              <span>Перейти в Скрипты</span>
            </button>
          </div>

          <div className="pt-4 border-t border-[#F3F4F6]">
            <button
              onClick={handleAddRecommended}
              className="text-xs text-[#DC2626] hover:text-[#B91C1C] hover:underline font-semibold flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Добавить рекомендуемый стартовый набор регламентов и скриптов</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: Favorite Articles */}
          {(activeSubTab === 'all' || activeSubTab === 'articles') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#84CC16]" />
                  <h3 className="text-sm font-bold text-[#1E201E] font-['Manrope']">
                    Избранные статьи ({filteredFavArticles.length})
                  </h3>
                </div>
                {activeSubTab === 'all' && favArticles.length > 0 && (
                  <button
                    onClick={() => setActiveSubTab('articles')}
                    className="text-xs text-[#65A30D] hover:underline font-medium flex items-center gap-0.5"
                  >
                    Все статьи <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {filteredFavArticles.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E7EB] text-xs text-[#9CA3AF]">
                  {search ? 'Статей по запросу не найдено' : 'В избранном нет статей'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredFavArticles.map((article) => {
                    const isCopied = copiedId === article.id;
                    return (
                      <div
                        key={article.id}
                        className="bg-white border border-[#E5E7EB] hover:border-[#84CC16] rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between space-y-3 group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#1E201E] group-hover:bg-[#84CC16] transition-colors">
                                #{article.code}
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563]">
                                {article.category}
                              </span>
                            </div>

                            <button
                              onClick={() => toggleFavoriteArticle(article.id)}
                              className="p-1.5 rounded-xl bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                              title="Удалить из избранного"
                            >
                              <Heart className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>

                          <h4 className="text-base font-bold text-[#1E201E] group-hover:text-[#65A30D] transition-colors leading-snug font-['Manrope']">
                            {article.title}
                          </h4>

                          <p className="text-xs text-[#4B5563] line-clamp-3 leading-relaxed">
                            {article.summary}
                          </p>

                          {article.keyNumbers && article.keyNumbers.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
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

                          {article.rules && article.rules.length > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-[#DC2626] font-medium pt-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{article.rules.length} регламентных правила ОКК</span>
                            </div>
                          )}
                        </div>

                        {/* Card actions */}
                        <div className="pt-2.5 border-t border-[#F3F4F6] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                            {article.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F3F4F6] text-[#4B5563] rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleCopyArticleSummary(article)}
                              className="p-1.5 text-xs text-[#4B5563] hover:text-[#1E201E] hover:bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] transition-colors cursor-pointer"
                              title="Скопировать выжимку регламента"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-[#059669]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => setSelectedArticleId(article.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-[#65A30D] hover:bg-[#F7FEE7] rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Открыть</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: Favorite Scripts */}
          {(activeSubTab === 'all' || activeSubTab === 'scripts') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#3B82F6]" />
                  <h3 className="text-sm font-bold text-[#1E201E] font-['Manrope']">
                    Избранные скрипты ({filteredFavScripts.length})
                  </h3>
                </div>
                {activeSubTab === 'all' && favScripts.length > 0 && (
                  <button
                    onClick={() => setActiveSubTab('scripts')}
                    className="text-xs text-[#3B82F6] hover:underline font-medium flex items-center gap-0.5"
                  >
                    Все скрипты <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {filteredFavScripts.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E7EB] text-xs text-[#9CA3AF]">
                  {search ? 'Скриптов по запросу не найдено' : 'В избранном нет скриптов'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFavScripts.map((script) => {
                    const isCopied = copiedId === script.id;
                    const renderedText = getRenderedText(script.template);

                    return (
                      <div
                        key={script.id}
                        className="bg-white border border-[#E5E7EB] hover:border-[#84CC16] rounded-2xl p-4 md:p-5 shadow-xs transition-all space-y-3"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563]">
                                {script.categoryLabel}
                              </span>
                              {(script.tags || []).slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F9FAFB] border border-[#E5E7EB] text-[#6B7280]"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                            <h4 className="text-base font-bold text-[#1E201E] font-['Manrope']">
                              {script.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyScript(script)}
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
                              className="p-2 rounded-xl bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                              title="Удалить из избранного"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </button>

                            <button
                              onClick={() => onEditScript(script)}
                              className="p-2 text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] transition-colors cursor-pointer"
                              title="Редактировать скрипт"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
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
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
