import React, { useState } from 'react';
import { SCHEMES_DATA } from '../data/initialData';
import { SchemeTree } from '../types';
import { GitFork, ArrowRight, RotateCcw, ShieldAlert, CheckCircle2, AlertTriangle, Info, HelpCircle } from 'lucide-react';

export const SchemesView: React.FC = () => {
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(SCHEMES_DATA[0].id);

  const currentScheme = SCHEMES_DATA.find((s) => s.id === selectedSchemeId) || SCHEMES_DATA[0];

  // Decision state tracking for the active scheme: path of node IDs and choices
  const [currentNodeId, setCurrentNodeId] = useState<string>(currentScheme.rootNodeId);
  const [history, setHistory] = useState<{ nodeId: string; optionLabel: string }[]>([]);
  const [activeResult, setActiveResult] = useState<any | null>(null);

  const handleSchemeChange = (id: string) => {
    const s = SCHEMES_DATA.find((x) => x.id === id) || SCHEMES_DATA[0];
    setSelectedSchemeId(id);
    setCurrentNodeId(s.rootNodeId);
    setHistory([]);
    setActiveResult(null);
  };

  const handleChooseOption = (option: any) => {
    if (option.result) {
      setActiveResult(option.result);
      setHistory((prev) => [...prev, { nodeId: currentNodeId, optionLabel: option.label }]);
    } else if (option.nextNodeId) {
      setHistory((prev) => [...prev, { nodeId: currentNodeId, optionLabel: option.label }]);
      setCurrentNodeId(option.nextNodeId);
    }
  };

  const handleReset = () => {
    setCurrentNodeId(currentScheme.rootNodeId);
    setHistory([]);
    setActiveResult(null);
  };

  const currentNode = currentScheme.nodes[currentNodeId];

  return (
    <div className="space-y-5">
      {/* Scheme Selector Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <GitFork className="w-5 h-5 text-[#84CC16]" />
          <div>
            <h2 className="text-base font-bold text-[#1E201E] font-['Manrope']">
              Интерактивные схемы развилок и регламентов
            </h2>
            <p className="text-xs text-[#6B7280]">
              Нажимайте на варианты ситуации, чтобы мгновенно получить точный регламент действий
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SCHEMES_DATA.map((scheme) => (
            <button
              key={scheme.id}
              onClick={() => handleSchemeChange(scheme.id)}
              className={`p-3 text-left rounded-xl border transition-all ${
                selectedSchemeId === scheme.id
                  ? 'border-[#84CC16] bg-[#F7FEE7] text-[#1E201E] shadow-xs'
                  : 'border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#4B5563]'
              }`}
            >
              <div className="text-xs font-mono font-semibold text-[#65A30D] mb-1">
                {scheme.category}
              </div>
              <div className="text-sm font-bold text-[#1E201E] font-['Manrope']">
                {scheme.title}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Decision Tree Runner */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-6">
        {/* Breadcrumbs History */}
        <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280] flex-wrap">
            <span className="font-semibold text-[#1E201E]">Путь решения:</span>
            {history.length === 0 && <span className="italic">Начало сценария</span>}
            {history.map((step, idx) => (
              <React.Fragment key={idx}>
                <span className="px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#374151] font-medium">
                  {step.optionLabel}
                </span>
                <ArrowRight className="w-3 h-3 text-[#9CA3AF]" />
              </React.Fragment>
            ))}
          </div>

          {(history.length > 0 || activeResult) && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B7280] hover:text-[#1E201E]"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Начать заново
            </button>
          )}
        </div>

        {/* Active Result Banner OR Current Question */}
        {activeResult ? (
          <div
            className={`p-6 rounded-2xl border space-y-4 animate-in fade-in zoom-in-95 ${
              activeResult.variant === 'danger'
                ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                : activeResult.variant === 'warning'
                ? 'bg-[#FFFBEB] border-[#FCD34D]'
                : activeResult.variant === 'info'
                ? 'bg-[#EFF6FF] border-[#BFDBFE]'
                : 'bg-[#ECFDF5] border-[#A7F3D0]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {activeResult.variant === 'danger' ? (
                  <ShieldAlert className="w-6 h-6 text-[#DC2626]" />
                ) : activeResult.variant === 'warning' ? (
                  <AlertTriangle className="w-6 h-6 text-[#D97706]" />
                ) : activeResult.variant === 'info' ? (
                  <Info className="w-6 h-6 text-[#2563EB]" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-[#059669]" />
                )}
                <h3 className="text-lg font-bold text-[#1E201E] font-['Manrope']">
                  {activeResult.title}
                </h3>
              </div>

              {activeResult.actionAdvice && (
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/80 border border-black/10 text-[#1E201E]">
                  {activeResult.actionAdvice}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                Инструкция для оператора:
              </div>
              <ul className="space-y-1.5 pl-5 list-disc text-sm text-[#1E201E]">
                {activeResult.details.map((item: string, i: number) => (
                  <li key={i} className="leading-relaxed font-medium">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-black/10 flex justify-end">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-bold bg-white hover:bg-black/5 text-[#1E201E] border border-black/15 rounded-xl shadow-xs transition-colors"
              >
                Пройти другой сценарий
              </button>
            </div>
          </div>
        ) : currentNode ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#84CC16]" />
              <h3 className="text-lg font-bold text-[#1E201E] font-['Manrope']">
                {currentNode.question}
              </h3>
            </div>
            {currentNode.description && (
              <p className="text-sm text-[#6B7280]">{currentNode.description}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentNode.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleChooseOption(opt)}
                  className="p-4 text-left rounded-2xl border border-[#E5E7EB] hover:border-[#84CC16] hover:bg-[#F9FAFB] shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#1E201E] group-hover:text-[#65A30D]">
                        {opt.label}
                      </span>
                      {opt.badge && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#4B5563]">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.description && (
                      <p className="text-xs text-[#6B7280]">{opt.description}</p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-end text-xs font-semibold text-[#84CC16]">
                    Выбрать вариант <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Quick Summary Cards of all rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-2">
          <div className="text-xs font-mono font-bold text-[#059669]">ЭПК: Главное правило</div>
          <p className="text-xs text-[#4B5563] leading-relaxed">
            Если электронная карта доставлена: в РФ и КЗ возвращаем <strong>только получателю</strong>, даже при ошибке в номере. Номер ошибочного получателя отправителю <strong>не сообщаем</strong>!
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-2">
          <div className="text-xs font-mono font-bold text-[#D97706]">ППК: Главное правило</div>
          <p className="text-xs text-[#4B5563] leading-relaxed">
            Пластиковая карта на руках: в РФ/КЗ возврат <strong>только очно в магазине</strong> с паспортом. В Беларуси (РБ) — вернуть <strong>нельзя вообще</strong> по закону!
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-2">
          <div className="text-xs font-mono font-bold text-[#2563EB]">Промокоды: Лимит</div>
          <p className="text-xs text-[#4B5563] leading-relaxed">
            Сумма <strong>до 900 ₽</strong> — выдаем сами в ЕО без согласований. От <strong>1000 ₽</strong> — обязательно сначала одобрение старшего в спецчате.
          </p>
        </div>
      </div>
    </div>
  );
};
