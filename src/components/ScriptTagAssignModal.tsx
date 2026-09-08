import React, { useState } from 'react';
import { ScriptItem } from '../types';
import {
  X,
  Plus,
  Tag,
  Check,
  Search,
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
  Globe,
  HeartHandshake,
  UserCheck,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

interface ScriptTagAssignModalProps {
  script: ScriptItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTags: (scriptId: string, tags: string[]) => void;
  allExistingTags?: string[];
}

export interface ScriptTagPreset {
  tag: string;
  label: string;
  group: 'scenario' | 'product';
  icon?: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

export const SCRIPT_TAG_PRESETS: ScriptTagPreset[] = [
  // Scenarios & Regulations
  { tag: 'штраф окк', label: 'Штраф ОКК', group: 'scenario', icon: AlertTriangle, colorClass: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
  { tag: 'срочно', label: 'Срочно 🔥', group: 'scenario', icon: Flame, colorClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
  { tag: 'первое касание', label: 'Первое касание', group: 'scenario', icon: UserCheck, colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  { tag: 'эскалация', label: 'Эскалация / Старшие', group: 'scenario', icon: ShieldAlert, colorClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  { tag: 'сложные клиенты', label: 'Сложные клиенты', group: 'scenario', icon: AlertTriangle, colorClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
  { tag: 'эмпатия', label: 'Эмпатия / ToV', group: 'scenario', icon: HeartHandshake, colorClass: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100' },
  { tag: 'третье лицо', label: 'Третье лицо (Запрет)', group: 'scenario', icon: ShieldAlert, colorClass: 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100' },
  { tag: 'пауза', label: 'Пауза / Заглушка', group: 'scenario', icon: Clock, colorClass: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { tag: 'актуально', label: 'Актуально', group: 'scenario', icon: CheckCircle2, colorClass: 'bg-lime-50 text-lime-800 border-lime-300 hover:bg-lime-100' },

  // Products & Domains
  { tag: 'товары', label: 'Товары / Каталог', group: 'product', icon: ShoppingBag, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'косметика', label: 'Косметика', group: 'product', icon: Sparkles, colorClass: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100' },
  { tag: 'парфюмерия', label: 'Парфюмерия', group: 'product', icon: Sparkles, colorClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  { tag: 'доставка', label: 'Доставка / Курьер', group: 'product', icon: Package, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'отмена', label: 'Отмена заказа', group: 'product', icon: RotateCcw, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'дефектура', label: 'Дефектура / Склад', group: 'product', icon: Package, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'промокод', label: 'Промокоды / Скидки', group: 'product', icon: Percent, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'компенсация', label: 'Компенсация', group: 'product', icon: Percent, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'оплата', label: 'Оплата / СБП / Карты', group: 'product', icon: CreditCard, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'бонусы', label: 'Бонусы / Лояльность', group: 'product', icon: Star, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'чекаут', label: 'Чекаут / Сбой приложения', group: 'product', icon: Monitor, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'возврат', label: 'Возврат средств', group: 'product', icon: RotateCcw, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'казахстан', label: 'Казахстан (KZ)', group: 'product', icon: Globe, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' },
  { tag: 'беларусь', label: 'Беларусь (BY)', group: 'product', icon: Globe, colorClass: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100' }
];

export const ScriptTagAssignModal: React.FC<ScriptTagAssignModalProps> = ({
  script,
  isOpen,
  onClose,
  onUpdateTags,
  allExistingTags = []
}) => {
  const [customTagInput, setCustomTagInput] = useState('');
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  if (!isOpen || !script) return null;

  const currentTags = script.tags || [];

  const handleAddTag = (rawTag: string) => {
    const formatted = rawTag.trim().toLowerCase().replace(/^#/, '');
    if (!formatted) return;
    if (currentTags.includes(formatted)) return;

    const newTags = [...currentTags, formatted];
    onUpdateTags(script.id, newTags);
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = currentTags.filter((t) => t !== tagToRemove);
    onUpdateTags(script.id, newTags);
  };

  const handleToggleTag = (tagToToggle: string) => {
    const formatted = tagToToggle.trim().toLowerCase().replace(/^#/, '');
    if (currentTags.includes(formatted)) {
      handleRemoveTag(formatted);
    } else {
      handleAddTag(formatted);
    }
  };

  const scenarioPresets = SCRIPT_TAG_PRESETS.filter((p) => p.group === 'scenario');
  const productPresets = SCRIPT_TAG_PRESETS.filter((p) => p.group === 'product');

  // Other script tags not in presets
  const otherExistingTags = allExistingTags.filter(
    (t) => !SCRIPT_TAG_PRESETS.some((p) => p.tag === t)
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
                {script.categoryLabel}
              </span>
              <span className="text-xs text-[#6B7280] font-medium truncate">
                Скрипт Sherlock
              </span>
            </div>
            <h3 className="text-base font-bold text-[#1E201E] truncate font-['Manrope']">
              Теги и категории: {script.title}
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Категоризируйте скрипт по продукту или сценарию для быстрого подбора оператором
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
                  onClick={() => onUpdateTags(script.id, [])}
                  className="text-[11px] text-[#DC2626] hover:underline"
                >
                  Снять все теги
                </button>
              )}
            </div>

            {currentTags.length === 0 ? (
              <div className="p-3 bg-[#F9FAFB] border border-dashed border-[#D1D5DB] rounded-xl text-center text-[#9CA3AF] text-xs">
                У этого скрипта еще нет присвоенных тегов. Выберите из списка ниже или введите свой.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl">
                {currentTags.map((tag) => {
                  const preset = SCRIPT_TAG_PRESETS.find((p) => p.tag === tag);
                  const isWarning = tag.includes('штраф') || tag.includes('запрет') || tag.includes('срочн');
                  return (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-2xs transition-all ${
                        isWarning
                          ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                          : preset?.group === 'scenario'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
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
                  placeholder="например: помада, курьер опоздал, скидка 15%..."
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

          {/* 1. Scenarios Presets */}
          <div className="space-y-2 pt-2 border-t border-[#F3F4F6]">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#6B7280]">
                Сценарии диалога и срочность:
              </span>
              <span className="text-[10px] text-[#9CA3AF]">(нажмите для присвоения)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {scenarioPresets.map(({ tag, label, icon: Icon, colorClass }) => {
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

          {/* 2. Products & Domains Presets */}
          <div className="space-y-2 pt-2 border-t border-[#F3F4F6]">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#6B7280]">
                Категории продуктов и темы:
              </span>
              <span className="text-[10px] text-[#9CA3AF]">(нажмите для присвоения)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {productPresets.map(({ tag, label, icon: Icon, colorClass }) => {
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

          {/* 3. Other Existing Script Tags */}
          {otherExistingTags.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#F3F4F6]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#6B7280]">
                  Другие используемые теги в скриптах:
                </span>
                <div className="relative w-36">
                  <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    placeholder="поиск..."
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    className="w-full pl-6 pr-2 py-1 text-[11px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg outline-none focus:border-[#84CC16]"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-[#F9FAFB] rounded-xl border border-[#F3F4F6]">
                {filteredOtherTags.length === 0 ? (
                  <span className="text-[11px] text-[#9CA3AF] p-2">Тегов не найдено</span>
                ) : (
                  filteredOtherTags.map((tag) => {
                    const isSelected = currentTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        className={`px-2 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1E201E] text-white border-[#1E201E]'
                            : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#9CA3AF]'
                        }`}
                      >
                        <span>#{tag}</span>
                        {isSelected && <Check className="w-2.5 h-2.5 text-[#A3E635]" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
          <span className="text-[11px] text-[#6B7280]">
            Изменения тегов сохраняются автоматически
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1E201E] hover:bg-[#374151] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
