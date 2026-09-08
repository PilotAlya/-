import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Download,
  FileText,
  User,
  Calendar,
  Clock,
  Award,
  ShieldCheck,
  Share2,
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { KPI_RATES } from '../data/initialData';

export interface KPISupervisorReportData {
  mode: 'month2' | 'month1';
  hours: number;
  chats: number;
  chatsPerHour: number;
  ratePerChat: number;
  grossSalary: number;
  netSalary: number;
  taxAmount: number;
}

interface KPISupervisorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: KPISupervisorReportData;
}

export const KPISupervisorReportModal: React.FC<KPISupervisorReportModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  // Operator profile fields stored locally
  const [operatorName, setOperatorName] = useState(() => {
    return localStorage.getItem('kpi_rep_operator_name') || '';
  });
  const [operatorId, setOperatorId] = useState(() => {
    return localStorage.getItem('kpi_rep_operator_id') || '';
  });
  const [period, setPeriod] = useState(() => {
    return localStorage.getItem('kpi_rep_period') || 'Сентябрь 2026';
  });
  const [schedule, setSchedule] = useState(() => {
    return localStorage.getItem('kpi_rep_schedule') || '2/2 по 12 ч (07:00–19:00 МСК)';
  });
  const [supervisorName, setSupervisorName] = useState(() => {
    return localStorage.getItem('kpi_rep_supervisor') || 'Супервайзер / Тимлид чат-линии';
  });
  const [note, setNote] = useState(() => {
    return (
      localStorage.getItem('kpi_rep_note') ||
      'Все смены отработаны по графику в «Ирис», стандарты обслуживания ОКК соблюдены, штрафов нет. Прошу согласовать расчёт.'
    );
  });

  const [activeTab, setActiveTab] = useState<'document' | 'text'>('document');
  const [isCopied, setIsCopied] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('kpi_rep_operator_name', operatorName);
    localStorage.setItem('kpi_rep_operator_id', operatorId);
    localStorage.setItem('kpi_rep_period', period);
    localStorage.setItem('kpi_rep_schedule', schedule);
    localStorage.setItem('kpi_rep_supervisor', supervisorName);
    localStorage.setItem('kpi_rep_note', note);
  }, [operatorName, operatorId, period, schedule, supervisorName, note]);

  if (!isOpen) return null;

  // Grade description
  const gradeInfo = (() => {
    if (data.mode === 'month1') {
      return {
        title: '1-й месяц (Адаптация)',
        desc: 'Фиксированная почасовая ставка 150 ₽/ч'
      };
    }
    const matched = KPI_RATES.slice().reverse().find((r) => data.chatsPerHour >= r.chatsPerHour);
    return {
      title: matched ? `${matched.chatsPerHour} чвч — ${matched.description}` : 'Базовый старт',
      desc: matched?.description || 'Минимальный порог'
    };
  })();

  const shiftsCount = (data.hours / 12).toFixed(1);
  const avgChatsPerShift = Math.round(data.chats / (data.hours / 12 || 1));
  const currentDateFormatted = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Plain Text Report Generator (for Telegram/Mattermost/Email)
  const generateTextReport = (): string => {
    const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    const lines = [
      '📋 ОТЧЁТ ПО ВЫРАБОТКЕ И KPI ОПЕРАТОРА ЧАТА',
      'Проект: «Аврелия» (ООО «Диалог Сервис»)',
      divider,
      `👤 Оператор: ${operatorName.trim() || 'Оператор чат-линии'}${operatorId.trim() ? ` (ID/Табель: ${operatorId.trim()})` : ''}`,
      `📅 Расчётный период: ${period}`,
      `⏰ График смен: ${schedule}`,
      `👥 Получатель: ${supervisorName}`,
      `📆 Дата формирования: ${currentDateFormatted}`,
      divider,
      '📊 ОПЕРАЦИОННЫЕ МЕТРИКИ:',
      `• Модель расчёта: ${data.mode === 'month1' ? '1-й месяц (фикс 150 ₽/час)' : 'Со 2-го месяца (сдельная по ЧвЧ)'}`,
      `• Отработано часов: ${data.hours} ч (эквивалентно ~${shiftsCount} смен по 12 ч)`,
      `• Закрыто диалогов (чатов): ${data.chats.toLocaleString('ru-RU')}`,
      `• Скорость закрытия (ЧвЧ): ${data.chatsPerHour.toFixed(1)} чатов/час`,
      `• Средняя выработка за смену: ~${avgChatsPerShift} чатов`,
      `• Тарифный грейд: ${gradeInfo.title}`,
      `• Ставка за диалог: ${data.mode === 'month1' ? '150 ₽/час' : `${data.ratePerChat} ₽ / чат`}`,
      divider,
      '💰 ФИНАНСОВЫЙ РАСЧЁТ (Самозанятость / НПД):',
      `• Валовое начисление: ${Math.round(data.grossSalary).toLocaleString('ru-RU')} ₽ (до налога)`,
      `• Налог НПД (4%): ${Math.round(data.taxAmount).toLocaleString('ru-RU')} ₽`,
      `• К выплате на руки (чистыми): ${Math.round(data.netSalary).toLocaleString('ru-RU')} ₽`,
      divider,
      '🗓 ГРАФИК ВЫПЛАТ ПО РЕГЛАМЕНТУ:',
      '• 17-е число: основная часть выплаты за отработанный период',
      '• 26-е число: 60% премиальной части за прошлый месяц',
      '• 6-е число след. мес.: 40% премиальной части за позапрошлый месяц',
      divider,
      `📝 КОММЕНТАРИЙ ОПЕРАТОРА:`,
      `${note.trim() || 'Все смены отработаны без нарушений. Прошу согласовать.'}`,
      divider,
      `Статус: Передано на согласование супервайзеру`
    ];

    return lines.join('\n');
  };

  // Copy to clipboard
  const handleCopy = () => {
    const text = generateTextReport();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Download .txt file
  const handleDownloadTxt = () => {
    const text = generateTextReport();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = operatorName.trim().replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_') || 'Operator';
    link.href = url;
    link.download = `Otchet_KPI_${safeName}_${period.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadNotice('Текстовый отчёт (.txt) скачан');
    setTimeout(() => setDownloadNotice(null), 2500);
  };

  // Full Printable HTML for clean A4 printing / PDF download
  const generatePrintableHtml = (): string => {
    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Отчет по KPI оператора - ${operatorName || 'Оператор'} - ${period}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1a1a1a;
      background: #ffffff;
      padding: 20px;
      font-size: 13px;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #1E201E;
      padding-bottom: 12px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-title h1 {
      font-size: 18px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1E201E;
    }
    .header-title .subtitle {
      font-size: 12px;
      color: #6B7280;
      margin-top: 3px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      background: #F3F4F6;
      border: 1px solid #E5E7EB;
      color: #1E201E;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    .card {
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 12px;
      background: #FAFAFA;
    }
    .card-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #6B7280;
      margin-bottom: 8px;
      border-bottom: 1px solid #EEEEEE;
      padding-bottom: 4px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 12px;
    }
    .row .lbl {
      color: #4B5563;
    }
    .row .val {
      font-weight: 700;
      color: #111827;
      text-align: right;
    }
    .metrics-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .metrics-table th, .metrics-table td {
      border: 1px solid #E5E7EB;
      padding: 8px 10px;
      text-align: left;
      font-size: 12px;
    }
    .metrics-table th {
      background: #F3F4F6;
      font-weight: 700;
      color: #374151;
    }
    .metrics-table td.num {
      text-align: right;
      font-weight: 700;
      font-family: monospace;
      font-size: 13px;
    }
    .highlight-box {
      background: #F7FEE7;
      border: 1.5px solid #84CC16;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .highlight-box .big-amount {
      font-size: 24px;
      font-weight: 900;
      font-family: monospace;
      color: #15803D;
    }
    .highlight-box .sub {
      font-size: 11px;
      color: #4D7C0F;
    }
    .comment-box {
      border: 1px dashed #D1D5DB;
      border-radius: 8px;
      padding: 10px 12px;
      background: #FFFFFF;
      margin-bottom: 20px;
      font-size: 11.5px;
      color: #374151;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid #E5E7EB;
    }
    .sign-line {
      border-bottom: 1px solid #111827;
      margin-top: 30px;
      margin-bottom: 5px;
    }
    .sign-caption {
      font-size: 10px;
      color: #6B7280;
      display: flex;
      justify-content: space-between;
    }
    .print-bar {
      margin-bottom: 15px;
      text-align: right;
    }
    .print-btn {
      background: #1E201E;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
    }
    @media print {
      .print-bar {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <button class="print-btn" onclick="window.print()">Распечатать / Сохранить в PDF</button>
  </div>

  <div class="header">
    <div class="header-title">
      <h1>Отчёт по выработке и расчёту KPI</h1>
      <div class="subtitle">Проект «Аврелия» • ООО «Диалог Сервис» • Линия чат-поддержки</div>
    </div>
    <div>
      <span class="badge">${period}</span>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-title">Данные сотрудника</div>
      <div class="row">
        <span class="lbl">Оператор:</span>
        <span class="val">${operatorName || 'Оператор линии'}</span>
      </div>
      <div class="row">
        <span class="lbl">ID / Табельный №:</span>
        <span class="val">${operatorId || '—'}</span>
      </div>
      <div class="row">
        <span class="lbl">График смен:</span>
        <span class="val">${schedule}</span>
      </div>
      <div class="row">
        <span class="lbl">Супервайзер:</span>
        <span class="val">${supervisorName}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Параметры тарификации</div>
      <div class="row">
        <span class="lbl">Режим расчёта:</span>
        <span class="val">${data.mode === 'month1' ? '1-й месяц (150 ₽/ч)' : 'Со 2-го месяца (сдельный)'}</span>
      </div>
      <div class="row">
        <span class="lbl">Тарифный грейд:</span>
        <span class="val">${gradeInfo.title}</span>
      </div>
      <div class="row">
        <span class="lbl">Ставка за диалог:</span>
        <span class="val">${data.mode === 'month1' ? '150 ₽/час' : data.ratePerChat + ' ₽/чат'}</span>
      </div>
      <div class="row">
        <span class="lbl">Налогообложение:</span>
        <span class="val">НПД (Самозанятый 4%)</span>
      </div>
    </div>
  </div>

  <table class="metrics-table">
    <thead>
      <tr>
        <th>Показатель выработки</th>
        <th style="width: 25%;">Значение</th>
        <th style="width: 35%;">Комментарий регламента</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Отработано часов в расчётном месяце</td>
        <td class="num">${data.hours} ч</td>
        <td>Эквивалентно ~${shiftsCount} смен по 12 часов</td>
      </tr>
      <tr>
        <td>Всего закрытых диалогов (чатов)</td>
        <td class="num">${data.chats.toLocaleString('ru-RU')}</td>
        <td>Успешно завершённые обращения в «Ирис»</td>
      </tr>
      <tr>
        <td>Интенсивность / скорость (ЧвЧ)</td>
        <td class="num">${data.chatsPerHour.toFixed(1)} чвч</td>
        <td>Чатов в час = ${data.chats} / ${data.hours}</td>
      </tr>
      <tr>
        <td>Среднее число чатов за смену (12ч)</td>
        <td class="num">~${avgChatsPerShift}</td>
        <td>Расчётная нагрузка на рабочую смену</td>
      </tr>
    </tbody>
  </table>

  <table class="metrics-table">
    <thead>
      <tr>
        <th>Финансовый блок</th>
        <th style="width: 25%;">Сумма</th>
        <th style="width: 35%;">Порядок выплат</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Валовое начисление (до налога)</td>
        <td class="num">${Math.round(data.grossSalary).toLocaleString('ru-RU')} ₽</td>
        <td>${data.mode === 'month1' ? `${data.hours} ч × 150 ₽` : `${data.chats} чатов × ${data.ratePerChat} ₽`}</td>
      </tr>
      <tr>
        <td>Налог самозанятого (НПД 4%)</td>
        <td class="num" style="color: #6B7280;">- ${Math.round(data.taxAmount).toLocaleString('ru-RU')} ₽</td>
        <td>Уплата налога через приложение «Мой налог»</td>
      </tr>
      <tr style="background: #F7FEE7; font-weight: bold;">
        <td>ИТОГО К ВЫПЛАТЕ («НА РУКИ»):</td>
        <td class="num" style="color: #15803D; font-size: 15px;">${Math.round(data.netSalary).toLocaleString('ru-RU')} ₽</td>
        <td>Чистый доход оператора</td>
      </tr>
    </tbody>
  </table>

  <div class="card" style="margin-bottom: 16px;">
    <div class="card-title">График выплат по регламенту компании:</div>
    <div style="font-size: 11.5px; color: #4B5563; line-height: 1.6;">
      • <strong>17-е число:</strong> Основная часть выплаты за прошлый месяц<br>
      • <strong>26-е число:</strong> 60% от премии за прошлый месяц<br>
      • <strong>6-е число след. месяца:</strong> 40% от премии за позапрошлый месяц
    </div>
  </div>

  ${note ? `
  <div class="comment-box">
    <strong>Примечание оператора:</strong><br>
    ${note}
  </div>
  ` : ''}

  <div class="signatures">
    <div>
      <div style="font-weight: 700; font-size: 11px;">Сдал (Оператор):</div>
      <div class="sign-line"></div>
      <div class="sign-caption">
        <span>${operatorName || 'Подпись оператора'}</span>
        <span>Дата: ${currentDateFormatted}</span>
      </div>
    </div>

    <div>
      <div style="font-weight: 700; font-size: 11px;">Принял (Супервайзер):</div>
      <div class="sign-line"></div>
      <div class="sign-caption">
        <span>${supervisorName}</span>
        <span>Дата: «____» _________ 2026 г.</span>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  // Trigger Print / PDF directly
  const handlePrint = () => {
    const html = generatePrintableHtml();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    } else {
      // Fallback: download HTML
      handleDownloadHtml();
    }
  };

  // Download standalone HTML that can be printed or saved to PDF on any device
  const handleDownloadHtml = () => {
    const html = generatePrintableHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = operatorName.trim().replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_') || 'Operator';
    link.href = url;
    link.download = `Otchet_KPI_${safeName}_${period.replace(/\s+/g, '_')}.html`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadNotice('HTML-бланк для сохранения в PDF скачан');
    setTimeout(() => setDownloadNotice(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between gap-3 bg-[#F9FAFB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#84CC16]/20 border border-[#84CC16]/40 flex items-center justify-center text-[#1E201E] shrink-0">
              <FileText className="w-5 h-5 text-[#65A30D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#1E201E] font-['Manrope']">
                  Отчёт по выработке и KPI для супервайзера
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#84CC16]/20 text-[#3F6212] border border-[#84CC16]/30">
                  PDF & Текст
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Готовый официальный расчёт с данными смен, ЧвЧ и финансовыми начислениями
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#E5E7EB] hover:bg-[#D1D5DB] flex items-center justify-center text-[#4B5563] shrink-0 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Operator Meta Customization Bar */}
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-[#1E201E] flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#84CC16]" />
                <span>Параметры отчёта (автосохранение)</span>
              </div>
              <span className="text-[11px] text-[#6B7280]">
                Заполняется 1 раз и сохраняется в профиле
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#6B7280] mb-1">
                  ФИО оператора
                </label>
                <input
                  type="text"
                  placeholder="например, Иванов Иван"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6B7280] mb-1">
                  Табельный номер / ID «Ирис»
                </label>
                <input
                  type="text"
                  placeholder="например, 1042"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6B7280] mb-1">
                  Расчётный период
                </label>
                <input
                  type="text"
                  placeholder="например, Сентябрь 2026"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-[#6B7280] mb-1">
                  График и смена
                </label>
                <input
                  type="text"
                  placeholder="2/2 по 12 ч (07:00–19:00 МСК)"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6B7280] mb-1">
                  Супервайзер / Получатель
                </label>
                <input
                  type="text"
                  placeholder="Супервайзер / Тимлид чат-линии"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#6B7280] mb-1">
                Примечание оператора (пояснения к сменам, дефектуре или ОКК)
              </label>
              <input
                type="text"
                placeholder="Смены отработаны согласно графику в «Ирис», стандарты обслуживания ОКК соблюдены..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16]"
              />
            </div>
          </div>

          {/* Format Switcher */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F6] rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('document')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'document'
                    ? 'bg-white text-[#1E201E] shadow-2xs'
                    : 'text-[#6B7280] hover:text-[#1E201E]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#84CC16]" />
                <span>Бланк документа (PDF)</span>
              </button>

              <button
                onClick={() => setActiveTab('text')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'text'
                    ? 'bg-white text-[#1E201E] shadow-2xs'
                    : 'text-[#6B7280] hover:text-[#1E201E]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Текст для чата / мессенджера</span>
              </button>
            </div>

            {/* Quick action buttons in tab header */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  isCopied
                    ? 'bg-[#059669] text-white'
                    : 'bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1E201E]'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Скопировано!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Скопировать текст
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-[#84CC16] hover:bg-[#65A30D] text-[#1E201E] text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Печать / Сохранить в PDF</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Document View (Visual A4 sheet) */}
          {activeTab === 'document' ? (
            <div className="border border-[#E5E7EB] rounded-2xl p-5 sm:p-7 bg-white shadow-xs space-y-6 text-[#1E201E]">
              {/* Document Header */}
              <div className="border-b-2 border-[#1E201E] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight font-['Manrope']">
                    Отчёт по выработке и расчёту KPI
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Проект «Аврелия» • ООО «Диалог Сервис» • Чат-поддержка клиентов
                  </p>
                </div>
                <div className="px-3 py-1 bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg font-mono text-xs font-bold text-[#1E201E]">
                  Период: {period}
                </div>
              </div>

              {/* Employee and Calculation Profile Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-1.5 text-xs">
                  <div className="text-[10px] font-mono font-bold uppercase text-[#6B7280] border-b border-[#E5E7EB] pb-1">
                    Сотрудник
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">ФИО:</span>
                    <span className="font-bold text-[#1E201E]">{operatorName || 'Оператор линии'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Табельный номер / ID:</span>
                    <span className="font-mono font-semibold">{operatorId || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">График:</span>
                    <span className="font-semibold">{schedule}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-1.5 text-xs">
                  <div className="text-[10px] font-mono font-bold uppercase text-[#6B7280] border-b border-[#E5E7EB] pb-1">
                    Тарификация
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Режим:</span>
                    <span className="font-bold text-[#1E201E]">
                      {data.mode === 'month1' ? '1-й месяц (фикс 150 ₽/ч)' : 'Со 2-го месяца (сдельный KPI)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Тарифный грейд:</span>
                    <span className="font-semibold text-[#65A30D]">{gradeInfo.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Налоговый статус:</span>
                    <span className="font-mono font-semibold">Самозанятый (НПД 4%)</span>
                  </div>
                </div>
              </div>

              {/* Metrics Breakdown Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#1E201E] uppercase font-mono tracking-wider">
                  1. Показатели выработки за период:
                </div>
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563]">
                      <tr>
                        <th className="py-2.5 px-3 font-medium">Метрика</th>
                        <th className="py-2.5 px-3 font-medium text-right">Значение</th>
                        <th className="py-2.5 px-3 font-medium hidden sm:table-cell">Расшифровка</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      <tr>
                        <td className="py-2.5 px-3 font-medium">Отработано часов</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-right text-sm text-[#1E201E]">
                          {data.hours} ч
                        </td>
                        <td className="py-2.5 px-3 text-[#6B7280] hidden sm:table-cell">
                          Эквивалентно ~{shiftsCount} смен по 12 часов
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium">Закрыто диалогов (чатов)</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-right text-sm text-[#1E201E]">
                          {data.chats.toLocaleString('ru-RU')}
                        </td>
                        <td className="py-2.5 px-3 text-[#6B7280] hidden sm:table-cell">
                          Зафиксировано в системе «Ирис»
                        </td>
                      </tr>
                      <tr className="bg-[#F7FEE7]">
                        <td className="py-2.5 px-3 font-semibold text-[#3F6212]">
                          Скорость закрытия (ЧвЧ)
                        </td>
                        <td className="py-2.5 px-3 font-mono font-extrabold text-right text-base text-[#15803D]">
                          {data.chatsPerHour.toFixed(1)}
                        </td>
                        <td className="py-2.5 px-3 text-[#4D7C0F] hidden sm:table-cell font-medium">
                          Чатов в час = {data.chats} / {data.hours} ч
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium">Ставка за единицу</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-right text-sm text-[#65A30D]">
                          {data.mode === 'month1' ? '150 ₽ / час' : `${data.ratePerChat} ₽ / чат`}
                        </td>
                        <td className="py-2.5 px-3 text-[#6B7280] hidden sm:table-cell">
                          Согласно тарифной сетке «Аврелия»
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#1E201E] uppercase font-mono tracking-wider">
                  2. Финансовый расчёт вознаграждения:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                    <div className="text-[11px] text-[#6B7280]">Валовое начисление:</div>
                    <div className="text-lg font-black font-mono text-[#1E201E] mt-0.5">
                      {Math.round(data.grossSalary).toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-[10px] text-[#9CA3AF] mt-0.5">до вычета налога</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                    <div className="text-[11px] text-[#6B7280]">Налог НПД (4%):</div>
                    <div className="text-lg font-black font-mono text-[#6B7280] mt-0.5">
                      - {Math.round(data.taxAmount).toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-[10px] text-[#9CA3AF] mt-0.5">налог самозанятого</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7FEE7] border border-[#A3E635]">
                    <div className="text-[11px] text-[#3F6212] font-semibold">К выплате на руки:</div>
                    <div className="text-xl font-black font-mono text-[#15803D] mt-0.5">
                      {Math.round(data.netSalary).toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-[10px] text-[#4D7C0F] mt-0.5">чистый доход</div>
                  </div>
                </div>
              </div>

              {/* Schedule of Payouts Note */}
              <div className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs space-y-1">
                <div className="font-bold text-[#1E201E] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#84CC16]" />
                  <span>График перечисления выплат:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-[#4B5563]">
                  <div>
                    <strong>17-е число:</strong> основная выплата за прошлый месяц (~50%)
                  </div>
                  <div>
                    <strong>26-е число:</strong> 60% от премии за прошлый месяц
                  </div>
                  <div>
                    <strong>6-е число:</strong> 40% от премии за позапрошлый месяц
                  </div>
                </div>
              </div>

              {/* Note */}
              {note && (
                <div className="p-3 rounded-xl border border-dashed border-[#D1D5DB] text-xs text-[#4B5563] bg-[#FAFAFA]">
                  <strong>Пояснение оператора:</strong> {note}
                </div>
              )}

              {/* Signatures */}
              <div className="pt-4 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div>
                  <div className="font-bold text-[#1E201E]">Сдал (Оператор):</div>
                  <div className="border-b border-[#1E201E] h-8 mt-2 flex items-end pb-1 font-mono text-[11px] text-[#6B7280]">
                    {operatorName || 'Подпись сотрудника'}
                  </div>
                  <div className="text-[10px] text-[#9CA3AF] mt-1">
                    Дата подачи: {currentDateFormatted}
                  </div>
                </div>

                <div>
                  <div className="font-bold text-[#1E201E]">Принял (Супервайзер):</div>
                  <div className="border-b border-[#1E201E] h-8 mt-2 flex items-end pb-1 font-mono text-[11px] text-[#6B7280]">
                    {supervisorName}
                  </div>
                  <div className="text-[10px] text-[#9CA3AF] mt-1">
                    Согласование и проверка в «Ирис»
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: Text View (Ready for Messenger) */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#6B7280]">
                <span>Форматированный текст готов для копирования в рабочий чат:</span>
                <span className="font-mono text-[11px]">UTF-8 Text</span>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  rows={17}
                  value={generateTextReport()}
                  className="w-full p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] font-mono text-xs text-[#1E201E] leading-relaxed resize-none focus:outline-none selection:bg-[#BEF264]"
                />
              </div>
            </div>
          )}

          {downloadNotice && (
            <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#15803D] font-medium text-center animate-in fade-in">
              ✓ {downloadNotice}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-[#F9FAFB] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadTxt}
              className="flex-1 sm:flex-initial px-3 py-2 bg-white hover:bg-[#F3F4F6] text-[#4B5563] text-xs font-semibold rounded-xl border border-[#E5E7EB] transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
              title="Скачать отчёт в формате .txt"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать .txt</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="flex-1 sm:flex-initial px-3 py-2 bg-white hover:bg-[#F3F4F6] text-[#4B5563] text-xs font-semibold rounded-xl border border-[#E5E7EB] transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
              title="Скачать документ .html для открытия и печати"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Скачать .html</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopy}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-2xs ${
                isCopied
                  ? 'bg-[#059669] text-white'
                  : 'bg-[#1E201E] hover:bg-[#374151] text-white'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" /> Скопировано!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Скопировать для чата
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-[#1E201E] text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              <span>Печать / Сохранить в PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
