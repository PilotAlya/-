import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { KBArticle, ScriptItem, GlossaryTerm } from '../types';
import { X, Plus, Save, Tag, Check, AlertTriangle, Sparkles, Flame, History, Clock } from 'lucide-react';
import { TAG_PRESETS } from './TagAssignModal';
import { SCRIPT_TAG_PRESETS } from './ScriptTagAssignModal';
import { ArticleVersionHistoryModal } from './ArticleVersionHistoryModal';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: KBArticle | ScriptItem | GlossaryTerm | null;
  initialType?: 'article' | 'script' | 'glossary';
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  editItem,
  initialType = 'article'
}) => {
  const {
    addArticle,
    updateArticle,
    addScript,
    updateScript,
    addGlossaryTerm,
    updateGlossaryTerm
  } = useDatabase();

  const [type, setType] = useState<'article' | 'script' | 'glossary'>(initialType);

  // Article fields
  const [artCode, setArtCode] = useState('');
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState('');
  const [artSummary, setArtSummary] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artRules, setArtRules] = useState('');
  const [artTags, setArtTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [artChangeSummary, setArtChangeSummary] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Script fields
  const [scTitle, setScTitle] = useState('');
  const [scCategory, setScCategory] = useState<ScriptItem['category']>('start');
  const [scCategoryLabel, setScCategoryLabel] = useState('Старт');
  const [scWhen, setScWhen] = useState('');
  const [scTemplate, setScTemplate] = useState('');
  const [scIsService, setScIsService] = useState(false);
  const [scTags, setScTags] = useState<string[]>([]);
  const [scTagInput, setScTagInput] = useState('');

  // Glossary fields
  const [glTerm, setGlTerm] = useState('');
  const [glCategory, setGlCategory] = useState<GlossaryTerm['category']>('Инструменты');
  const [glDefinition, setGlDefinition] = useState('');
  const [glNote, setGlNote] = useState('');

  // Pre-fill on edit
  useEffect(() => {
    if (editItem) {
      if ('code' in editItem) {
        setType('article');
        setArtCode(editItem.code);
        setArtTitle(editItem.title);
        setArtCategory(editItem.category);
        setArtSummary(editItem.summary);
        setArtContent(editItem.content.join('\n'));
        setArtRules((editItem.rules || []).join('\n'));
        setArtTags(editItem.tags || []);
        setTagInput('');
        setArtChangeSummary('');
      } else if ('template' in editItem) {
        setType('script');
        setScTitle(editItem.title);
        setScCategory(editItem.category);
        setScCategoryLabel(editItem.categoryLabel);
        setScWhen(editItem.when);
        setScTemplate(editItem.template);
        setScIsService(!!editItem.isService);
        setScTags(editItem.tags || []);
        setScTagInput('');
      } else if ('definition' in editItem) {
        setType('glossary');
        setGlTerm(editItem.term);
        setGlCategory(editItem.category);
        setGlDefinition(editItem.definition);
        setGlNote(editItem.exampleOrNote || '');
      }
    } else {
      setType(initialType);
      // reset defaults
      setArtCode('');
      setArtTitle('');
      setArtCategory('Регламенты');
      setArtSummary('');
      setArtContent('');
      setArtRules('');
      setArtTags([]);
      setTagInput('');

      setScTitle('');
      setScCategory('start');
      setScCategoryLabel('Старт');
      setScWhen('');
      setScTemplate('');
      setScIsService(false);
      setScTags([]);
      setScTagInput('');

      setGlTerm('');
      setGlCategory('Инструменты');
      setGlDefinition('');
      setGlNote('');
    }
  }, [editItem, initialType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'article') {
      if (!artTitle.trim()) return;
      const contentArr = artContent.split('\n').filter((l) => l.trim().length > 0);
      const rulesArr = artRules.split('\n').filter((l) => l.trim().length > 0);
      
      let finalTags = [...artTags];
      if (tagInput.trim()) {
        const extra = tagInput
          .split(',')
          .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
          .filter(Boolean);
        extra.forEach((t) => {
          if (!finalTags.includes(t)) finalTags.push(t);
        });
      }

      if (editItem && 'code' in editItem) {
        updateArticle(
          editItem.id,
          {
            code: artCode || '00',
            title: artTitle,
            category: artCategory || 'Общее',
            summary: artSummary,
            content: contentArr,
            rules: rulesArr,
            tags: finalTags
          },
          artChangeSummary.trim() || 'Обновление регламента'
        );
      } else {
        addArticle({
          code: artCode || '00',
          title: artTitle,
          category: artCategory || 'Общее',
          summary: artSummary,
          content: contentArr,
          rules: rulesArr,
          tags: finalTags
        });
      }
    } else if (type === 'script') {
      if (!scTitle.trim() || !scTemplate.trim()) return;

      let finalTags = [...scTags];
      if (scTagInput.trim()) {
        const extra = scTagInput
          .split(',')
          .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
          .filter(Boolean);
        extra.forEach((t) => {
          if (!finalTags.includes(t)) finalTags.push(t);
        });
      }

      if (editItem && 'template' in editItem) {
        updateScript(editItem.id, {
          title: scTitle,
          category: scCategory,
          categoryLabel: scCategoryLabel,
          when: scWhen,
          template: scTemplate,
          variables: editItem.variables || [],
          isService: scIsService,
          tags: finalTags
        });
      } else {
        addScript({
          title: scTitle,
          category: scCategory,
          categoryLabel: scCategoryLabel,
          when: scWhen,
          template: scTemplate,
          variables: [],
          isService: scIsService,
          tags: finalTags
        });
      }
    } else if (type === 'glossary') {
      if (!glTerm.trim() || !glDefinition.trim()) return;
      if (editItem && 'definition' in editItem) {
        updateGlossaryTerm(editItem.id, {
          term: glTerm,
          category: glCategory,
          definition: glDefinition,
          exampleOrNote: glNote
        });
      } else {
        addGlossaryTerm({
          term: glTerm,
          category: glCategory,
          definition: glDefinition,
          exampleOrNote: glNote
        });
      }
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
      style={{
        paddingTop: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
        paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))'
      }}
    >
      <div className="w-full max-w-xl bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
          <h3 className="text-base font-bold text-[#1E201E] font-['Manrope']">
            {editItem ? 'Редактирование записи' : 'Создать новую запись в базе'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#E5E7EB] hover:bg-[#D1D5DB] flex items-center justify-center text-[#4B5563]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Switcher (only for new items) */}
        {!editItem && (
          <div className="px-6 pt-4 pb-1">
            <div className="flex rounded-xl bg-[#F3F4F6] p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setType('article')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  type === 'article' ? 'bg-white text-[#1E201E] shadow-2xs' : 'text-[#6B7280]'
                }`}
              >
                Статья базы знаний
              </button>
              <button
                type="button"
                onClick={() => setType('script')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  type === 'script' ? 'bg-white text-[#1E201E] shadow-2xs' : 'text-[#6B7280]'
                }`}
              >
                Скрипт Sherlock
              </button>
              <button
                type="button"
                onClick={() => setType('glossary')}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  type === 'glossary' ? 'bg-white text-[#1E201E] shadow-2xs' : 'text-[#6B7280]'
                }`}
              >
                Термин глоссария
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {type === 'article' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4B5563] mb-1">Номер раздела</label>
                  <input
                    type="text"
                    placeholder="28"
                    value={artCode}
                    onChange={(e) => setArtCode(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#4B5563] mb-1">Категория</label>
                  <input
                    type="text"
                    placeholder="Регламенты"
                    value={artCategory}
                    onChange={(e) => setArtCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4B5563] mb-1">Заголовок статьи</label>
                <input
                  type="text"
                  placeholder="Например: Особенности доставки в Казахстан"
                  value={artTitle}
                  onChange={(e) => setArtTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4B5563] mb-1">Краткая суть (1-2 предложения)</label>
                <textarea
                  rows={2}
                  placeholder="Основная мысль раздела..."
                  value={artSummary}
                  onChange={(e) => setArtSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4B5563] mb-1">
                  Подробные пункты (каждый с новой строки)
                </label>
                <textarea
                  rows={4}
                  placeholder="Пункт 1&#10;Пункт 2"
                  value={artContent}
                  onChange={(e) => setArtContent(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4B5563] mb-1">
                  Строгие запреты и штрафы ОКК (по строкам)
                </label>
                <textarea
                  rows={2}
                  placeholder="Запрещено дезинформировать о сроках..."
                  value={artRules}
                  onChange={(e) => setArtRules(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-[#4B5563]">
                  Теги статьи (категории и статусы для быстрой фильтрации)
                </label>

                {/* Assigned Tag Chips */}
                {artTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl">
                    {artTags.map((tag) => {
                      const isStatus =
                        tag.includes('штраф') ||
                        tag.includes('срочн') ||
                        tag.includes('актуал') ||
                        tag.includes('запрет');
                      return (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            isStatus
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-white text-[#1E201E] border-[#D1D5DB]'
                          }`}
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => setArtTags((prev) => prev.filter((t) => t !== tag))}
                            className="w-3.5 h-3.5 rounded-full hover:bg-black/10 flex items-center justify-center text-inherit cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Tag Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] font-mono">
                      #
                    </span>
                    <input
                      type="text"
                      placeholder="введите тег и нажмите Enter (например: доставка, сбп, отмена)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          const val = tagInput.trim().toLowerCase().replace(/^#/, '');
                          if (val && !artTags.includes(val)) {
                            setArtTags((prev) => [...prev, val]);
                            setTagInput('');
                          }
                        }
                      }}
                      className="w-full pl-7 pr-3 py-2 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16] text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const val = tagInput.trim().toLowerCase().replace(/^#/, '');
                      if (val && !artTags.includes(val)) {
                        setArtTags((prev) => [...prev, val]);
                        setTagInput('');
                      }
                    }}
                    disabled={!tagInput.trim()}
                    className="px-3 py-2 bg-[#1E201E] hover:bg-[#374151] disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Добавить
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-[#6B7280] font-medium block">
                    Быстрые пресеты (нажмите, чтобы присвоить):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {TAG_PRESETS.slice(0, 10).map(({ tag, label, colorClass }) => {
                      const isSelected = artTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setArtTags((prev) => prev.filter((t) => t !== tag));
                            } else {
                              setArtTags((prev) => [...prev, tag]);
                            }
                          }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#1E201E] text-white border-[#1E201E]'
                              : colorClass
                          }`}
                        >
                          <span>{label}</span>
                          {isSelected && <Check className="w-2.5 h-2.5 text-[#A3E635]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {type === 'script' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4B5563] mb-1">Название скрипта</label>
                  <input
                    type="text"
                    placeholder="Например: Извинение за задержку"
                    value={scTitle}
                    onChange={(e) => setScTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#4B5563] mb-1">Категория</label>
                  <select
                    value={scCategory}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setScCategory(val);
                      const labels: Record<string, string> = {
                        start: 'Старт',
                        otmena: 'Отмена',
                        dostavka: 'Доставка',
                        promo: 'Промокод',
                        oplata: 'Оплата',
                        tovar: 'Товар',
                        tech: 'Техника',
                        third: 'Третье лицо',
                        empathy: 'Эмпатия',
                        hard: 'Сложные клиенты',
                        service: 'Служебное'
                      };
                      setScCategoryLabel(labels[val] || 'Скрипт');
                    }}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16] bg-white"
                  >
                    <option value="start">Старт</option>
                    <option value="otmena">Отмена</option>
                    <option value="dostavka">Доставка</option>
                    <option value="promo">Промокод</option>
                    <option value="oplata">Оплата</option>
                    <option value="tovar">Товар</option>
                    <option value="tech">Техника</option>
                    <option value="third">Третье лицо</option>
                    <option value="empathy">Эмпатия</option>
                    <option value="hard">Сложные клиенты</option>
                    <option value="service">Служебное</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#4B5563] mb-1">Когда применять</label>
                <input
                  type="text"
                  placeholder="Когда: клиент возмущен задержкой курьера..."
                  value={scWhen}
                  onChange={(e) => setScWhen(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4B5563] mb-1">
                  Текст сообщения (используйте [Имя], [Сумма], [Номер Заказа])
                </label>
                <textarea
                  rows={5}
                  placeholder="Добрый день, [Имя]! Приношу извинения..."
                  value={scTemplate}
                  onChange={(e) => setScTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                  required
                />
              </div>

              {/* Script Tags Selection */}
              <div className="space-y-2 pt-2 border-t border-[#F3F4F6]">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#4B5563] text-xs flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[#84CC16]" />
                    Теги скрипта (продукты и сценарии):
                  </label>
                  {scTags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setScTags([])}
                      className="text-[11px] text-[#DC2626] hover:underline"
                    >
                      Очистить
                    </button>
                  )}
                </div>

                {/* Selected tags badges */}
                {scTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                    {scTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-white text-[#1E201E] border border-[#D1D5DB] shadow-2xs"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => setScTags((prev) => prev.filter((t) => t !== tag))}
                          className="w-3.5 h-3.5 rounded-full hover:bg-black/10 flex items-center justify-center text-inherit cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Custom tag input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-xs font-mono">
                      #
                    </span>
                    <input
                      type="text"
                      placeholder="введите тег (например: возврат, курьер)..."
                      value={scTagInput}
                      onChange={(e) => setScTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = scTagInput.trim().toLowerCase().replace(/^#/, '');
                          if (val && !scTags.includes(val)) {
                            setScTags((prev) => [...prev, val]);
                            setScTagInput('');
                          }
                        }
                      }}
                      className="w-full pl-7 pr-3 py-1.5 text-xs border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16] bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!scTagInput.trim()}
                    onClick={() => {
                      const val = scTagInput.trim().toLowerCase().replace(/^#/, '');
                      if (val && !scTags.includes(val)) {
                        setScTags((prev) => [...prev, val]);
                        setScTagInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#1E201E] text-white disabled:opacity-40 rounded-xl text-xs font-bold hover:bg-[#374151] transition-colors cursor-pointer shrink-0"
                  >
                    + Добавить
                  </button>
                </div>

                {/* Quick Presets for Scripts */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-[#6B7280]">
                    Быстрые пресеты сценариев и продуктов:
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-[#F9FAFB] rounded-xl border border-[#F3F4F6]">
                    {SCRIPT_TAG_PRESETS.map(({ tag, label, colorClass }) => {
                      const isSelected = scTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setScTags((prev) => prev.filter((t) => t !== tag));
                            } else {
                              setScTags((prev) => [...prev, tag]);
                            }
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#1E201E] text-white border-[#1E201E]'
                              : colorClass
                          }`}
                        >
                          <span>{label}</span>
                          {isSelected && <Check className="w-2.5 h-2.5 text-[#A3E635]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sc-service"
                  checked={scIsService}
                  onChange={(e) => setScIsService(e.target.checked)}
                  className="accent-[#84CC16]"
                />
                <label htmlFor="sc-service" className="text-xs text-[#4B5563] cursor-pointer">
                  Служебная памятка (внутренний чек-лист, клиенту не отправлять)
                </label>
              </div>
            </>
          )}

          {type === 'glossary' && (
            <>
              <div>
                <label className="block font-semibold text-[#4B5563] mb-1">Термин или сокращение</label>
                <input
                  type="text"
                  placeholder="Например: VDI"
                  value={glTerm}
                  onChange={(e) => setGlTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4B5563] mb-1">Категория</label>
                <select
                  value={glCategory}
                  onChange={(e) => setGlCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16] bg-white"
                >
                  <option value="Инструменты">Инструменты</option>
                  <option value="Процессы">Процессы</option>
                  <option value="Роли">Роли</option>
                  <option value="Организации">Организации</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#4B5563] mb-1">Определение и назначение</label>
                <textarea
                  rows={3}
                  placeholder="Описание термина..."
                  value={glDefinition}
                  onChange={(e) => setGlDefinition(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4B5563] mb-1">Примечание / пример</label>
                <input
                  type="text"
                  placeholder="Важная деталь..."
                  value={glNote}
                  onChange={(e) => setGlNote(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                />
              </div>
            </>
          )}

          <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-[#1E201E] bg-[#84CC16] hover:bg-[#65A30D] rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" /> Сохранить в базу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
