import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  KeyRound,
  Mail,
  HardDrive,
  Layers,
  FileSpreadsheet,
  Headphones,
  Coins,
  MessageSquare,
  LogOut,
  Sparkles,
  ShieldAlert,
  Info,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

interface SystemItem {
  id: string;
  stepNumber: number;
  name: string;
  shortDesc: string;
  badge?: string;
  url?: string;
  urlDisplay?: string;
  loginFormat: string;
  passwordFormat: string;
  actions?: string[];
  warning?: string;
  critical?: boolean;
  priorityOrder?: string;
  icon: React.FC<{ className?: string }>;
}

export const CheatSheetView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checkedSystems, setCheckedSystems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('telesales_morning_checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('telesales_morning_checklist', JSON.stringify(checkedSystems));
    } catch {
      // ignore
    }
  }, [checkedSystems]);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCheck = (id: string) => {
    setCheckedSystems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetChecklist = () => {
    setCheckedSystems({});
  };

  const systems: SystemItem[] = [
    {
      id: 'vdi',
      stepNumber: 1,
      name: 'VDI MTS (Удалённый рабочий стол)',
      shortDesc: 'Основной виртуальный рабочий стол оператора',
      badge: 'Шаг 1 — Главный вход',
      url: 'https://vdi-outcc.cloud.mts.ru/appblast/webclient/#/home',
      urlDisplay: 'vdi-outcc.cloud.mts.ru/.../#/home',
      loginFormat: 'Логин: свой',
      passwordFormat: '1-й шаг: 🔑 цифры из ключа (OTP) | 2-й шаг: свой пароль учетки',
      actions: [
        'Этап 1: вводим свой логин и код из генератора ключей 🔑',
        'Этап 2: повторно логин и свой постоянный пароль',
        'Выход в конце смены: ФИО в правом верхнем углу → Sign out'
      ],
      icon: HardDrive
    },
    {
      id: 'outlook',
      stepNumber: 2,
      name: 'Почта Outlook',
      shortDesc: 'Корпоративная электронная почта для писем и регламентов',
      url: 'https://owa.goldapple.ru',
      urlDisplay: 'owa.goldapple.ru',
      loginFormat: 'Логин: свой',
      passwordFormat: 'Пароль: свой',
      actions: ['Проверяем входящие письма, рассылки от супервизоров и доступы к системам'],
      icon: Mail
    },
    {
      id: 'yandex_disk',
      stepNumber: 3,
      name: 'Яндекс.Диск',
      shortDesc: 'Хранилище скриптов и эталонных файлов (ЭС)',
      loginFormat: 'Логин: из письма',
      passwordFormat: 'Пароль: из письма',
      actions: [
        'Открываем раздел «Скрипт»',
        'Переходим в папку «Общий доступ»',
        'Заходим в папку «ЭС» (Эталонные Скрипты)',
        'Скачиваем свежие актуальные файлы на рабочий стол'
      ],
      icon: HardDrive
    },
    {
      id: 'eo',
      stepNumber: 4,
      name: 'Единое Окно (ЕО)',
      shortDesc: 'Главная карточка клиента и интерфейс обработки заказов',
      loginFormat: 'Логин: свой',
      passwordFormat: 'Пароль: свой',
      actions: ['Используется для поиска клиентов по телефону, просмотра заказов и карточек обращений'],
      icon: Layers
    },
    {
      id: 'axapta',
      stepNumber: 5,
      name: 'Axapta (Аксапта)',
      shortDesc: 'ERP-система учета заказов, складов и финансовых проводок',
      loginFormat: 'Логин@goldapple.ru',
      passwordFormat: 'Пароль: свой',
      actions: [
        'Обязательно дописываем домен: @goldapple.ru',
        'Используется для проверки резервов складов, чеков и детальных статусов'
      ],
      icon: FileSpreadsheet
    },
    {
      id: 'servicedesk',
      stepNumber: 6,
      name: 'Service Desk (SD)',
      shortDesc: 'Система заявок и эскалации на смежные отделы',
      loginFormat: 'Логин@goldapple.ru',
      passwordFormat: 'Пароль: свой',
      actions: ['Для создания тикетов на IT, логистику, склады и старших специалистов'],
      icon: Headphones
    },
    {
      id: 'zk',
      stepNumber: 7,
      name: 'Золотая Корона (ЗК)',
      shortDesc: 'Проведение и проверка возвратов денежных средств',
      badge: 'КРИТИЧЕСКИЙ РЕЖИМ',
      critical: true,
      loginFormat: 'Логин: из письма',
      passwordFormat: 'Пароль: из письма (копировать только через Copy!)',
      actions: [
        '1. Вводим логин и пароль из письма',
        '2. Нажимаем «ОК»',
        '3. Выбираем/вводим: 400',
        '4. Нажимаем стрелочку вверху'
      ],
      warning:
        'ОШИБКА 5 РАЗ БЛОКИРУЕТ ЗК У ВСЕХ ОПЕРАТОРОВ! Делаем не более 2-3 попыток. Копируйте пароль через Copy без пробелов. Не заходит — сразу пишите супервизору!',
      icon: Coins
    },
    {
      id: 'sherlock',
      stepNumber: 8,
      name: 'Шерлок (Sherlock)',
      shortDesc: 'Рабочий чат-терминал с клиентами и готовыми шаблонами',
      badge: 'В ПОСЛЕДНЮЮ ОЧЕРЕДЬ!',
      priorityOrder: 'Запускаем строго после проверки всех остальных систем!',
      loginFormat: 'Логин: свой',
      passwordFormat: 'Пароль: из письма',
      actions: [
        'Заходим в Шерлок в самую последнюю очередь перед стартом линии!',
        'Смена: выставляем время смены строго ПО СВОЕМУ ЧАСОВОМУ ПОЯСУ',
        'Конец вашей фактической смены обязан совпадать с концом смены в Шерлоке',
        'Доп. часы: выставляем смену так, чтобы окончание совпадало по факту (на начало смены можно не смотреть)'
      ],
      icon: MessageSquare
    }
  ];

  const totalChecked = Object.values(checkedSystems).filter(Boolean).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Hero */}
      <div className="bg-[#1E201E] text-white rounded-3xl p-5 sm:p-7 shadow-sm border border-black/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-[#84CC16]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#84CC16]/20 border border-[#84CC16]/40 text-[#A3E635] text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" /> Шпаргалка доступов оператора
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-['Manrope'] tracking-tight text-white">
              Вход во все рабочие системы
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Ссылки, форматы логинов и паролей, алгоритм запуска перед сменой и критические правила безопасности
              для «Золотой Короны» и «Шерлока».
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <a
              href="https://vdi-outcc.cloud.mts.ru/appblast/webclient/#/home"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#84CC16] hover:bg-[#65A30D] active:bg-[#4D7C0F] text-[#1E201E] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs"
            >
              <span>Открыть VDI MTS</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() =>
                copyText(
                  'https://vdi-outcc.cloud.mts.ru/appblast/webclient/#/home',
                  'hero_vdi'
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/15 transition-all"
            >
              {copiedId === 'hero_vdi' ? <Check className="w-4 h-4 text-[#A3E635]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedId === 'hero_vdi' ? 'Ссылка скопирована' : 'Скопировать VDI'}</span>
            </button>
          </div>
        </div>

        {/* Morning Progress Tracker */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-300">
              Готовность к смене: <span className="font-bold text-white">{totalChecked} из {systems.length}</span> систем
            </div>
            <div className="w-32 sm:w-48 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#84CC16] to-[#A3E635] transition-all duration-300"
                style={{ width: `${(totalChecked / systems.length) * 100}%` }}
              />
            </div>
          </div>
          {totalChecked > 0 && (
            <button
              onClick={resetChecklist}
              className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="w-3 h-3" /> Сбросить отметки на новую смену
            </button>
          )}
        </div>
      </div>

      {/* Critical Alert 1: ЗОЛОТАЯ КОРОНА */}
      <div className="bg-[#FEF2F2] border-2 border-[#EF4444] rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#EF4444] text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#DC2626] text-white">
                КРИТИЧЕСКОЕ ПРАВИЛО ЛИНИИ
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#991B1B] font-['Manrope']">
                Памятка при входе в «Золотую Корону» (ЗК)
              </h3>
            </div>

            <div className="space-y-1.5 text-xs sm:text-sm text-[#7F1D1D] leading-relaxed">
              <p className="font-bold text-[#B91C1C]">
                ⚠️ Всего дается 5 попыток для ввода верного пароля! После 5 неверных попыток ЗК блокируется У ВСЕХ операторов!
              </p>
              <p>
                • <strong>Правило:</strong> вводить не более <strong>2–3 попыток</strong>. Если на 2-й раз не заходит — остановитесь, не блокируйте коллег!
              </p>
              <p>
                • Копируйте пароль строго через кнопку <strong>Copy</strong>, перед вставкой проверяйте, чтобы в начале и конце не было пробелов.
              </p>
              <p>
                • Порядок входа: <strong>Логин и пароль из письма → ОК → вводим 400 → стрелочка вверху</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alert 2: ШЕРЛОК */}
      <div className="bg-[#FFFBEB] border-2 border-[#F59E0B] rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#F59E0B] text-white flex items-center justify-center shrink-0 shadow-md">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#D97706] text-white">
                СТРОГО В ПОСЛЕДНЮЮ ОЧЕРЕДЬ
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#92400E] font-['Manrope']">
                Памятка при входе в «Шерлок» (Sherlock)
              </h3>
            </div>

            <div className="space-y-1.5 text-xs sm:text-sm text-[#78350F] leading-relaxed">
              <p>
                • <strong>Очередность:</strong> заходим в Шерлок <strong>в самую последнюю очередь</strong>, когда VDI, Outlook, ЕО, Аксапта и ЗК уже запущены и проверены.
              </p>
              <p>
                • <strong>Часовой пояс:</strong> выставляем время смены строго <strong>ПО СВОЕМУ ЧАСОВОМУ ПОЯСУ</strong>.
              </p>
              <p>
                • <strong>Конец смены:</strong> окончание смены по факту ОБЯЗАНО совпадать с окончанием смены в «Шерлоке» по вашему времени.
              </p>
              <p>
                • <strong>Дополнительные часы:</strong> выставляем смену так, чтобы фактическое окончание совпадало с окончанием в Шерлоке (на время начала смены можно не обращать внимания).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Systems Grid / Interactive Checklist */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base font-bold text-[#1E201E] font-['Manrope']">
              Пошаговый чеклист запуска систем
            </h3>
            <p className="text-xs text-[#6B7280]">
              Отмечайте системы галочкой по мере авторизации утром перед сменой
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-[#6B7280] hidden sm:inline">
            8 систем оператора
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systems.map((sys) => {
            const Icon = sys.icon;
            const isChecked = Boolean(checkedSystems[sys.id]);

            return (
              <div
                key={sys.id}
                className={`rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                  sys.critical
                    ? 'bg-red-50/50 border-red-200 hover:border-red-400'
                    : isChecked
                    ? 'bg-[#F7FEE7]/60 border-[#A3E635] shadow-xs'
                    : 'bg-white border-[#E5E7EB] hover:border-[#D1D5DB] shadow-xs'
                }`}
              >
                <div>
                  {/* Top Bar inside card */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => toggleCheck(sys.id)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                          isChecked
                            ? 'bg-[#84CC16] text-[#1E201E] shadow-2xs'
                            : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                        }`}
                        title={isChecked ? 'Отмечено' : 'Отметить запуск'}
                      >
                        {isChecked ? <CheckCircle2 className="w-5 h-5 text-[#1E201E]" /> : sys.stepNumber}
                      </button>
                      <div>
                        <h4 className="text-sm font-bold text-[#1E201E] font-['Manrope'] flex items-center gap-1.5">
                          {sys.name}
                        </h4>
                        <p className="text-[11px] text-[#6B7280]">{sys.shortDesc}</p>
                      </div>
                    </div>

                    {sys.badge && (
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                          sys.critical
                            ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]'
                            : 'bg-[#F3F4F6] text-[#1E201E] border border-[#E5E7EB]'
                        }`}
                      >
                        {sys.badge}
                      </span>
                    )}
                  </div>

                  {/* Credentials pill */}
                  <div className="p-3 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2 mb-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[#6B7280]">Логин:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#1E201E]">{sys.loginFormat}</span>
                        {sys.loginFormat.includes('@goldapple.ru') && (
                          <button
                            onClick={() => copyText('@goldapple.ru', `${sys.id}_login`)}
                            className="p-1 hover:bg-white rounded text-[#6B7280] hover:text-[#1E201E]"
                            title="Скопировать @goldapple.ru"
                          >
                            {copiedId === `${sys.id}_login` ? (
                              <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-[#F3F4F6] pt-1.5">
                      <span className="text-[#6B7280]">Пароль:</span>
                      <span className="font-mono font-semibold text-[#1E201E] text-right">
                        {sys.passwordFormat}
                      </span>
                    </div>

                    {sys.url && (
                      <div className="flex items-center justify-between gap-2 border-t border-[#F3F4F6] pt-1.5">
                        <span className="text-[#6B7280]">Ссылка:</span>
                        <div className="flex items-center gap-1.5">
                          <a
                            href={sys.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#2563EB] hover:underline font-mono text-[11px] truncate max-w-[160px] sm:max-w-[200px]"
                          >
                            {sys.urlDisplay || sys.url}
                          </a>
                          <button
                            onClick={() => copyText(sys.url!, `${sys.id}_url`)}
                            className="p-1 hover:bg-white rounded text-[#6B7280] hover:text-[#1E201E]"
                            title="Скопировать ссылку"
                          >
                            {copiedId === `${sys.id}_url` ? (
                              <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Steps */}
                  {sys.actions && (
                    <div className="space-y-1 mb-3">
                      {sys.actions.map((act, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-[#4B5563]">
                          <span className="text-[#84CC16] font-bold">•</span>
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Warning */}
                  {sys.warning && (
                    <div className="p-2.5 rounded-xl bg-red-100/70 border border-red-200 text-[11px] font-semibold text-red-900 leading-tight">
                      {sys.warning}
                    </div>
                  )}
                </div>

                {/* Card footer buttons */}
                <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => toggleCheck(sys.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
                      isChecked
                        ? 'bg-[#ECFDF5] text-[#059669]'
                        : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                    }`}
                  >
                    {isChecked ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{isChecked ? 'Авторизовано' : 'Отметить вход'}</span>
                  </button>

                  {sys.url && (
                    <a
                      href={sys.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-[#1E201E] hover:text-[#4D7C0F] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Перейти</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* End of Shift Reminder */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#1E201E] text-[#84CC16] flex items-center justify-center shrink-0">
            <LogOut className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#1E201E]">Выход из рабочего стола (VDI) в конце смены:</div>
            <div className="text-[#6B7280]">
              Нажмите на своё <strong>ФИО</strong> в правом верхнем углу → выберите <strong>Sign out</strong>
            </div>
          </div>
        </div>
        <span className="text-[11px] font-mono text-[#9CA3AF] px-2 py-1 rounded bg-[#F9FAFB] border border-[#F3F4F6]">
          Обязательно закрывать сессию
        </span>
      </div>
    </div>
  );
};
