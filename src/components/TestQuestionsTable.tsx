import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { TestQuestion } from '../types';
import { GraduationCap, Eye, EyeOff, CheckCircle2, Play, BookOpen, RotateCcw, Award, Search, Filter } from 'lucide-react';

export const TestQuestionsTable: React.FC = () => {
  const { tests } = useDatabase();
  const [activeMode, setActiveMode] = useState<'table' | 'quiz'>('table');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // Quiz mode states
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [quizRevealed, setQuizRevealed] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Topics list with counts
  const topicsWithCount = useMemo(() => {
    const map = new Map<string, number>();
    tests.forEach((t) => {
      map.set(t.topic, (map.get(t.topic) || 0) + 1);
    });
    return Array.from(map.entries()).map(([topic, count]) => ({ topic, count }));
  }, [tests]);

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchTopic = selectedTopic === 'all' || t.topic === selectedTopic;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        t.question.toLowerCase().includes(q) ||
        t.topic.toLowerCase().includes(q) ||
        t.correctAnswer.toLowerCase().includes(q) ||
        (t.explanation && t.explanation.toLowerCase().includes(q));

      return matchTopic && matchSearch;
    });
  }, [tests, selectedTopic, search]);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuizAnswer = (knewIt: boolean) => {
    if (knewIt) setQuizScore((prev) => prev + 1);
    if (quizIdx + 1 < filteredTests.length) {
      setQuizIdx((prev) => prev + 1);
      setQuizRevealed(false);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setQuizIdx(0);
    setQuizScore(0);
    setQuizRevealed(false);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#84CC16]" />
          <div>
            <h2 className="text-base font-bold text-[#1E201E] font-['Manrope']">
              Вопросы аттестации и разборы регламентов
            </h2>
            <p className="text-xs text-[#6B7280]">
              {tests.length} проверочных вопросов по процедурам и регламентам линии
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] flex items-center text-xs font-semibold">
            <button
              onClick={() => setActiveMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeMode === 'table' ? 'bg-[#1E201E] text-white shadow-2xs' : 'text-[#4B5563]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Справочник
            </button>
            <button
              onClick={() => {
                setActiveMode('quiz');
                restartQuiz();
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeMode === 'quiz' ? 'bg-[#1E201E] text-white shadow-2xs' : 'text-[#4B5563]'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-[#84CC16]" /> Тренажёр
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Table & Reference */}
      {activeMode === 'table' ? (
        <div className="space-y-3">
          {/* Topic and search filters */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-3.5 shadow-xs space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Поиск по вопросу, теме, ответу..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-7 py-1.5 text-xs border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16] bg-[#F9FAFB]"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] hover:text-[#1E201E]"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="text-xs text-[#6B7280] font-mono self-end sm:self-center">
                Найдено: <strong>{filteredTests.length}</strong> из {tests.length}
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-[#F3F4F6]">
              <Filter className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 mr-1" />
              <button
                onClick={() => setSelectedTopic('all')}
                className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedTopic === 'all'
                    ? 'bg-[#1E201E] text-white shadow-xs'
                    : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                }`}
              >
                <span>Все темы</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  selectedTopic === 'all' ? 'bg-[#374151] text-[#A3E635]' : 'bg-[#E5E7EB] text-[#6B7280]'
                }`}>
                  {tests.length}
                </span>
              </button>
              {topicsWithCount.map(({ topic, count }) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedTopic === topic
                      ? 'bg-[#1E201E] text-white shadow-xs'
                      : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                  }`}
                >
                  <span>{topic}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    selectedTopic === topic ? 'bg-[#374151] text-[#A3E635]' : 'bg-[#E5E7EB] text-[#6B7280]'
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredTests.map((q, idx) => {
              const isRevealed = revealedIds[q.id];
              return (
                <div
                  key={q.id}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-2 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#4B5563]">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669]">
                          {q.topic}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#1E201E] font-['Manrope']">
                        {q.question}
                      </h4>
                    </div>

                    <button
                      onClick={() => toggleReveal(q.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#4B5563] hover:text-[#1E201E] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-xl transition-colors shrink-0"
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Скрыть
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Показать ответ
                        </>
                      )}
                    </button>
                  </div>

                  {/* Revealed Answer Box */}
                  {isRevealed && (
                    <div className="p-3 rounded-xl bg-[#F7FEE7] border border-[#A3E635] text-xs space-y-1 animate-in fade-in">
                      <div className="font-bold text-[#15803D] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Правильный ответ: {q.correctAnswer}</span>
                      </div>
                      {q.explanation && (
                        <p className="text-[#3F6212] leading-relaxed">
                          Пояснение: {q.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Mode 2: Interactive Flashcard Quiz */
        <div className="max-w-xl mx-auto space-y-4">
          {!quizFinished && filteredTests.length > 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-md text-center space-y-5">
              <div className="flex items-center justify-between text-xs text-[#6B7280] font-mono border-b border-[#F3F4F6] pb-3">
                <span>Вопрос {quizIdx + 1} из {filteredTests.length}</span>
                <span>Набрано: {quizScore}</span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669]">
                  {filteredTests[quizIdx].topic}
                </span>
                <h3 className="text-lg font-bold text-[#1E201E] font-['Manrope'] leading-snug">
                  {filteredTests[quizIdx].question}
                </h3>
              </div>

              {quizRevealed ? (
                <div className="p-4 rounded-2xl bg-[#F7FEE7] border border-[#A3E635] text-sm text-left space-y-2 animate-in fade-in">
                  <div className="font-bold text-[#15803D] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ответ: {filteredTests[quizIdx].correctAnswer}</span>
                  </div>
                  {filteredTests[quizIdx].explanation && (
                    <p className="text-xs text-[#3F6212] leading-relaxed">
                      {filteredTests[quizIdx].explanation}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setQuizRevealed(true)}
                  className="w-full py-3 px-4 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1E201E] text-sm font-bold rounded-2xl transition-colors cursor-pointer"
                >
                  Показать ответ
                </button>
              )}

              {quizRevealed && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleQuizAnswer(false)}
                    className="py-2.5 px-4 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] font-bold text-xs rounded-xl transition-colors"
                  >
                    Не знал
                  </button>
                  <button
                    onClick={() => handleQuizAnswer(true)}
                    className="py-2.5 px-4 bg-[#84CC16] hover:bg-[#65A30D] text-[#1E201E] font-bold text-xs rounded-xl transition-colors shadow-xs"
                  >
                    Знал! (+1)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-md text-center space-y-4">
              <Award className="w-12 h-12 text-[#84CC16] mx-auto" />
              <h3 className="text-xl font-bold text-[#1E201E] font-['Manrope']">
                Тестирование завершено!
              </h3>
              <p className="text-sm text-[#4B5563]">
                Правильных ответов: <strong className="text-[#1E201E] font-mono">{quizScore}</strong> из{' '}
                <span className="font-mono">{filteredTests.length}</span> (
                {Math.round((quizScore / (filteredTests.length || 1)) * 100)}%)
              </p>
              <button
                onClick={restartQuiz}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E201E] text-white text-xs font-bold rounded-xl hover:bg-[#374151] transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Пройти еще раз
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
