import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Briefcase,
  Coffee,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  Zap,
  Info,
  Edit3,
  X,
  AlertCircle,
  HelpCircle,
  Award,
  ArrowRight,
  Sliders,
  Bookmark,
  CheckCircle2,
  RefreshCw,
  Layers,
  Settings2
} from 'lucide-react';
import { DayShift, ShiftTemplate } from '../types';

const STORAGE_SHIFTS_KEY = 'telesales_shift_calendar_v1';
const STORAGE_TEMPLATES_KEY = 'telesales_shift_templates_v2';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const SHIFT_HOURS_PRESETS = [
  { label: '08:00 - 20:00 МСК (12 ч)', hours: 12, timeRange: '08:00 - 20:00' },
  { label: '09:00 - 21:00 МСК (12 ч)', hours: 12, timeRange: '09:00 - 21:00' },
  { label: '10:00 - 22:00 МСК (12 ч)', hours: 12, timeRange: '10:00 - 22:00' },
];

const DEFAULT_TEMPLATES: ShiftTemplate[] = [
  {
    id: 'tmpl-2-2-08-20',
    name: 'График 2/2 (08:00 - 20:00 МСК)',
    description: '2 смены по 12 ч (08:00 - 20:00 по МСК), 2 дня 🌴 отдыха',
    patternType: 'cyclic',
    workDaysCount: 2,
    offDaysCount: 2,
    hours: 12,
    timeRange: '08:00 - 20:00',
    startDayOffset: 1,
    isBuiltIn: true,
  },
  {
    id: 'tmpl-2-2-09-21',
    name: 'График 2/2 (09:00 - 21:00 МСК)',
    description: '2 смены по 12 ч (09:00 - 21:00 по МСК), 2 дня 🌴 отдыха',
    patternType: 'cyclic',
    workDaysCount: 2,
    offDaysCount: 2,
    hours: 12,
    timeRange: '09:00 - 21:00',
    startDayOffset: 1,
    isBuiltIn: true,
  },
  {
    id: 'tmpl-2-2-10-22',
    name: 'График 2/2 (10:00 - 22:00 МСК)',
    description: '2 смены по 12 ч (10:00 - 22:00 по МСК), 2 дня 🌴 отдыха',
    patternType: 'cyclic',
    workDaysCount: 2,
    offDaysCount: 2,
    hours: 12,
    timeRange: '10:00 - 22:00',
    startDayOffset: 1,
    isBuiltIn: true,
  },
  {
    id: 'tmpl-5-2-08-20',
    name: 'График 5/2 (08:00 - 20:00 МСК)',
    description: 'Понедельник — Пятница с 08:00 до 20:00 по МСК (12 ч), Сб и Вс — 🌴 отдых',
    patternType: 'weekly',
    daysOfWeek: [0, 1, 2, 3, 4],
    hours: 12,
    timeRange: '08:00 - 20:00',
    isBuiltIn: true,
  },
  {
    id: 'tmpl-5-2-09-21',
    name: 'График 5/2 (09:00 - 21:00 МСК)',
    description: 'Понедельник — Пятница с 09:00 до 21:00 по МСК (12 ч), Сб и Вс — 🌴 отдых',
    patternType: 'weekly',
    daysOfWeek: [0, 1, 2, 3, 4],
    hours: 12,
    timeRange: '09:00 - 21:00',
    isBuiltIn: true,
  },
  {
    id: 'tmpl-5-2-10-22',
    name: 'График 5/2 (10:00 - 22:00 МСК)',
    description: 'Понедельник — Пятница с 10:00 до 22:00 по МСК (12 ч), Сб и Вс — 🌴 отдых',
    patternType: 'weekly',
    daysOfWeek: [0, 1, 2, 3, 4],
    hours: 12,
    timeRange: '10:00 - 22:00',
    isBuiltIn: true,
  },
];

export const ShiftCalendar: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-11

  // Shifts state
  const [shifts, setShifts] = useState<Record<string, DayShift>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SHIFTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }

    // Default sample shifts for the current month if completely empty (2/2 with 08:00 - 20:00)
    const initial: Record<string, DayShift> = {};
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    for (let day = 1; day <= 28; day++) {
      const dateStr = `${y}-${m}-${String(day).padStart(2, '0')}`;
      const cycle = day % 4;
      if (cycle === 1 || cycle === 2) {
        initial[dateStr] = {
          date: dateStr,
          type: 'work',
          hours: 12,
          timeRange: '08:00 - 20:00',
        };
      } else {
        initial[dateStr] = {
          date: dateStr,
          type: 'off',
          hours: 0,
        };
      }
    }
    return initial;
  });

  // Templates state - strictly 2/2 and 5/2 with 08-20, 09-21, 10-22 MSK
  const [templates, setTemplates] = useState<ShiftTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TEMPLATES_KEY);
      if (saved) {
        const parsed: ShiftTemplate[] = JSON.parse(saved);
        const validCustom = parsed.filter(
          (p) =>
            !p.isBuiltIn &&
            ['08:00 - 20:00', '09:00 - 21:00', '10:00 - 22:00'].includes(p.timeRange || '')
        );
        return [...DEFAULT_TEMPLATES, ...validCustom];
      }
    } catch {
      // fallback
    }
    return DEFAULT_TEMPLATES;
  });

  // Modals & Drawers state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);

  // New template form state
  const [newTmplName, setNewTmplName] = useState('');
  const [newTmplPatternType, setNewTmplPatternType] = useState<'cyclic' | 'weekly'>('cyclic');
  const [newTmplWorkDays, setNewTmplWorkDays] = useState<number>(2);
  const [newTmplOffDays, setNewTmplOffDays] = useState<number>(2);
  const [newTmplDaysOfWeek, setNewTmplDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4]); // Mon-Fri
  const [newTmplHours, setNewTmplHours] = useState<number>(12);
  const [newTmplTimeRange, setNewTmplTimeRange] = useState<string>('09:00 - 21:00');
  const [newTmplStartDay, setNewTmplStartDay] = useState<number>(1);

  // Toast / notification message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SHIFTS_KEY, JSON.stringify(shifts));
    } catch (e) {
      console.error('Failed to save shifts to localStorage', e);
    }
  }, [shifts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TEMPLATES_KEY, JSON.stringify(templates));
    } catch (e) {
      console.error('Failed to save templates to localStorage', e);
    }
  }, [templates]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const monthYearKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  // Monthly summary metrics
  const summary = useMemo(() => {
    let totalHours = 0;
    let workDaysCount = 0;
    let daysOffCount = 0;
    let extraHours = 0;
    let vacationDays = 0;
    let sickDays = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${monthYearKey}-${String(d).padStart(2, '0')}`;
      const shift = shifts[dateKey];
      if (!shift) continue;

      if (shift.type === 'work') {
        totalHours += shift.hours;
        workDaysCount += 1;
      } else if (shift.type === 'extra') {
        totalHours += shift.hours;
        extraHours += shift.hours;
        workDaysCount += 1;
      } else if (shift.type === 'off') {
        daysOffCount += 1;
      } else if (shift.type === 'vacation') {
        vacationDays += 1;
      } else if (shift.type === 'sick') {
        sickDays += 1;
      }
    }

    const normHours = 165;
    const progressPercent = Math.min(Math.round((totalHours / normHours) * 100), 120);
    const baseEstimatedPay = totalHours * 160;

    return {
      totalHours,
      workDaysCount,
      daysOffCount,
      extraHours,
      vacationDays,
      sickDays,
      normHours,
      progressPercent,
      baseEstimatedPay,
    };
  }, [shifts, daysInMonth, monthYearKey]);

  // Apply a template to the current month in ONE CLICK
  const applyTemplateToMonth = (tmpl: ShiftTemplate, customStartDay?: number) => {
    const startDay = customStartDay ?? tmpl.startDayOffset ?? 1;

    setShifts((prev) => {
      const next = { ...prev };
      let assignedWorkDays = 0;
      let assignedHours = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${monthYearKey}-${String(day).padStart(2, '0')}`;

        if (tmpl.patternType === 'cyclic') {
          const workCount = tmpl.workDaysCount || 2;
          const offCount = tmpl.offDaysCount || 2;
          const cycleLength = workCount + offCount;

          const diff = day - startDay;
          const mod = ((diff % cycleLength) + cycleLength) % cycleLength;

          if (mod < workCount) {
            next[dateStr] = {
              date: dateStr,
              type: 'work',
              hours: tmpl.hours,
              timeRange: tmpl.timeRange,
            };
            assignedWorkDays++;
            assignedHours += tmpl.hours;
          } else {
            next[dateStr] = {
              date: dateStr,
              type: 'off',
              hours: 0,
            };
          }
        } else {
          // Weekly pattern
          const dayOfWeek = (new Date(currentYear, currentMonth, day).getDay() + 6) % 7; // 0=Mon..6=Sun
          const isWorkDay = tmpl.daysOfWeek ? tmpl.daysOfWeek.includes(dayOfWeek) : dayOfWeek < 5;

          if (isWorkDay) {
            next[dateStr] = {
              date: dateStr,
              type: 'work',
              hours: tmpl.hours,
              timeRange: tmpl.timeRange,
            };
            assignedWorkDays++;
            assignedHours += tmpl.hours;
          } else {
            next[dateStr] = {
              date: dateStr,
              type: 'off',
              hours: 0,
            };
          }
        }
      }

      showToast(`Шаблон «${tmpl.name}» применен! Расставлено ${assignedWorkDays} смен (${assignedHours} ч).`);
      return next;
    });

    setIsTemplatesModalOpen(false);
  };

  // Create and save custom template
  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTmplName.trim()) {
      alert('Пожалуйста, введите название шаблона');
      return;
    }

    const newId = `custom-tmpl-${Date.now()}`;
    const desc =
      newTmplPatternType === 'cyclic'
        ? `График ${newTmplWorkDays}/${newTmplOffDays} по ${newTmplHours} ч (${newTmplTimeRange}), старт с ${newTmplStartDay}-го числа`
        : `По дням недели: ${newTmplDaysOfWeek.map((d) => WEEKDAYS[d]).join(', ')} (${newTmplHours} ч, ${newTmplTimeRange})`;

    const newTemplate: ShiftTemplate = {
      id: newId,
      name: newTmplName.trim(),
      description: desc,
      patternType: newTmplPatternType,
      workDaysCount: newTmplWorkDays,
      offDaysCount: newTmplOffDays,
      daysOfWeek: newTmplDaysOfWeek,
      hours: newTmplHours,
      timeRange: newTmplTimeRange,
      startDayOffset: newTmplStartDay,
      isBuiltIn: false,
    };

    setTemplates((prev) => [...prev, newTemplate]);
    setIsCreateTemplateOpen(false);
    showToast(`Шаблон «${newTemplate.name}» сохранен! Теперь его можно применить в 1 клик.`);

    // Reset form
    setNewTmplName('');
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (!window.confirm(`Удалить шаблон «${name}»?`)) return;
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast(`Шаблон «${name}» удален.`);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const saveShift = (dateStr: string, update: Partial<DayShift> | null) => {
    setShifts((prev) => {
      const next = { ...prev };
      if (update === null) {
        delete next[dateStr];
      } else {
        next[dateStr] = {
          date: dateStr,
          type: update.type || 'work',
          hours: update.hours ?? (update.type === 'off' ? 0 : 12),
          timeRange: update.timeRange,
          note: update.note,
        };
      }
      return next;
    });
  };

  const handleClearMonth = () => {
    if (!window.confirm(`Очистить все смены за ${MONTH_NAMES[currentMonth]} ${currentYear}?`)) return;
    setShifts((prev) => {
      const next = { ...prev };
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${monthYearKey}-${String(day).padStart(2, '0')}`;
        delete next[dateStr];
      }
      return next;
    });
    showToast(`Все смены за ${MONTH_NAMES[currentMonth]} ${currentYear} очищены.`);
  };

  const handleCopySummary = () => {
    const text = `📅 График смен (${MONTH_NAMES[currentMonth]} ${currentYear}):
• Отработано часов: ${summary.totalHours} ч (норма ~${summary.normHours} ч)
• Рабочих смен: ${summary.workDaysCount}
• Дней отдыха 🌴: ${summary.daysOffCount}
${summary.extraHours > 0 ? `• Доп. часы (переработки): ${summary.extraHours} ч\n` : ''}• Оценка по ставке: ~${summary.baseEstimatedPay.toLocaleString('ru-RU')} ₽ (без учета KPI чатов)
Сформировано в базе «Золотое Яблоко» (Телесейлз)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDayOfWeek = (dayIdx: number) => {
    setNewTmplDaysOfWeek((prev) =>
      prev.includes(dayIdx) ? prev.filter((d) => d !== dayIdx) : [...prev, dayIdx].sort()
    );
  };

  // Top quick-templates for 1-click header chips
  const quickTemplates = templates.slice(0, 3);
  const activeShift = selectedDate ? shifts[selectedDate] : undefined;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 max-w-sm bg-[#1E201E] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#84CC16]/40 flex items-center gap-3 animate-in slide-in-from-top-3 duration-200">
          <div className="w-7 h-7 rounded-xl bg-[#84CC16] text-[#1E201E] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium leading-tight">{toastMessage}</div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#84CC16]/15 border border-[#84CC16]/30 text-[#4D7C0F] flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5 text-[#65A30D]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1E201E] font-['Manrope']">
                Календарь смен оператора
              </h2>
              <p className="text-xs text-[#6B7280]">
                Графики 2/2 и 5/2 (08:00–20:00, 09:00–21:00, 10:00–22:00 по МСК), подсчет часов и дней отдыха 🌴
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Main Templates Hub Button */}
          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#1E201E] bg-[#84CC16] hover:bg-[#65A30D] active:bg-[#4D7C0F] rounded-xl transition-all shadow-xs"
            title="Открыть шаблоны графиков"
          >
            <Layers className="w-4 h-4 text-[#1E201E]" />
            <span>Шаблоны графиков</span>
            <span className="ml-0.5 px-1.5 py-0.2 text-[10px] rounded-full bg-black/10 font-black">
              {templates.length}
            </span>
          </button>

          {/* New Custom Template Button */}
          <button
            onClick={() => {
              setNewTmplName('');
              setIsCreateTemplateOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1E201E] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-xl border border-[#E5E7EB] transition-colors"
            title="Создать свой собственный шаблон"
          >
            <Plus className="w-4 h-4 text-[#4B5563]" />
            <span className="hidden sm:inline">Создать шаблон</span>
          </button>

          {/* Copy Summary */}
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1E201E] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-xl border border-[#E5E7EB] transition-colors"
            title="Скопировать текстовую сводку часов"
          >
            {copied ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4 text-[#4B5563]" />}
            <span className="hidden sm:inline">{copied ? 'Скопировано!' : 'Сводка'}</span>
          </button>

          {/* Clear Month */}
          <button
            onClick={handleClearMonth}
            className="p-2 text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl border border-[#E5E7EB] transition-colors"
            title="Очистить все смены за этот месяц"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick 1-Click Template Fill Toolbar */}
      <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-3 sm:p-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-[#4B5563]">
            <Zap className="w-4 h-4 text-[#84CC16] shrink-0" />
            <span className="font-bold text-[#1E201E]">Заполнение {MONTH_NAMES[currentMonth]} в 1 клик:</span>
            <span className="text-[11px] text-[#6B7280] hidden md:inline">(только 2/2 и 5/2 по МСК)</span>
          </div>

          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="self-start sm:self-auto px-2.5 py-1 rounded-xl border border-[#D1D5DB] bg-white hover:border-[#84CC16] text-xs font-semibold text-[#4B5563] hover:text-[#1E201E] transition-colors flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5 text-[#65A30D]" />
            <span>Все шаблоны ({templates.length})</span>
          </button>
        </div>

        {/* 2/2 and 5/2 dedicated button groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {/* 2/2 Group */}
          <div className="p-2.5 bg-white rounded-xl border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-[11px] font-bold text-[#4D7C0F] px-2 py-0.5 rounded-md bg-[#F7FEE7] border border-[#D9F99D] shrink-0">
              График 2/2 (12ч):
            </span>
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {templates
                .filter((t) => t.patternType === 'cyclic')
                .map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => applyTemplateToMonth(tmpl)}
                    className="flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] hover:border-[#84CC16] hover:bg-[#F7FEE7] text-xs font-bold text-[#1E201E] transition-all active:scale-95 shadow-2xs"
                    title={`Заполнить ${MONTH_NAMES[currentMonth]} по графику 2/2 (${tmpl.timeRange} МСК)`}
                  >
                    ⚡ {tmpl.timeRange}
                  </button>
                ))}
            </div>
          </div>

          {/* 5/2 Group */}
          <div className="p-2.5 bg-white rounded-xl border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-[11px] font-bold text-[#1D4ED8] px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 shrink-0">
              График 5/2 (12ч):
            </span>
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {templates
                .filter((t) => t.patternType === 'weekly')
                .map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => applyTemplateToMonth(tmpl)}
                    className="flex-1 sm:flex-initial px-2.5 py-1.5 rounded-lg border border-[#E5E7EB] hover:border-[#84CC16] hover:bg-[#F7FEE7] text-xs font-bold text-[#1E201E] transition-all active:scale-95 shadow-2xs"
                    title={`Заполнить ${MONTH_NAMES[currentMonth]} по графику 5/2 (${tmpl.timeRange} МСК)`}
                  >
                    ⚡ {tmpl.timeRange}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Summary Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Hours */}
        <div className="bg-[#1E201E] text-white p-4 sm:p-5 rounded-3xl shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300 font-medium">Всего часов</span>
            <div className="w-7 h-7 rounded-lg bg-[#84CC16]/20 text-[#A3E635] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-['Manrope'] text-white">
              {summary.totalHours} <span className="text-sm font-normal text-gray-400">ч</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              <span>Норма месяца: ~{summary.normHours} ч</span>
              <span className={`font-bold ${summary.totalHours >= summary.normHours ? 'text-[#A3E635]' : 'text-gray-300'}`}>
                ({summary.progressPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Working Days */}
        <div className="bg-white border border-[#E5E7EB] p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B7280] font-medium">Рабочих смен</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-['Manrope'] text-[#1E201E]">
              {summary.workDaysCount} <span className="text-sm font-normal text-[#6B7280]">дн</span>
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1">
              {summary.extraHours > 0 ? `Включая ${summary.extraHours} ч переработок` : 'Штатные смены'}
            </div>
          </div>
        </div>

        {/* Days Off */}
        <div className="bg-white border border-[#E5E7EB] p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B7280] font-medium">Дни отдыха</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
              🌴
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-['Manrope'] text-[#1E201E]">
              {summary.daysOffCount} <span className="text-sm font-normal text-[#6B7280]">дн</span>
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1">
              {summary.vacationDays > 0 ? `+ ${summary.vacationDays} дн. отпуска` : 'Отдых и восстановление'}
            </div>
          </div>
        </div>

        {/* Base Estimated Pay */}
        <div className="bg-gradient-to-br from-[#F7FEE7] to-[#ECFCCB] border border-[#BEF264] p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#365314] font-bold">Ориентир базы</span>
            <div className="w-7 h-7 rounded-lg bg-[#84CC16] text-[#1E201E] flex items-center justify-center font-bold text-xs">
              ₽
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black font-['Manrope'] text-[#1E201E]">
              ~{summary.baseEstimatedPay.toLocaleString('ru-RU')} <span className="text-sm font-normal text-[#4D7C0F]">₽</span>
            </div>
            <div className="text-[10px] text-[#4D7C0F] mt-1 leading-tight font-medium">
              По тарифу 160 ₽/ч (без учета премии за скорость чатов)
            </div>
          </div>
        </div>
      </div>

      {/* Month Navigator & Legend */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#F3F4F6]">
          {/* Month Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6] active:bg-[#E5E7EB] transition-colors"
              title="Предыдущий месяц"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="px-3 py-1 font-['Manrope'] font-bold text-base sm:text-lg text-[#1E201E] min-w-[170px] text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </div>

            <button
              onClick={handleNextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6] active:bg-[#E5E7EB] transition-colors"
              title="Следующий месяц"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleGoToday}
              className="ml-2 px-2.5 py-1 text-xs font-semibold text-[#65A30D] bg-[#F7FEE7] hover:bg-[#ECFCCB] border border-[#D9F99D] rounded-xl transition-colors"
            >
              Текущий месяц
            </button>
          </div>

          {/* Quick Legend */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6B7280]">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Смена
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
              <span className="text-xs">🌴</span> Отдых
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FAF5FF] text-[#9333EA] border border-[#E9D5FF]">
              <span className="w-2 h-2 rounded-full bg-[#9333EA]" /> Доп. часы
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" /> Отпуск
            </span>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-[#6B7280] py-1">
          {WEEKDAYS.map((day, idx) => (
            <div key={day} className={idx >= 5 ? 'text-[#EF4444]' : ''}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Leading empty cells for first week */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[72px] sm:min-h-[90px] rounded-2xl bg-gray-50/50 border border-dashed border-gray-200/50 opacity-40 pointer-events-none"
            />
          ))}

          {/* Real Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${monthYearKey}-${String(dayNum).padStart(2, '0')}`;
            const shift = shifts[dateStr];
            const isToday =
              today.getFullYear() === currentYear &&
              today.getMonth() === currentMonth &&
              today.getDate() === dayNum;

            const isSelected = selectedDate === dateStr;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`min-h-[72px] sm:min-h-[92px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                  isSelected
                    ? 'ring-2 ring-[#84CC16] border-[#84CC16]'
                    : isToday
                    ? 'border-[#84CC16] bg-[#F7FEE7]/40 shadow-xs'
                    : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:shadow-xs'
                }`}
              >
                {/* Header: Day number + today dot */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-bold font-['Manrope'] rounded-full w-6 h-6 flex items-center justify-center ${
                      isToday
                        ? 'bg-[#84CC16] text-[#1E201E] font-black'
                        : 'text-[#1E201E]'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {shift?.note && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"
                      title={shift.note}
                    />
                  )}
                </div>

                {/* Shift status preview badge */}
                <div className="my-auto py-1">
                  {!shift ? (
                    <span className="text-[10px] text-gray-300 group-hover:text-gray-400 block truncate">
                      + настроить
                    </span>
                  ) : shift.type === 'work' ? (
                    <div className="bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-xl px-1 sm:px-1.5 py-0.5 sm:py-1">
                      <div className="font-extrabold text-[11px] sm:text-xs flex items-center justify-between">
                        <span>{shift.hours} ч</span>
                        <Briefcase className="w-2.5 h-2.5 opacity-60 hidden sm:block" />
                      </div>
                      {shift.timeRange && (
                        <div className="text-[9px] text-[#047857] truncate hidden sm:block">
                          {shift.timeRange}
                        </div>
                      )}
                    </div>
                  ) : shift.type === 'off' ? (
                    <div className="bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB] rounded-xl px-1 sm:px-1.5 py-1 text-center flex items-center justify-center shadow-2xs">
                      <span className="text-base sm:text-lg leading-none select-none" title="Отдых">
                        🌴
                      </span>
                    </div>
                  ) : shift.type === 'extra' ? (
                    <div className="bg-[#FAF5FF] text-[#6B21A8] border border-[#E9D5FF] rounded-xl px-1 sm:px-1.5 py-0.5 sm:py-1">
                      <div className="font-extrabold text-[11px] sm:text-xs flex items-center justify-between">
                        <span>+{shift.hours} ч</span>
                        <Zap className="w-2.5 h-2.5 text-[#9333EA] hidden sm:block" />
                      </div>
                      <div className="text-[9px] text-[#7E22CE] truncate hidden sm:block">
                        Доп. часы
                      </div>
                    </div>
                  ) : shift.type === 'vacation' ? (
                    <div className="bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] rounded-xl px-1 sm:px-1.5 py-0.5 sm:py-1 text-center">
                      <div className="font-bold text-[10px] sm:text-[11px]">
                        Отпуск
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] rounded-xl px-1 sm:px-1.5 py-0.5 sm:py-1 text-center">
                      <div className="font-bold text-[10px] sm:text-[11px]">
                        Больничный
                      </div>
                    </div>
                  )}
                </div>

                {/* Status caption */}
                <div className="text-[9px] text-[#9CA3AF] text-right truncate">
                  {shift?.type === 'work' ? 'смена' : shift?.type === 'off' ? '🌴' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sherlock shift reminder */}
      <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FCD34D] flex items-start gap-3 text-xs text-[#92400E]">
        <Info className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#B45309]">Правило работы с часами в Шерлоке:</span>
          <p className="mt-0.5 leading-relaxed text-[#78350F]">
            В программе «Шерлок» выставляйте время смены <strong>строго по своему часовому поясу</strong>. Конец вашей реальной смены должен совпадать со временем в Шерлоке. При доп. часах реальное окончание также выставляется равным Шерлоку!
          </p>
        </div>
      </div>

      {/* MODAL 1: Templates Hub Modal */}
      {isTemplatesModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in"
          style={{
            paddingTop: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
            paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))',
          }}
          onClick={() => setIsTemplatesModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#84CC16]/20 text-[#4D7C0F] flex items-center justify-center">
                  <Layers className="w-5 h-5 text-[#65A30D]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E201E] font-['Manrope']">
                    Шаблоны графиков смен
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Заполняйте календарь на {MONTH_NAMES[currentMonth]} {currentYear} в 1 клик
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsTemplatesModalOpen(false);
                    setIsCreateTemplateOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#84CC16] hover:bg-[#65A30D] text-[#1E201E] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Создать шаблон</span>
                </button>
                <button
                  onClick={() => setIsTemplatesModalOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[#6B7280] hover:text-[#1E201E] hover:bg-[#E5E7EB] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body: Templates List */}
            <div className="p-6 overflow-y-auto space-y-3 divide-y divide-[#F3F4F6]">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="pt-3 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl hover:bg-[#F9FAFB] transition-colors border border-transparent hover:border-[#E5E7EB]"
                >
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#1E201E] font-['Manrope']">
                        {tmpl.name}
                      </span>
                      {tmpl.isBuiltIn ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                          Базовый
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F7FEE7] text-[#4D7C0F] border border-[#D9F99D]">
                          Пользовательский
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      {tmpl.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#4B5563] pt-0.5">
                      <span className="bg-white px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                        ⏱️ {tmpl.hours} ч
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                        🕒 {tmpl.timeRange}
                      </span>
                      {tmpl.patternType === 'cyclic' ? (
                        <span className="bg-white px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                          🔄 {tmpl.workDaysCount} раб. / {tmpl.offDaysCount} 🌴 отд.
                        </span>
                      ) : (
                        <span className="bg-white px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                          📅 Пн-Пт / 🌴 Сб-Вс
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => applyTemplateToMonth(tmpl)}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-[#84CC16] hover:bg-[#65A30D] active:bg-[#4D7C0F] text-[#1E201E] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Применить на месяц</span>
                    </button>

                    {!tmpl.isBuiltIn && (
                      <button
                        onClick={() => handleDeleteTemplate(tmpl.id, tmpl.name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-[#E5E7EB]"
                        title="Удалить пользовательский шаблон"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between text-xs text-[#6B7280]">
              <span>Всего сохранено шаблонов: {templates.length}</span>
              <button
                onClick={() => setIsTemplatesModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-[#4B5563] hover:text-[#1E201E]"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Custom Template Modal */}
      {isCreateTemplateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in"
          style={{
            paddingTop: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
            paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))',
          }}
          onClick={() => setIsCreateTemplateOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleCreateTemplate}>
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#84CC16]/20 text-[#4D7C0F] flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1E201E] font-['Manrope']">
                      Настройка графика смен
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      Графики 2/2 или 5/2 (08–20, 09–21, 10–22 по МСК)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateTemplateOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[#6B7280] hover:text-[#1E201E] hover:bg-[#E5E7EB] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Template Name */}
                <div>
                  <label className="text-xs font-bold text-[#1E201E] block mb-1.5">
                    Название шаблона:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Мой график 2/2 с 08:00 (с 1-го числа)"
                    value={newTmplName}
                    onChange={(e) => setNewTmplName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs font-medium text-[#1E201E] focus:outline-none focus:border-[#84CC16] shadow-2xs"
                  />
                </div>

                {/* Pattern Type: 2/2 or 5/2 strictly */}
                <div>
                  <label className="text-xs font-bold text-[#1E201E] block mb-1.5">
                    Тип графика:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setNewTmplPatternType('cyclic');
                        setNewTmplWorkDays(2);
                        setNewTmplOffDays(2);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        newTmplPatternType === 'cyclic'
                          ? 'bg-[#F7FEE7] border-[#84CC16] text-[#1E201E] ring-1 ring-[#84CC16]'
                          : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563]'
                      }`}
                    >
                      <div className="font-bold text-xs">График 2/2</div>
                      <div className="text-[10px] text-[#6B7280] mt-0.5">2 смены по 12 ч / 2 дня 🌴 отдыха</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNewTmplPatternType('weekly');
                        setNewTmplDaysOfWeek([0, 1, 2, 3, 4]);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        newTmplPatternType === 'weekly'
                          ? 'bg-[#F7FEE7] border-[#84CC16] text-[#1E201E] ring-1 ring-[#84CC16]'
                          : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563]'
                      }`}
                    >
                      <div className="font-bold text-xs">График 5/2</div>
                      <div className="text-[10px] text-[#6B7280] mt-0.5">Пн-Пт по 12 ч / 🌴 Сб-Вс отдых</div>
                    </button>
                  </div>
                </div>

                {/* Time Range Selection - Strictly 08-20, 09-21, 10-22 */}
                <div>
                  <label className="text-xs font-bold text-[#1E201E] block mb-1.5">
                    Время смены (12 часов по МСК):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {SHIFT_HOURS_PRESETS.map((p) => {
                      const isSelected = newTmplTimeRange === p.timeRange;
                      return (
                        <button
                          key={p.timeRange}
                          type="button"
                          onClick={() => {
                            setNewTmplHours(12);
                            setNewTmplTimeRange(p.timeRange);
                          }}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'bg-[#F7FEE7] border-[#84CC16] text-[#1E201E] ring-1 ring-[#84CC16] font-bold'
                              : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-xs font-bold">{p.timeRange}</div>
                          <div className="text-[10px] text-[#65A30D]">12 ч (МСК)</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* For 2/2: Starting day of cycle */}
                {newTmplPatternType === 'cyclic' ? (
                  <div className="p-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl space-y-2">
                    <label className="text-[11px] font-semibold text-[#4B5563] block">
                      Число месяца, с которого начинается первая 2-дневная смена:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={newTmplStartDay}
                        onChange={(e) => setNewTmplStartDay(Math.max(1, Number(e.target.value) || 1))}
                        className="w-20 px-3 py-1.5 border border-[#E5E7EB] rounded-xl text-xs font-bold text-[#1E201E] bg-white text-center"
                      />
                      <span className="text-xs text-[#6B7280]">
                        -е число (например: 1 если 1-го и 2-го числа смены)
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Weekly 5/2 days preview */
                  <div className="p-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl space-y-2">
                    <label className="text-[11px] font-semibold text-[#4B5563] block">
                      Рабочие дни (Пн-Пт с 🌴 отдыхом в Сб и Вс):
                    </label>
                    <div className="grid grid-cols-7 gap-1">
                      {WEEKDAYS.map((wd, idx) => {
                        const isSelected = newTmplDaysOfWeek.includes(idx);
                        return (
                          <button
                            key={wd}
                            type="button"
                            onClick={() => toggleDayOfWeek(idx)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                              isSelected
                                ? 'bg-[#84CC16] text-[#1E201E] border-[#84CC16]'
                                : 'bg-white text-[#9CA3AF] border-[#E5E7EB] hover:bg-gray-50'
                            }`}
                          >
                            {wd}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsCreateTemplateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#1E201E]"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#84CC16] hover:bg-[#65A30D] active:bg-[#4D7C0F] text-[#1E201E] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Сохранить график</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Single Day Modal */}
      {selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto animate-in fade-in"
          style={{
            paddingTop: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
            paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))',
          }}
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
              <div>
                <h3 className="text-base font-bold text-[#1E201E] font-['Manrope']">
                  Смена на {selectedDate.split('-').reverse().join('.')}
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Выберите статус дня или примените быстрый шаблон
                </p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#6B7280] hover:text-[#1E201E] hover:bg-[#E5E7EB] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Type Select buttons */}
              <div>
                <label className="text-xs font-bold text-[#1E201E] block mb-2">
                  Статус дня:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      saveShift(selectedDate, {
                        type: 'work',
                        hours: activeShift?.hours || 12,
                        timeRange: activeShift?.timeRange || '08:00 - 20:00',
                      })
                    }
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      activeShift?.type === 'work'
                        ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] ring-1 ring-[#10B981]'
                        : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Смена</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => saveShift(selectedDate, { type: 'off', hours: 0, timeRange: undefined })}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      activeShift?.type === 'off'
                        ? 'bg-[#F3F4F6] border-[#6B7280] text-[#1E201E] ring-1 ring-[#6B7280]'
                        : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <span className="text-base leading-none">🌴</span>
                    <span>Отдых</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      saveShift(selectedDate, { type: 'extra', hours: 4, timeRange: '18:00 - 22:00' })
                    }
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      activeShift?.type === 'extra'
                        ? 'bg-[#FAF5FF] border-[#A855F7] text-[#6B21A8] ring-1 ring-[#A855F7]'
                        : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Доп. часы</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => saveShift(selectedDate, { type: 'vacation', hours: 0 })}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      activeShift?.type === 'vacation'
                        ? 'bg-[#EFF6FF] border-[#3B82F6] text-[#1E40AF] ring-1 ring-[#3B82F6]'
                        : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <span>🏖️ Отпуск</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => saveShift(selectedDate, { type: 'sick', hours: 0 })}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      activeShift?.type === 'sick'
                        ? 'bg-[#FFFBEB] border-[#F59E0B] text-[#92400E] ring-1 ring-[#F59E0B]'
                        : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <span>🩺 Больничный</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => saveShift(selectedDate, null)}
                    className="p-2.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100 text-xs font-bold text-red-600 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Сбросить</span>
                  </button>
                </div>
              </div>

              {/* Hours Presets */}
              {(activeShift?.type === 'work' || activeShift?.type === 'extra' || !activeShift) && (
                <div className="space-y-3 pt-2 border-t border-[#F3F4F6]">
                  <label className="text-xs font-bold text-[#1E201E] block">
                    Быстрые шаблоны смен (МСК):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SHIFT_HOURS_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          saveShift(selectedDate, {
                            type: activeShift?.type || 'work',
                            hours: preset.hours,
                            timeRange: preset.timeRange,
                          })
                        }
                        className={`p-2 rounded-xl border text-left text-xs transition-colors ${
                          activeShift?.hours === preset.hours && activeShift?.timeRange === preset.timeRange
                            ? 'bg-[#F7FEE7] border-[#84CC16] text-[#1E201E] font-bold ring-1 ring-[#84CC16]'
                            : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB]'
                        }`}
                      >
                        <div className="font-bold text-[#1E201E]">{preset.hours} ч</div>
                        <div className="text-[10px] text-[#6B7280]">{preset.timeRange}</div>
                      </button>
                    ))}
                  </div>

                  {/* Manual Hours Input */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
                        Количество часов:
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={24}
                        value={activeShift?.hours ?? 12}
                        onChange={(e) =>
                          saveShift(selectedDate, {
                            type: activeShift?.type || 'work',
                            hours: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs font-mono font-bold text-[#1E201E] focus:outline-none focus:border-[#84CC16]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
                        Время смены:
                      </label>
                      <input
                        type="text"
                        placeholder="09:00 - 21:00"
                        value={activeShift?.timeRange ?? ''}
                        onChange={(e) =>
                          saveShift(selectedDate, {
                            timeRange: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs font-mono text-[#1E201E] focus:outline-none focus:border-[#84CC16]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Note input */}
              <div className="pt-2 border-t border-[#F3F4F6]">
                <label className="text-[11px] font-semibold text-[#6B7280] block mb-1">
                  Заметка (например: «замена», «доп. смена»):
                </label>
                <input
                  type="text"
                  placeholder="Необязательно..."
                  value={activeShift?.note ?? ''}
                  onChange={(e) =>
                    saveShift(selectedDate, {
                      note: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs text-[#1E201E] focus:outline-none focus:border-[#84CC16]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="px-4 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-[#1E201E] text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
