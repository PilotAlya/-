import React, { useState, useMemo } from 'react';
import { KBArticle } from '../types';
import {
  X,
  Plus,
  Tag,
  Check,
  Search,
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Package,
  CreditCard,
  RotateCcw,
  Percent,
  Star,
  Monitor,
  Globe
} from 'lucide-react';

interface TagAssignModalProps {
  article: KBArticle | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTags: (articleId: string, tags: string[]) => void;
  allExistingTags?: string[];
}

interface TagPreset {
  tag: string;
  label: string;
  type: 'status' | 'category';
  icon?: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

export const TAG_PRESETS: TagPreset[] = [
  // Statuses
  { tag: 'штраф окк', label: 'Штраф ОКК', type: 'status', icon: AlertTriangle, colorClass: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
  { tag: 'актуально', label: 'Актуально', type: 'status', icon: CheckCircle2, colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  { tag: 'срочно', label: 'Срочно', type: 'status', icon: Flame, colorClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
  { tag: 'важно', label: 'Важно', type: 'status', icon: ShieldAlert, colorClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  { tag: 'обновлено', label: 'Обновлено', type: 'status', icon: Sparkles, colorClass: 'bg-lime-50 text-lime-800 border-lime-300 hover:bg-lime-100' },
  { tag: 'запрет', label: 'Строгий запрет', type: 'status', icon: AlertTriangle, colorClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
  { tag: 'на согласовании', label: 'На согласовании', type: 'status', icon: Clock, colorClass: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },

  // Categories / Domains
  { tag: 'доставка', label: 'Доставка', type: 'category', icon: Package, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'оплата', label: 'Оплата / СБП', type: 'category', icon: CreditCard, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'возврат', label: 'Возврат средств', type: 'category', icon: RotateCcw, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'промокоды', label: 'Промокоды / Скидки', type: 'category', icon: Percent, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'лояльность', label: 'Карта лояльности', type: 'category', icon: Star, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'бонусы', label: 'Бонусы АВ', type: 'category', icon: Star, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'нексус', label: '«Нексус» (ERP)', type: 'category', icon: Monitor, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'ирис', label: '«Ирис» (Iris)', type: 'category', icon: Monitor, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'казахстан', label: 'Казахстан (KZ)', type: 'category', icon: Globe, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'беларусь', label: 'Беларусь (BY)', type: 'category', icon: Globe, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' }
];

export const TagAssignModal: React.FC<TagAssignModalProps> = ({
  article,
  isOpen,
  onClose,
  onUpdateTags,
  allExistingTags = []
}) => {
  const [customTagInput, setCustomTagInput] = useState('');
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  if (!isOpen || !article) return null;

  const currentTags = article.tags || [];

  const handleAddTag = (rawTag: string) => {
    const formatted = rawTag.trim().toLowerCase().replace(/^#/, '');
    if (!formatted) return;
    if (currentTags.includes(formatted)) return;

    const newTags = [...currentTags, formatted];
    onUpdateTags(article.id, newTags);
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = currentTags.filter((t) => t !== tagToRemove);
    onUpdateTags(article.id, newTags);
  };

  const handleToggleTag = (tagToToggle: string) => {
    const formatted = tagToToggle.trim().toLowerCase().replace(/^#/, '');
    if (currentTags.includes(formatted)) {
      handleRemoveTag(formatted);
    } else {
      handleAddTag(formatted);
    }
  };

  const statusPresets = TAG_PRESETS.filter((p) => p.type === 'status');
  const categoryPresets = TAG_PRESETS.filter((p) => p.type === 'category');

  // Other tags present in the knowledge base that are not in presets
  const otherExistingTags = allExistingTags.filter(
    (t) => !TAG_PRESETS.some((p) => p.tag === t)
  );

  const filteredOtherTags = tagSearchQuery.trim()
    ? otherExistingTags.filter((t) =>
        t.toLowerCase().includes(tagSearchQuery.trim().toLowerCase())
      )
    : otherExistingTags;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#1E201E] text-white">
                #{article.code}
              </span>
              <span className="text-xs text-[#6B7280] font-medium truncate">
                {article.category}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#1E201E] truncate font-['Manrope']">
              Управление тегами: {article.title}
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Присвойте категории или статус для быстрой фильтрации операторами в чате
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#E5E7EB] hover:bg-[#D1D5DB] flex items-center justify-center text-[#4B5563] shrink-0 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Active Assigned Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1E201E] flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-mono">
                <Tag className="w-3.5 h-3.5 text-[#84CC16]" />
                Присвоенные теги ({currentTags.length}):
              </span>
              {currentTags.length > 0 && (
                <button
                  onClick={() => onUpdateTags(article.id, [])}
                  className="text-[11px] text-[#DC2626] hover:underline"
                >
                  Снять все теги
                </button>
              )}
            </div>

            {currentTags.length === 0 ? (
              <div className="p-3 bg-[#F9FAFB] border border-dashed border-[#D1D5DB] rounded-xl text-center text-[#9CA3AF] text-xs">
                У этой статьи еще нет присвоенных тегов. Выберите из списка ниже или введите свой.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl">
                {currentTags.map((tag) => {
                  const preset = TAG_PRESETS.find((p) => p.tag === tag);
                  const isStatus = preset?.type === 'status' || tag.includes('штраф') || tag.includes('срочн') || tag.includes('актуал');
                  return (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-2xs transition-all ${
                        isStatus
                          ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                          : 'bg-white text-[#1E201E] border-[#D1D5DB]'
                      }`}
                    >
                      <span>#{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="w-4 h-4 rounded-full hover:bg-black/10 flex items-center justify-center text-inherit cursor-pointer"
                        title="Удалить тег"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add custom tag input */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#374151] text-xs">
              Добавить свой тег:
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTag(customTagInput);
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] font-mono">
                  #
                </span>
                <input
                  type="text"
                  placeholder="например: сбп, отмена заказа, чат-бот..."
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16] bg-white text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={!customTagInput.trim()}
                className="px-4 py-2 bg-[#1E201E] hover:bg-[#374151] disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Добавить
              </button>
            </form>
          </div>

          {/* 1. Status Presets */}
          <div className="space-y-2 pt-2 border-t border-[#F3F4F6]">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#6B7280]">
                Статусы регламента:
              </span>
              <span className="text-[10px] text-[#9CA3AF]">(нажмите для присвоения)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {statusPresets.map(({ tag, label, icon: Icon, colorClass }) => {
                const isSelected = currentTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1E201E] text-white border-[#1E201E] shadow-2xs'
                        : colorClass
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{label}</span>
                    {isSelected && <Check className="w-3 h-3 text-[#A3E635]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Category Presets */}
          <div className="space-y-2 pt-2 border-t border-[#F3F4F6]">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#6B7280]">
                Тематические категории:
              </span>
              <span className="text-[10px] text-[#9CA3AF]">(быстрый выбор)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categoryPresets.map(({ tag, label, icon: Icon, colorClass }) => {
                const isSelected = currentTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#84CC16] text-[#1E201E] font-bold border-[#84CC16] shadow-2xs'
                        : colorClass
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{label}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Existing KB Tags Cloud */}
          {otherExistingTags.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#F3F4F6]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#6B7280]">
                  Другие теги из базы знаний:
                </span>
                <span className="text-[10px] text-[#9CA3AF]">
                  {otherExistingTags.length} тегов
                </span>
              </div>

              {otherExistingTags.length > 8 && (
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    placeholder="Найти тег..."
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    className="w-full pl-7 pr-3 py-1 border border-[#E5E7EB] rounded-lg text-xs bg-[#F9FAFB] outline-none focus:border-[#84CC16]"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-1 scrollbar-thin">
                {filteredOtherTags.map((tag) => {
                  const isSelected = currentTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2 py-0.5 rounded-md font-mono text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#1E201E] text-white font-bold'
                          : 'bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563]'
                      }`}
                    >
                      <span>#{tag}</span>
                      {isSelected && <Check className="w-2.5 h-2.5 text-[#A3E635]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
          <span className="text-[11px] text-[#6B7280]">
            Изменения сохраняются автоматически
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-[#1E201E] font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
