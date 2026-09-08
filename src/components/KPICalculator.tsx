import React, { useState, useMemo } from 'react';
import { KPI_RATES } from '../data/initialData';
import {
  Calculator,
  Calendar,
  DollarSign,
  Award,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Printer,
  Share2
} from 'lucide-react';
import { KPISupervisorReportModal } from './KPISupervisorReportModal';

export const KPICalculator: React.FC = () => {
  const [mode, setMode] = useState<'month2' | 'month1'>('month2');
  const [hours, setHours] = useState<number>(165);
  const [chats, setChats] = useState<number>(1650);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isQuickCopied, setIsQuickCopied] = useState(false);

  // Calculate rate based on chats/hour
  const { chatsPerHour, ratePerChat, grossSalary, netSalary, taxAmount } = useMemo(() => {
    if (hours <= 0) return { chatsPerHour: 0, ratePerChat: 0, grossSalary: 0, netSalary: 0, taxAmount: 0 };

    if (mode === 'month1') {
      const gross = hours * 160;
      const tax = gross * 0.04;
      return {
        chatsPerHour: chats / hours,
        ratePerChat: 160 / (chats / hours || 1),
        grossSalary: gross,
        netSalary: gross - tax,
        taxAmount: tax
      };
    }

    const chvh = Number((chats / hours).toFixed(2));
    let rate = 16;
    if (chvh >= 13) rate = 28;
    else if (chvh >= 12.9) rate = 26;
    else if (chvh >= 11) rate = 24;
    else if (chvh >= 10) rate = 23;
    else if (chvh >= 9) rate = 21;
    else if (chvh >= 7) rate = 18;
    else rate = 16;

    const gross = chats * rate;
    const tax = gross * 0.04; // 4% self-employed tax
    return {
      chatsPerHour: chvh,
      ratePerChat: rate,
      grossSalary: gross,
      netSalary: gross - tax,
      taxAmount: tax
    };
  }, [mode, hours, chats]);

  // Quick copy text report directly to clipboard
  const handleQuickCopy = () => {
    const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    const text = [
      '📋 ОТЧЁТ ПО ВЫРАБОТКЕ И KPI ОПЕРАТОРА ЧАТА',
      'Проект: «Золотое Яблоко» (ООО «Телесейлз-Сервис»)',
      divider,
      `• Модель расчёта: ${mode === 'month1' ? '1-й месяц (фикс 160 ₽/ч)' : 'Со 2-го месяца (сдельная по ЧвЧ)'}`,
      `• Отработано часов: ${hours} ч (~${(hours / 12).toFixed(1)} смен по 12 ч)`,
      `• Закрыто диалогов: ${chats.toLocaleString('ru-RU')}`,
      `• Скорость закрытия (ЧвЧ): ${chatsPerHour.toFixed(1)} чатов/час`,
      `• Ставка за диалог: ${mode === 'month1' ? '160 ₽/ч' : `${ratePerChat} ₽ / чат`}`,
      divider,
      `• Валовый доход (до налога): ${Math.round(grossSalary).toLocaleString('ru-RU')} ₽`,
      `• Налог НПД (4%): ${Math.round(taxAmount).toLocaleString('ru-RU')} ₽`,
      `• К выплате («на руки»): ${Math.round(netSalary).toLocaleString('ru-RU')} ₽`,
      divider,
      `Статус: Передано на согласование супервайзеру`
    ].join('\n');

    navigator.clipboard.writeText(text);
    setIsQuickCopied(true);
    setTimeout(() => setIsQuickCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode toggle */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#84CC16]" />
            <h2 className="text-base font-bold text-[#1E201E] font-['Manrope']">
              Калькулятор оплаты и KPI оператора
            </h2>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            Официальная тарифная сетка «Телесейлз-Сервис» (проект «Золотое Яблоко»)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] text-xs font-semibold">
            <button
              onClick={() => setMode('month2')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mode === 'month2' ? 'bg-[#1E201E] text-white shadow-2xs' : 'text-[#4B5563] hover:text-[#1E201E]'
              }`}
            >
              Со 2-го месяца (KPI)
            </button>
            <button
              onClick={() => setMode('month1')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mode === 'month1' ? 'bg-[#1E201E] text-white shadow-2xs' : 'text-[#4B5563] hover:text-[#1E201E]'
              }`}
            >
              1-й месяц (160 ₽/ч)
            </button>
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3.5 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-[#1E201E] text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-2xs"
            title="Сформировать отчёт для супервайзера в формате PDF или текста"
          >
            <FileText className="w-4 h-4" />
            <span>Отчёт супервайзеру (PDF)</span>
          </button>
        </div>
      </div>

      {/* Simulator Inputs & Result Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Controls */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-5 lg:col-span-1">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-bold text-[#1E201E]">
              <span>Отработано часов в месяц</span>
              <span className="font-mono text-[#65A30D]">{hours} ч</span>
            </div>
            <input
              type="range"
              min="80"
              max="220"
              step="1"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full accent-[#84CC16] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#9CA3AF] font-mono">
              <span>80 ч (подработка)</span>
              <span>165 ч (норма)</span>
              <span>220 ч (макс)</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-bold text-[#1E201E]">
              <span>Количество закрытых чатов</span>
              <span className="font-mono text-[#65A30D]">{chats}</span>
            </div>
            <input
              type="range"
              min="400"
              max="2800"
              step="10"
              value={chats}
              onChange={(e) => setChats(Number(e.target.value))}
              className="w-full accent-[#84CC16] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#9CA3AF] font-mono">
              <span>500 (старт)</span>
              <span>1650 (среднее)</span>
              <span>2500+ (профи)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] space-y-2 text-xs text-[#6B7280]">
            <div className="flex items-center gap-1.5 text-[#1E201E] font-semibold">
              <Clock className="w-3.5 h-3.5 text-[#84CC16]" />
              <span>График: 2/2 по 12 часов</span>
            </div>
            <p className="leading-relaxed">
              Мой выбор смены: <strong>07:00–19:00 МСК</strong> (09:00–21:00 местного времени). Перерыв 1:30 (можно дробить).
            </p>
          </div>
        </div>

        {/* Big Output Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs lg:col-span-2 flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
              <div className="text-[11px] text-[#6B7280]">Чатов в час (ЧвЧ)</div>
              <div className="text-xl font-extrabold text-[#1E201E] font-mono mt-1">
                {chatsPerHour.toFixed(1)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
              <div className="text-[11px] text-[#6B7280]">Ставка за чат</div>
              <div className="text-xl font-extrabold text-[#65A30D] font-mono mt-1">
                {mode === 'month1' ? '160 ₽/ч' : `${ratePerChat} ₽`}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
              <div className="text-[11px] text-[#6B7280]">Налог НПД (4%)</div>
              <div className="text-xl font-extrabold text-[#6B7280] font-mono mt-1">
                {Math.round(taxAmount).toLocaleString('ru-RU')} ₽
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7FEE7] border border-[#A3E635]">
              <div className="text-[11px] text-[#3F6212] font-semibold">На руки (чистыми)</div>
              <div className="text-xl font-extrabold text-[#15803D] font-mono mt-1">
                {Math.round(netSalary).toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1E201E] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-[#A3E635] font-mono uppercase font-semibold">
                Итоговый расчёт за месяц
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono mt-1">
                {Math.round(grossSalary).toLocaleString('ru-RU')} ₽{' '}
                <span className="text-sm font-normal text-[#9CA3AF] font-sans">до налога</span>
              </div>
            </div>
            <div className="text-right text-xs text-[#9CA3AF] max-w-xs leading-relaxed">
              При 4% налоге самозанятого (с учётом неиспользованного бонуса 10 000 ₽) чистый доход составит{' '}
              <strong className="text-white">{Math.round(netSalary).toLocaleString('ru-RU')} ₽</strong>.
            </div>
          </div>

          {/* Payout Dates */}
          <div className="border-t border-[#F3F4F6] pt-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#9CA3AF] font-bold mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#84CC16]" /> Даты выплат (за прошлые периоды, в 3 части):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="text-xs font-bold text-[#1E201E]">17-е число</div>
                <div className="text-xs text-[#6B7280] mt-0.5">
                  Основная часть выплаты за прошлый месяц
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="text-xs font-bold text-[#1E201E]">26-е число</div>
                <div className="text-xs text-[#6B7280] mt-0.5">
                  60% от премии за прошлый месяц
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                <div className="text-xs font-bold text-[#1E201E]">6-е число след. мес.</div>
                <div className="text-xs text-[#6B7280] mt-0.5">
                  40% от премии за позапрошлый месяц
                </div>
              </div>
            </div>
          </div>

          {/* Supervisor Export Action Bar */}
          <div className="border-t border-[#F3F4F6] pt-4">
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3.5">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-[#84CC16]/20 border border-[#84CC16]/30 flex items-center justify-center text-[#65A30D] shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E201E] flex items-center gap-1.5">
                    <span>Отчёт для супервайзера</span>
                    <span className="px-1.5 py-0.2 text-[10px] font-mono bg-[#FEF2F2] text-[#DC2626] font-bold rounded-md border border-[#FECACA]">
                      PDF / Текст
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6B7280] mt-0.5">
                    Экспорт текущих расчётов с реквизитами оператора, сменами и графиком выплат
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleQuickCopy}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                    isQuickCopied
                      ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                      : 'bg-white hover:bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]'
                  }`}
                  title="Быстро скопировать готовый текст для отправки супервайзеру в мессенджер"
                >
                  {isQuickCopied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isQuickCopied ? 'Скопировано!' : 'Скопировать текст'}</span>
                </button>

                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-[#1E201E] hover:bg-[#374151] text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-2xs"
                  title="Открыть официальный бланк отчёта для печати в PDF или сохранения"
                >
                  <Printer className="w-3.5 h-3.5 text-[#A3E635]" />
                  <span>Печать в PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Benchmark Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[#1E201E] font-['Manrope']">
          Официальная тарифная сетка KPI (со 2-го месяца)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] font-mono">
                <th className="py-2.5 px-3">Чатов / час (ЧвЧ)</th>
                <th className="py-2.5 px-3">Ставка (₽ / чат)</th>
                <th className="py-2.5 px-3">Доход при норме 165ч</th>
                <th className="py-2.5 px-3">Уровень квалификации</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {KPI_RATES.map((row, idx) => {
                const isCurrent = Math.floor(chatsPerHour) === Math.floor(row.chatsPerHour);
                const standardChats = Math.round(165 * row.chatsPerHour);
                const sampleSalary = standardChats * row.ratePerChat;
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isCurrent ? 'bg-[#F7FEE7] font-semibold text-[#1E201E]' : 'hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono">
                      {row.chatsPerHour} чвч {isCurrent && '👈'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#65A30D]">
                      {row.ratePerChat} ₽
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {sampleSalary.toLocaleString('ru-RU')} ₽ ({standardChats} чатов)
                    </td>
                    <td className="py-2.5 px-3 text-[#6B7280]">{row.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supervisor Report Modal */}
      <KPISupervisorReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        data={{
          mode,
          hours,
          chats,
          chatsPerHour,
          ratePerChat,
          grossSalary,
          netSalary,
          taxAmount
        }}
      />
    </div>
  );
};
