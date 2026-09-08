import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { KBArticle, KBArticleVersion } from '../types';
import {
  X,
  RotateCcw,
  History,
  Clock,
  Check,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  FileText,
  Plus,
  Tag,
  ArrowLeftRight,
  User,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

interface ArticleVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: KBArticle | null;
}

export const ArticleVersionHistoryModal: React.FC<ArticleVersionHistoryModalProps> = ({
  isOpen,
  onClose,
  article
}) => {
  const { articles, rollbackArticleVersion, createArticleSnapshot } = useDatabase();

  // Keep fresh article from context so updates (like rollback or snapshot) reflect immediately
  const currentArticle = useMemo(() => {
    if (!article) return null;
    return articles.find((a) => a.id === article.id) || article;
  }, [articles, article]);

  // Construct all versions (fallback to baseline v1 if no versions saved yet)
  const allVersions: KBArticleVersion[] = useMemo(() => {
    if (!currentArticle) return [];
    if (currentArticle.versions && currentArticle.versions.length > 0) {
      // Sort newest version first
      return [...currentArticle.versions].sort((a, b) => b.versionNumber - a.versionNumber);
    }
    // Baseline version
    return [
      {
        id: `ver-${currentArticle.id}-v1`,
        versionNumber: currentArticle.version || 1,
        savedAt: currentArticle.updatedAt ? `${currentArticle.updatedAt} 09:00` : 'Начальная дата',
        changeSummary: 'Начальная базовая редакция регламента',
        author: 'База знаний',
        code: currentArticle.code,
        title: currentArticle.title,
        category: currentArticle.category,
        summary: currentArticle.summary,
        content: currentArticle.content,
        rules: currentArticle.rules,
        tags: currentArticle.tags,
        keyNumbers: currentArticle.keyNumbers
      }
    ];
  }, [currentArticle]);

  // Selected version for inspection & comparison
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'diff' | 'preview'>('diff');

  // Rollback confirmation dialog state
  const [isRollbackConfirmOpen, setIsRollbackConfirmOpen] = useState(false);
  const [rollbackNote, setRollbackNote] = useState('');
  const [rollbackSuccessMsg, setRollbackSuccessMsg] = useState<string | null>(null);

  // New snapshot dialog state
  const [isNewSnapshotOpen, setIsNewSnapshotOpen] = useState(false);
  const [snapshotNote, setSnapshotNote] = useState('');

  // Default selection to second version (previous) if available, or current version
  const selectedVersion = useMemo(() => {
    if (!allVersions.length) return null;
    if (selectedVersionId) {
      const found = allVersions.find((v) => v.id === selectedVersionId);
      if (found) return found;
    }
    // If there are multiple versions, default to the previous version so user immediately sees what changed!
    if (allVersions.length > 1) {
      return allVersions[1];
    }
    return allVersions[0];
  }, [allVersions, selectedVersionId]);

  // Current active version
  const currentActiveVersion = allVersions[0];
  const isSelectedCurrent = selectedVersion?.versionNumber === currentActiveVersion?.versionNumber;

  // Compute differences between selectedVersion and currentActiveVersion
  const differences = useMemo(() => {
    if (!selectedVersion || !currentActiveVersion) return null;

    const titleChanged = selectedVersion.title !== currentActiveVersion.title;
    const codeChanged = selectedVersion.code !== currentActiveVersion.code;
    const categoryChanged = selectedVersion.category !== currentActiveVersion.category;
    const summaryChanged = selectedVersion.summary !== currentActiveVersion.summary;

    // Tags diff
    const oldTags = selectedVersion.tags || [];
    const newTags = currentActiveVersion.tags || [];
    const addedTags = newTags.filter((t) => !oldTags.includes(t));
    const removedTags = oldTags.filter((t) => !newTags.includes(t));
    const retainedTags = oldTags.filter((t) => newTags.includes(t));

    // Rules diff
    const oldRules = selectedVersion.rules || [];
    const newRules = currentActiveVersion.rules || [];
    const addedRules = newRules.filter((r) => !oldRules.includes(r));
    const removedRules = oldRules.filter((r) => !newRules.includes(r));
    const retainedRules = oldRules.filter((r) => newRules.includes(r));

    // Content diff
    const oldContent = selectedVersion.content || [];
    const newContent = currentActiveVersion.content || [];
    const addedContent = newContent.filter((c) => !oldContent.includes(c));
    const removedContent = oldContent.filter((c) => !newContent.includes(c));
    const retainedContent = oldContent.filter((c) => newContent.includes(c));

    const hasAnyChange =
      titleChanged ||
      codeChanged ||
      categoryChanged ||
      summaryChanged ||
      addedTags.length > 0 ||
      removedTags.length > 0 ||
      addedRules.length > 0 ||
      removedRules.length > 0 ||
      addedContent.length > 0 ||
      removedContent.length > 0;

    return {
      titleChanged,
      codeChanged,
      categoryChanged,
      summaryChanged,
      addedTags,
      removedTags,
      retainedTags,
      addedRules,
      removedRules,
      retainedRules,
      addedContent,
      removedContent,
      retainedContent,
      hasAnyChange
    };
  }, [selectedVersion, currentActiveVersion]);

  if (!isOpen || !currentArticle) return null;

  // Handle rollback
  const handleExecuteRollback = () => {
    if (!selectedVersion) return;
    const ok = rollbackArticleVersion(currentArticle.id, selectedVersion.id, rollbackNote.trim());
    if (ok) {
      setRollbackSuccessMsg(`Регламент успешно откатан к версии v.${selectedVersion.versionNumber}!`);
      setIsRollbackConfirmOpen(false);
      setRollbackNote('');
      setTimeout(() => {
        setRollbackSuccessMsg(null);
      }, 4000);
    }
  };

  // Handle snapshot creation
  const handleCreateSnapshot = () => {
    if (!snapshotNote.trim()) return;
    const ok = createArticleSnapshot(currentArticle.id, snapshotNote.trim());
    if (ok) {
      setIsNewSnapshotOpen(false);
      setSnapshotNote('');
      setRollbackSuccessMsg('Контрольная точка версии успешно сохранена в истории!');
      setTimeout(() => {
        setRollbackSuccessMsg(null);
      }, 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
      style={{
        paddingTop: 'max(1rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
        paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))'
      }}
    >
      <div className="w-full max-w-5xl bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#84CC16]/20 border border-[#84CC16]/30 flex items-center justify-center text-[#4D7C0F] shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold bg-[#1E201E] text-[#BEF264] px-2 py-0.5 rounded-md">
                  [{currentArticle.code}]
                </span>
                <h2 className="text-sm sm:text-base font-bold text-[#1E201E]">
                  История версий и изменений
                </h2>
                <span className="text-xs text-[#6B7280]">·</span>
                <span className="text-xs font-medium text-[#4B5563] truncate max-w-xs sm:max-w-md">
                  «{currentArticle.title}»
                </span>
              </div>
              <div className="text-[11px] text-[#6B7280] mt-0.5 flex items-center gap-2">
                <span>Сохранено редакций: <strong>{allVersions.length}</strong></span>
                <span>•</span>
                <span>Текущая активная: <strong>v.{currentArticle.version || allVersions[0]?.versionNumber || 1}</strong></span>
                <span>•</span>
                <span className="text-[#059669] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Все правки зафиксированы
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewSnapshotOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-[#D1D5DB] hover:border-[#84CC16] hover:bg-[#F3F4F6] text-[#374151] rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Создать контрольную точку статьи прямо сейчас"
            >
              <Plus className="w-3.5 h-3.5 text-[#84CC16]" />
              <span>Создать точку</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[#E5E7EB] text-[#6B7280] hover:text-[#1E201E] transition-colors cursor-pointer"
              title="Закрыть окно"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success alert banner if rollback happened */}
        {rollbackSuccessMsg && (
          <div className="px-5 py-2.5 bg-[#ECFDF5] border-b border-[#A7F3D0] text-xs font-semibold text-[#065F46] flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
              <span>{rollbackSuccessMsg}</span>
            </div>
            <button
              onClick={() => setRollbackSuccessMsg(null)}
              className="text-[#065F46] hover:text-[#047857] text-xs p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body Layout: 2 Columns */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Column: Version Timeline */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-[#E5E7EB] bg-[#FAFAFA] flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-[#E5E7EB] bg-white flex items-center justify-between">
              <span className="text-xs font-bold text-[#1E201E] uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#84CC16]" />
                Хронология правок
              </span>
              <button
                onClick={() => setIsNewSnapshotOpen(true)}
                className="sm:hidden text-xs text-[#047857] font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Точка
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {allVersions.map((ver, idx) => {
                const isSelected = selectedVersion?.id === ver.id;
                const isCurrent = idx === 0;

                return (
                  <button
                    key={ver.id}
                    onClick={() => setSelectedVersionId(ver.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-white border-[#84CC16] shadow-sm ring-2 ring-[#84CC16]/20'
                        : 'bg-white hover:bg-[#F3F4F6] border-[#E5E7EB]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                          isCurrent
                            ? 'bg-[#84CC16] text-[#1E201E]'
                            : 'bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]'
                        }`}>
                          v.{ver.versionNumber}
                        </span>
                        {isCurrent ? (
                          <span className="px-1.5 py-0.5 bg-[#ECFDF5] text-[#047857] text-[10px] font-bold rounded-md border border-[#A7F3D0] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                            Текущая
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#6B7280]">Архивная</span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-[#9CA3AF] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ver.savedAt}
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-semibold text-[#1E201E] line-clamp-2">
                      {ver.changeSummary || 'Редакция регламента'}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#6B7280] pt-1.5 border-t border-[#F3F4F6]">
                      <span className="flex items-center gap-1 truncate max-w-[140px]">
                        <User className="w-3 h-3 text-[#9CA3AF]" />
                        {ver.author || 'Оператор'}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <span>{ver.content.length} п.</span>
                        {ver.rules && ver.rules.length > 0 && (
                          <span className="text-[#DC2626] font-bold">
                            ⚠️ {ver.rules.length}
                          </span>
                        )}
                        <span>#{ver.tags.length}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Comparison / Full View / Rollback */}
          <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
            {/* Action Bar & Mode Switcher */}
            <div className="px-5 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB] flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B7280]">Просмотр:</span>
                <div className="flex items-center p-0.5 bg-[#E5E7EB] rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setViewMode('diff')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'diff'
                        ? 'bg-white text-[#1E201E] shadow-2xs font-bold'
                        : 'text-[#4B5563] hover:text-[#1E201E]'
                    }`}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#84CC16]" />
                    <span>Сравнение с текущей (Diff)</span>
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      viewMode === 'preview'
                        ? 'bg-white text-[#1E201E] shadow-2xs font-bold'
                        : 'text-[#4B5563] hover:text-[#1E201E]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span>Полный текст версии</span>
                  </button>
                </div>
              </div>

              {/* Rollback action trigger */}
              <div>
                {!isSelectedCurrent ? (
                  <button
                    onClick={() => {
                      setRollbackNote(`Откат к версии v.${selectedVersion?.versionNumber}`);
                      setIsRollbackConfirmOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#1E201E] hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-2xs"
                    title={`Восстановить статью к состоянию редакции v.${selectedVersion?.versionNumber}`}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#BEF264]" />
                    <span>Откатить к версии v.{selectedVersion?.versionNumber}</span>
                  </button>
                ) : (
                  <div className="px-3 py-1 bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Вы просматриваете текущую редакцию</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Display Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {selectedVersion && (
                <>
                  {/* Selected Version Metadata Banner */}
                  <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-[#84CC16] text-[#1E201E] px-2 py-0.5 rounded-md">
                          Версия v.{selectedVersion.versionNumber}
                        </span>
                        <span className="text-xs font-bold text-[#1E201E]">
                          {selectedVersion.changeSummary || 'Без описания'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6B7280] mt-1 flex items-center gap-2">
                        <span>Сохранено: <strong>{selectedVersion.savedAt}</strong></span>
                        <span>•</span>
                        <span>Автор: <strong>{selectedVersion.author || 'Оператор'}</strong></span>
                        <span>•</span>
                        <span>Категория: <strong>{selectedVersion.category}</strong></span>
                      </div>
                    </div>

                    {!isSelectedCurrent && (
                      <button
                        onClick={() => {
                          setRollbackNote(`Откат к версии v.${selectedVersion.versionNumber}`);
                          setIsRollbackConfirmOpen(true);
                        }}
                        className="text-xs text-[#DC2626] hover:text-[#991B1B] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Вернуть эту версию
                      </button>
                    )}
                  </div>

                  {/* MODE 1: DIFF VIEW */}
                  {viewMode === 'diff' && differences && (
                    <div className="space-y-6">
                      {isSelectedCurrent ? (
                        <div className="p-8 text-center bg-[#F9FAFB] rounded-2xl border border-dashed border-[#D1D5DB] space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-[#059669] mx-auto" />
                          <p className="text-sm font-bold text-[#1E201E]">
                            Выбрана текущая активная редакция (v.{currentActiveVersion.versionNumber})
                          </p>
                          <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                            Выберите любую предыдущую версию в списке слева, чтобы увидеть визуальные различия (Diff) между ней и текущим текстом статьи.
                          </p>
                        </div>
                      ) : !differences.hasAnyChange ? (
                        <div className="p-6 text-center bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] text-xs text-[#6B7280]">
                          <Check className="w-6 h-6 text-[#84CC16] mx-auto mb-1" />
                          Текст и параметры версии v.{selectedVersion.versionNumber} идентичны текущей активной редакции.
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {/* Title / Code / Category Changes */}
                          {(differences.titleChanged || differences.codeChanged || differences.categoryChanged) && (
                            <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white space-y-2">
                              <span className="text-xs font-bold text-[#4B5563] uppercase font-mono tracking-wider">
                                Изменения в реквизитах статьи:
                              </span>
                              {differences.titleChanged && (
                                <div className="text-xs flex items-center gap-2 flex-wrap pt-1">
                                  <span className="font-semibold text-[#6B7280]">Заголовок:</span>
                                  <span className="line-through text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                    {selectedVersion.title}
                                  </span>
                                  <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                                    {currentActiveVersion.title}
                                  </span>
                                </div>
                              )}
                              {differences.categoryChanged && (
                                <div className="text-xs flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-[#6B7280]">Категория:</span>
                                  <span className="line-through text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                    {selectedVersion.category}
                                  </span>
                                  <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                                    {currentActiveVersion.category}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Summary Changes */}
                          {differences.summaryChanged && (
                            <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white space-y-2">
                              <span className="text-xs font-bold text-[#4B5563] uppercase font-mono tracking-wider">
                                Изменение выжимки (Summary):
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                                <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl">
                                  <div className="text-[10px] font-mono text-red-700 font-bold mb-1">
                                    Было в v.{selectedVersion.versionNumber}:
                                  </div>
                                  <p className="text-red-900">{selectedVersion.summary}</p>
                                </div>
                                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                                  <div className="text-[10px] font-mono text-emerald-700 font-bold mb-1">
                                    Сейчас в v.{currentActiveVersion.versionNumber}:
                                  </div>
                                  <p className="text-emerald-900">{currentActiveVersion.summary}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Rules / ОКК Penalty Diff */}
                          {(differences.addedRules.length > 0 || differences.removedRules.length > 0) && (
                            <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#DC2626] uppercase font-mono tracking-wider flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Различия в правилах и штрафах ОКК:
                                </span>
                              </div>
                              <div className="space-y-1.5 pt-1">
                                {differences.removedRules.map((rule, idx) => (
                                  <div
                                    key={`rem-r-${idx}`}
                                    className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2"
                                  >
                                    <span className="px-1.5 py-0.2 bg-red-200 text-red-900 font-mono font-bold rounded text-[10px]">
                                      - УДАЛЕНО В ТЕКУЩЕЙ
                                    </span>
                                    <span>{rule}</span>
                                  </div>
                                ))}
                                {differences.addedRules.map((rule, idx) => (
                                  <div
                                    key={`add-r-${idx}`}
                                    className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2"
                                  >
                                    <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 font-mono font-bold rounded text-[10px]">
                                      + ДОБАВЛЕНО В ТЕКУЩЕЙ
                                    </span>
                                    <span>{rule}</span>
                                  </div>
                                ))}
                                {differences.retainedRules.map((rule, idx) => (
                                  <div
                                    key={`ret-r-${idx}`}
                                    className="p-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs text-[#6B7280] flex items-start gap-2 opacity-80"
                                  >
                                    <span className="text-[10px] font-mono text-[#9CA3AF]">• Без изменений:</span>
                                    <span>{rule}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Content Lines Diff */}
                          {(differences.addedContent.length > 0 || differences.removedContent.length > 0) && (
                            <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white space-y-2.5">
                              <span className="text-xs font-bold text-[#4B5563] uppercase font-mono tracking-wider flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-[#84CC16]" />
                                Различия в пунктах регламента:
                              </span>
                              <div className="space-y-1.5 pt-1 font-sans text-xs">
                                {differences.removedContent.map((line, idx) => (
                                  <div
                                    key={`rem-c-${idx}`}
                                    className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2"
                                  >
                                    <span className="font-mono text-red-600 font-bold shrink-0">[-]</span>
                                    <span>{line}</span>
                                  </div>
                                ))}
                                {differences.addedContent.map((line, idx) => (
                                  <div
                                    key={`add-c-${idx}`}
                                    className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2"
                                  >
                                    <span className="font-mono text-emerald-600 font-bold shrink-0">[+]</span>
                                    <span>{line}</span>
                                  </div>
                                ))}
                                {differences.retainedContent.length > 0 && (
                                  <div className="p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[11px] text-[#6B7280] flex items-center justify-between">
                                    <span>Пунктов без изменений: {differences.retainedContent.length}</span>
                                    <span className="text-[10px] font-mono">совпадают</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Tags Diff */}
                          {(differences.addedTags.length > 0 || differences.removedTags.length > 0) && (
                            <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white space-y-2">
                              <span className="text-xs font-bold text-[#4B5563] uppercase font-mono tracking-wider flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-[#84CC16]" />
                                Изменения в тегах:
                              </span>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {differences.removedTags.map((tag) => (
                                  <span
                                    key={`rem-t-${tag}`}
                                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1"
                                  >
                                    <span>- #{tag}</span>
                                  </span>
                                ))}
                                {differences.addedTags.map((tag) => (
                                  <span
                                    key={`add-t-${tag}`}
                                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"
                                  >
                                    <span>+ #{tag}</span>
                                  </span>
                                ))}
                                {differences.retainedTags.map((tag) => (
                                  <span
                                    key={`ret-t-${tag}`}
                                    className="px-2 py-0.5 rounded-lg text-xs font-mono bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODE 2: FULL ARTICLE PREVIEW OF SELECTED VERSION */}
                  {viewMode === 'preview' && (
                    <div className="space-y-5 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-[#6B7280] uppercase tracking-wider mb-1">
                          <span>{selectedVersion.category}</span>
                          <span>•</span>
                          <span>Код: {selectedVersion.code}</span>
                        </div>
                        <h3 className="text-lg font-bold text-[#1E201E]">
                          {selectedVersion.title}
                        </h3>
                      </div>

                      {/* Summary */}
                      <div className="p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
                        <span className="text-[11px] font-mono text-[#6B7280] uppercase tracking-wider font-bold block mb-1">
                          Краткая суть регламента:
                        </span>
                        <p className="text-sm text-[#1E201E] leading-relaxed">
                          {selectedVersion.summary}
                        </p>
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <span className="text-[11px] font-mono text-[#6B7280] uppercase tracking-wider font-bold block">
                          Пункты и инструкции:
                        </span>
                        <div className="space-y-2">
                          {selectedVersion.content.map((point, i) => (
                            <div
                              key={i}
                              className="text-xs text-[#374151] leading-relaxed p-3 rounded-xl bg-[#F9FAFB] border border-[#F3F4F6]"
                            >
                              {point}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rules */}
                      {selectedVersion.rules && selectedVersion.rules.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-mono text-[#DC2626] uppercase tracking-wider font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Правила и штрафы ОКК:
                          </span>
                          <div className="space-y-1.5">
                            {selectedVersion.rules.map((rule, i) => (
                              <div
                                key={i}
                                className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 font-medium"
                              >
                                ⚠️ {rule}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {selectedVersion.tags && selectedVersion.tags.length > 0 && (
                        <div className="pt-2 border-t border-[#F3F4F6]">
                          <div className="flex flex-wrap gap-1.5">
                            {selectedVersion.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2.5 py-1 bg-[#F3F4F6] text-[#4B5563] text-xs font-mono rounded-lg border border-[#E5E7EB]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Footer Actions */}
            <div className="px-6 py-3.5 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-[#6B7280]">
                {selectedVersion && (
                  <span>
                    Выбрана: <strong>v.{selectedVersion.versionNumber}</strong> ({selectedVersion.savedAt})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {!isSelectedCurrent && selectedVersion && (
                  <button
                    onClick={() => {
                      setRollbackNote(`Откат к версии v.${selectedVersion.versionNumber}`);
                      setIsRollbackConfirmOpen(true);
                    }}
                    className="px-4 py-2 bg-[#84CC16] hover:bg-[#65A30D] text-[#1E201E] text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Откатить к версии v.{selectedVersion.versionNumber}</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-white hover:bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Rollback */}
      {isRollbackConfirmOpen && selectedVersion && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1E201E]">
                  Откатить регламент к версии v.{selectedVersion.versionNumber}?
                </h3>
                <p className="text-xs text-[#6B7280] mt-1">
                  Статья «{currentArticle.title}» будет возвращена к состоянию от {selectedVersion.savedAt}.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] text-xs text-[#4B5563] space-y-1">
              <p className="font-semibold text-[#1E201E]">Безопасный откат:</p>
              <p>
                Текущий текст статьи не удалится — он будет зафиксирован в истории как новая контрольная версия. Вы сможете отменить откат в любой момент.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1">
                Комментарий к откату (необязательно):
              </label>
              <input
                type="text"
                value={rollbackNote}
                onChange={(e) => setRollbackNote(e.target.value)}
                placeholder={`Откат к версии v.${selectedVersion.versionNumber}`}
                className="w-full px-3 py-2 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16] focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsRollbackConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleExecuteRollback}
                className="px-4 py-2 text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Подтвердить откат</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snapshot Creation Modal */}
      {isNewSnapshotOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5E7EB] shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#84CC16]/20 border border-[#84CC16]/30 flex items-center justify-center text-[#4D7C0F] shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1E201E]">
                  Создать контрольную точку версии
                </h3>
                <p className="text-xs text-[#6B7280] mt-1">
                  Зафиксируйте текущее состояние статьи «{currentArticle.title}» в истории для безопасных будущих правок.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4B5563] mb-1">
                Название или примечание к версии:
              </label>
              <input
                type="text"
                value={snapshotNote}
                onChange={(e) => setSnapshotNote(e.target.value)}
                placeholder="Например: Согласовано с супервайзером перед сменой"
                className="w-full px-3 py-2 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16] focus:bg-white"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsNewSnapshotOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateSnapshot}
                disabled={!snapshotNote.trim()}
                className="px-4 py-2 text-xs font-bold text-[#1E201E] bg-[#84CC16] hover:bg-[#65A30D] disabled:opacity-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Зафиксировать версию</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
