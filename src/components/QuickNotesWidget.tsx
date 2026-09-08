import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  Package,
  Ticket,
  AlertCircle,
  MessageSquare,
  Image as ImageIcon,
  Plus,
  X,
  UploadCloud,
  CheckSquare,
  Square,
  Maximize2,
  ExternalLink,
  Sparkles,
  CreditCard,
  RotateCcw,
  UserCheck,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Play,
  Pause,
  Volume2,
  Tag
} from 'lucide-react';

const STORAGE_DRAFT_KEY = 'telesales_chat_scratchpad';
const STORAGE_ACTIONS_KEY = 'telesales_chat_quick_actions';
const STORAGE_IMAGES_KEY = 'telesales_chat_attached_images';
const STORAGE_AUDIO_KEY = 'telesales_chat_audio_memo';
const STORAGE_COLLAPSED_KEY = 'telesales_chat_widget_collapsed';

interface ChatActionItem {
  id: string;
  text: string;
  done: boolean;
}

const CHAT_TEMPLATES = [
  {
    label: 'Диалог в чате',
    icon: MessageSquare,
    template: 'Клиент в чате: \nНомер заказа: \nТелефон: \nВопрос / Суть обращения: \nРешение в чате: ',
    suggestedActions: [
      'Предупредить клиента о тайм-ауте (до 3 мин)',
      'Проверить статус заказа в Аксапте',
      'Отправить подтверждение решения в чат'
    ]
  },
  {
    label: 'Брак / Бой / Недовложение',
    icon: AlertCircle,
    template: 'БРАК / ПОВРЕЖДЕНИЕ\nЗаказ №: \nТовар: \nПрикреплено фото дефекта: Да\nФото штрихкода / батч-кода: Да\nРешение: Передано в отдел претензий / согласован промокод',
    suggestedActions: [
      'Запросить фото товара, упаковки и штрихкода',
      'Сверить срок обращения (не более 14 дней)',
      'Проверить наличие акта вскрытия от ТК',
      'Рассчитать промокод по матрице компенсаций'
    ]
  },
  {
    label: 'Сбой оплаты / Чек',
    icon: CreditCard,
    template: 'ОПЛАТА В ЧАТЕ\nЗаказ №: \nСумма:  ₽\nБанк / Способ: СБП / Карта / Долями\nСкриншот чека из банка: Прикреплен\nСтатус транзакции: Холдирование / Списано\nДействие: Передано в бухгалтерию / подтверждение разморозки',
    suggestedActions: [
      'Запросить скриншот электронного чека или выписки из банка',
      'Проверить статус транзакции и холда в Аксапте',
      'Уточнить корректность почты и телефона плательщика',
      'Проинформировать клиента о сроках разморозки банком'
    ]
  },
  {
    label: 'Доставка / Курьер',
    icon: Package,
    template: 'ДОСТАВКА В ЧАТЕ\nЗаказ №: \nСлужба доставки (DPD / СДЭК / Собственная): \nТрек-номер: \nПроблема: Задержка / не выходит на связь курьер\nДействие: Запрос координатору / перенос интервала',
    suggestedActions: [
      'Проверить геолокацию и трек в кабинете ТК',
      'Связаться с логистом / курьером',
      'Согласовать с клиентом новый интервал',
      'Зафиксировать комментарий в карточке заказа'
    ]
  },
  {
    label: 'Промокод / Бонусы',
    icon: Ticket,
    template: 'ПРОМОКОД В ЧАТЕ\nЗаказ №: \nПричина выдачи: \nНоминал:  ₽\nСрок действия: 14 дней\nОтправлен клиенту в чат: Да',
    suggestedActions: [
      'Проверить допустимый лимит по Регламенту №14',
      'Сгенерировать промокод в системе',
      'Отправить текст промокода клиенту в диалог'
    ]
  },
  {
    label: 'Отмена / Возврат',
    icon: RotateCcw,
    template: 'ОТМЕНА ЗАКАЗА В ЧАТЕ\nЗаказ №: \nПричина отмены: \nСтатус сборки: До передачи на сборку / Передан\nВозврат средств: Автоматически на карту оплаты',
    suggestedActions: [
      'Проверить статус заказа (отмена возможна до сборки)',
      'Сменить статус заказа в Аксапте на «Отменен»',
      'Проинформировать клиента о сроках зачисления (1-3 дня)',
      'Отправить подтверждение отмены в чат'
    ]
  },
  {
    label: 'Смена номера / Карта ЗЯ',
    icon: UserCheck,
    template: 'АВТОРИЗАЦИЯ / КАРТА ЗЯ\nСтарый телефон: \nНовый телефон: \nФИО владельца: \nНомер дисконтной карты: \nИдентификация: Пройдена (последний заказ / email)',
    suggestedActions: [
      'Идентифицировать клиента (email, состав последнего заказа)',
      'Проверить наличие дублирующего профиля в CRM',
      'Перепривязать карту лояльности к новому номеру',
      'Попросить клиента перезайти в приложение «Золотое Яблоко»'
    ]
  }
];

const PRESET_QUICK_ACTIONS = [
  'Предупредить о тайм-ауте (3 мин)',
  'Проверить заказ в Аксапте',
  'Запросить фото дефекта и штрихкода',
  'Запросить скриншот чека из банка',
  'Сверить по матрице компенсаций',
  'Связаться с курьерской службой',
  'Оформить отмену / возврат в CRM',
  'Сгенерировать промокод по регл. №14'
];

// Helper to downscale images so multiple screenshots fit comfortably in localStorage
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1200;
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const QuickNotesWidget: React.FC = () => {
  const [noteText, setNoteText] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_DRAFT_KEY) || '';
    } catch {
      return '';
    }
  });

  const [actions, setActions] = useState<ChatActionItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      { id: 'act-1', text: 'Проверить заказ в Аксапте', done: false },
      { id: 'act-2', text: 'Предупредить клиента о тайм-ауте (3 мин)', done: false }
    ];
  });

  const [newActionInput, setNewActionInput] = useState('');

  const [images, setImages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_IMAGES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COLLAPSED_KEY);
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Modal for previewing clicked photo
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  // Voice recording states
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedActions, setCopiedActions] = useState(false);

  // MediaRecorder Voice Memo states
  const [audioMemo, setAudioMemo] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_AUDIO_KEY) || null;
    } catch {
      return null;
    }
  });
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioRecordDuration, setAudioRecordDuration] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioTimerRef = useRef<any>(null);

  // Drag over state for file upload
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist draft in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DRAFT_KEY, noteText);
    } catch (e) {
      console.error('Failed to save chat draft', e);
    }
  }, [noteText]);

  // Persist actions in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIONS_KEY, JSON.stringify(actions));
    } catch (e) {
      console.error('Failed to save chat actions', e);
    }
  }, [actions]);

  // Persist images in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_IMAGES_KEY, JSON.stringify(images));
    } catch (e) {
      console.error('Failed to save attached images', e);
    }
  }, [images]);

  // Persist audio memo in localStorage
  useEffect(() => {
    try {
      if (audioMemo) {
        localStorage.setItem(STORAGE_AUDIO_KEY, audioMemo);
      } else {
        localStorage.removeItem(STORAGE_AUDIO_KEY);
      }
    } catch (e) {
      console.error('Failed to save audio memo', e);
    }
  }, [audioMemo]);

  // Persist collapsed state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COLLAPSED_KEY, JSON.stringify(isCollapsed));
    } catch (e) {
      console.error('Failed to save collapsed state', e);
    }
  }, [isCollapsed]);

  // Global paste handler: allows operators to paste screenshots from clipboard (PrtScn / Win+Shift+S)
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const compressed = await compressImageFile(file);
            setImages((prev) => [...prev, compressed]);
            if (isCollapsed) setIsCollapsed(false);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isCollapsed]);

  // Initialize Web Speech API for voice dictation
  useEffect(() => {
    const win = window as any;
    const SpeechRecognitionClass =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ru-RU';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let finalizedSegment = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalizedSegment += event.results[i][0].transcript + ' ';
          }
        }

        if (finalizedSegment) {
          setNoteText((prev) => {
            const trimmed = prev.trimEnd();
            if (!trimmed) return finalizedSegment.trimStart();
            return `${trimmed} ${finalizedSegment.trimStart()}`;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Доступ к микрофону заблокирован в браузере');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Ошибка записи: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Error initializing speech recognition', err);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoiceRecording = () => {
    if (!speechSupported) {
      // If Web Speech is not supported, start audio memo recording seamlessly
      if (isRecordingAudio) {
        stopAudioMemoRecording();
      } else {
        startAudioMemoRecording();
      }
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        console.error(e);
      }
      setIsListening(false);
    } else {
      setSpeechError(null);
      if (isCollapsed) setIsCollapsed(false);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        try {
          recognitionRef.current?.stop();
          setTimeout(() => recognitionRef.current?.start(), 150);
        } catch {
          // Fallback to audio memo recording
          startAudioMemoRecording();
        }
      }
    }
  };

  const startAudioMemoRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setSpeechError('Запись аудио не поддерживается в текущем браузере');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioMemo(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start(200);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecordingAudio(true);
      setAudioRecordDuration(0);
      audioTimerRef.current = setInterval(() => {
        setAudioRecordDuration((prev) => prev + 1);
      }, 1000);
      if (isCollapsed) setIsCollapsed(false);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setSpeechError('Не удалось получить доступ к микрофону для аудиозаписи');
    }
  };

  const stopAudioMemoRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error(e);
      }
      setIsRecordingAudio(false);
      clearInterval(audioTimerRef.current);
    }
  };

  const deleteAudioMemo = () => {
    if (isPlayingAudio && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    }
    setAudioMemo(null);
  };

  const togglePlayAudio = () => {
    if (!audioPlayerRef.current || !audioMemo) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleApplyTemplate = (tmpl: string, suggestedActions?: string[]) => {
    if (noteText.trim()) {
      setNoteText((prev) => `${prev.trimEnd()}\n\n${tmpl}`);
    } else {
      setNoteText(tmpl);
    }

    if (suggestedActions && suggestedActions.length > 0) {
      setActions((prev) => {
        const existingTexts = new Set(prev.map((a) => a.text.toLowerCase()));
        const toAdd = suggestedActions
          .filter((sa) => !existingTexts.has(sa.toLowerCase()))
          .map((sa) => ({ id: 'act-' + Date.now() + Math.random(), text: sa, done: false }));
        return [...toAdd, ...prev];
      });
    }

    if (isCollapsed) setIsCollapsed(false);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newImgs: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        try {
          const compressed = await compressImageFile(file);
          newImgs.push(compressed);
        } catch (e) {
          console.error('Error reading image file', e);
        }
      }
    }
    if (newImgs.length > 0) {
      setImages((prev) => [...prev, ...newImgs]);
      if (isCollapsed) setIsCollapsed(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) {
      await handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleToggleAction = (id: string) => {
    setActions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleAddAction = (textToAdd?: string) => {
    const text = (textToAdd || newActionInput).trim();
    if (!text) return;
    setActions((prev) => [
      ...prev,
      { id: 'act-' + Date.now() + Math.random(), text, done: false }
    ]);
    if (!textToAdd) setNewActionInput('');
  };

  const handleRemoveAction = (id: string) => {
    setActions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCopyNote = () => {
    if (!noteText.trim()) return;
    navigator.clipboard.writeText(noteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAllWithActions = () => {
    const pendingActions = actions.filter((a) => !a.done).map((a) => `• [ ] ${a.text}`);
    const doneActions = actions.filter((a) => a.done).map((a) => `• [x] ${a.text}`);

    let fullText = noteText.trim();

    if (actions.length > 0) {
      fullText += '\n\n--- ДЕЙСТВИЯ ПО КЕЙСУ ---\n';
      if (pendingActions.length > 0) {
        fullText += 'К выполнению:\n' + pendingActions.join('\n') + '\n';
      }
      if (doneActions.length > 0) {
        fullText += 'Выполнено:\n' + doneActions.join('\n') + '\n';
      }
    }

    if (images.length > 0) {
      fullText += `\n[Прикреплено фото/скриншотов: ${images.length} шт.]`;
    }

    if (audioMemo) {
      fullText += `\n[Записана голосовая аудиозаметка]`;
    }

    navigator.clipboard.writeText(fullText.trim());
    setCopiedActions(true);
    setTimeout(() => setCopiedActions(false), 2000);
  };

  const handleClearAll = () => {
    if (window.confirm('Очистить текст заметки, прикрепленные фото, аудиозапись и список действий?')) {
      setNoteText('');
      setImages([]);
      setActions([]);
      deleteAudioMemo();
      localStorage.removeItem(STORAGE_DRAFT_KEY);
      localStorage.removeItem(STORAGE_IMAGES_KEY);
      localStorage.removeItem(STORAGE_ACTIONS_KEY);
      localStorage.removeItem(STORAGE_AUDIO_KEY);
    }
  };

  const completedActionsCount = actions.filter((a) => a.done).length;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
      className={`mb-5 bg-white border rounded-2xl shadow-xs overflow-hidden transition-all ${
        isDraggingOver
          ? 'border-[#84CC16] ring-2 ring-[#84CC16]/30 bg-[#F7FEE7]'
          : 'border-[#E5E7EB]'
      }`}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFilesSelected(e.target.files)}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Header bar */}
      <div className="px-4 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-[#EF4444] text-white shadow-md animate-pulse'
                : 'bg-[#84CC16] text-[#1E201E] shadow-2xs font-bold'
            }`}
          >
            {isListening ? (
              <Mic className="w-4 h-4 animate-bounce" />
            ) : (
              <MessageSquare className="w-4 h-4 text-[#1E201E]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1E201E] font-['Manrope']">
                Оперативный блокнот чата
              </h3>
              {isListening ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                  Диктовка голосом...
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] hidden sm:inline">
                  чат-поддержка
                </span>
              )}

              {images.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                  Фото: {images.length}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#6B7280]">
              Фиксация обращений в чате · разбор фото дефектов и скриншотов · быстрые действия
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Attach Photo button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] transition-colors flex items-center gap-1 cursor-pointer"
            title="Прикрепить фото или скриншот из чата (или вставьте через Ctrl+V)"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="hidden sm:inline">Фото / Скриншот</span>
          </button>

          {/* Voice Dictation Button */}
          <button
            onClick={toggleVoiceRecording}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isListening
                ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-sm ring-2 ring-[#FCA5A5]'
                : 'bg-[#1E201E] hover:bg-[#374151] text-white'
            }`}
            title={isListening ? 'Остановить запись голоса' : 'Начать голосовую диктовку заметки'}
          >
            {isListening ? (
              <>
                <MicOff className="w-3.5 h-3.5" />
                <span>Стоп</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-[#A3E635]" />
                <span className="hidden sm:inline">Диктовать</span>
              </>
            )}
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="p-1.5 text-[#4B5563] hover:text-[#1E201E] hover:bg-[#E5E7EB] rounded-xl transition-colors cursor-pointer"
            title={isCollapsed ? 'Развернуть блокнот чата' : 'Свернуть'}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4 text-[#65A30D]" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Speech error notice if any */}
      {speechError && (
        <div className="px-4 py-2 bg-[#FEF2F2] border-b border-[#FCA5A5] flex items-center justify-between text-xs text-[#DC2626]">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            onClick={() => setSpeechError(null)}
            className="text-[11px] underline hover:no-underline ml-2 cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      )}

      {/* Collapsed State: Single line bar */}
      {isCollapsed ? (
        <div className="p-3 bg-white flex items-center gap-2">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Быстрая запись по чату (Ctrl+V чтобы вставить скриншот, клик «Развернуть» для действий)..."
            className="flex-1 px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16] bg-[#F9FAFB] font-mono"
          />
          {images.length > 0 && (
            <span className="text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-lg">
              📷 {images.length} фото
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(false)}
            className="px-3 py-1.5 text-xs font-semibold text-[#1E201E] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          >
            Развернуть
          </button>
        </div>
      ) : (
        /* Expanded State */
        <div className="p-4 space-y-3.5 bg-white">
          {/* Top row: Chat Templates & Paste tip */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono uppercase text-[#9CA3AF] font-bold mr-1">
                Кейсы чата:
              </span>
              {CHAT_TEMPLATES.map((tmpl) => {
                const Icon = tmpl.icon;
                return (
                  <button
                    key={tmpl.label}
                    onClick={() => handleApplyTemplate(tmpl.template, tmpl.suggestedActions)}
                    className="px-2.5 py-1 bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#E5E7EB] text-[#374151] rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    title={`Вставить шаблон «${tmpl.label}» и рекомендованные действия`}
                  >
                    <Icon className="w-3 h-3 text-[#65A30D]" />
                    <span>{tmpl.label}</span>
                  </button>
                );
              })}
            </div>

            <span className="text-[11px] text-[#9CA3AF] font-mono hidden md:inline">
              Скриншот можно вставить прямо из буфера через <kbd className="px-1 py-0.5 bg-[#F3F4F6] border rounded text-[10px]">Ctrl+V</kbd>
            </span>
          </div>

          {/* Textarea Scratchpad for Chat */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              placeholder="Записывайте детали диалога в чате, номер заказа, суть проблемы, или нажмите «Диктовать» голосом..."
              className={`w-full p-3.5 text-xs sm:text-sm font-mono border rounded-xl outline-none transition-all leading-relaxed ${
                isListening
                  ? 'border-[#EF4444] bg-[#FEF2F2]/30 ring-2 ring-[#FCA5A5]/40 text-[#1E201E]'
                  : 'border-[#E5E7EB] focus:border-[#84CC16] bg-[#FAFAFA] text-[#1E201E]'
              }`}
            />

            {/* Live voice pulse banner inside textarea when active */}
            {isListening && (
              <div className="absolute right-3 bottom-3 flex items-center gap-2 bg-[#EF4444] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm animate-pulse pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>Слушаю вас... Говорите текст для чата</span>
              </div>
            )}
          </div>

          {/* Audio Memo Player or Active Audio Recording */}
          {(audioMemo || isRecordingAudio) && (
            <div className="p-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between gap-3">
              <audio
                ref={audioPlayerRef}
                src={audioMemo || undefined}
                onEnded={() => setIsPlayingAudio(false)}
                onPause={() => setIsPlayingAudio(false)}
                className="hidden"
              />

              <div className="flex items-center gap-2.5 min-w-0">
                {isRecordingAudio ? (
                  <div className="w-8 h-8 rounded-lg bg-[#EF4444] text-white flex items-center justify-center animate-pulse shrink-0">
                    <Mic className="w-4 h-4 animate-bounce" />
                  </div>
                ) : (
                  <button
                    onClick={togglePlayAudio}
                    className="w-8 h-8 rounded-lg bg-[#1E201E] hover:bg-[#374151] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title={isPlayingAudio ? 'Пауза' : 'Воспроизвести аудиозаметку'}
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#1E201E]">
                      {isRecordingAudio ? 'Идет запись аудио...' : 'Голосовая аудиозаметка'}
                    </span>
                    {isRecordingAudio && (
                      <span className="text-[10px] font-mono font-bold text-[#DC2626] bg-[#FEE2E2] px-1.5 py-0.2 rounded">
                        {Math.floor(audioRecordDuration / 60)}:{(audioRecordDuration % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6B7280] truncate">
                    {isRecordingAudio
                      ? 'Говорите в микрофон, звук записывается'
                      : isPlayingAudio
                      ? 'Воспроизведение аудио'
                      : 'Запись сохранена локально для быстрого прослушивания'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {isRecordingAudio ? (
                  <button
                    onClick={stopAudioMemoRecording}
                    className="px-2.5 py-1 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Остановить
                  </button>
                ) : (
                  <button
                    onClick={deleteAudioMemo}
                    className="p-1.5 text-[#9CA3AF] hover:text-[#DC2626] rounded-lg hover:bg-white transition-colors cursor-pointer"
                    title="Удалить аудиозаметку"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ATTACHED PHOTOS & DROPZONE SECTION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#374151]">
                <ImageIcon className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Фотографии и скриншоты по обращению ({images.length})</span>
                <span className="text-[10px] text-[#9CA3AF] font-normal hidden sm:inline">
                  (брак, штрихкод, переписка, чек, статус ТК)
                </span>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Добавить фото</span>
              </button>
            </div>

            {images.length > 0 ? (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5">
                {images.map((imgSrc, idx) => (
                  <div
                    key={idx}
                    className="relative group shrink-0 w-24 h-24 rounded-xl border border-[#E5E7EB] overflow-hidden bg-[#F9FAFB] shadow-2xs"
                  >
                    <img
                      src={imgSrc}
                      alt={`Скриншот ${idx + 1}`}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setPreviewImage(imgSrc)}
                      title="Нажмите для увеличения"
                    />
                    {/* Zoom Icon overlay */}
                    <button
                      onClick={() => setPreviewImage(imgSrc)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                      title="Увеличить фото"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(idx);
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-[#DC2626] text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Удалить фото"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Quick Add Card */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-[#D1D5DB] hover:border-[#84CC16] bg-[#F9FAFB] hover:bg-[#F7FEE7] flex flex-col items-center justify-center gap-1 text-[#6B7280] hover:text-[#4D7C0F] transition-colors cursor-pointer shrink-0"
                  title="Прикрепить еще фото или скриншот"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-[10px] font-semibold">Еще фото</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="py-3.5 px-4 bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-dashed border-[#D1D5DB] rounded-xl flex items-center justify-center gap-2.5 text-xs text-[#6B7280] cursor-pointer transition-colors"
              >
                <UploadCloud className="w-4 h-4 text-[#9CA3AF]" />
                <span>
                  Нажмите или <strong>перетащите сюда фото</strong> (дефект, штрихкод, скриншот чата) или нажмите <kbd className="px-1 py-0.2 bg-white border rounded text-[10px]">Ctrl+V</kbd>
                </span>
              </div>
            )}
          </div>

          {/* QUICK ACTIONS CHECKLIST SECTION */}
          <div className="pt-2 border-t border-[#F3F4F6] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1E201E]">Быстрые действия по чату</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#F3F4F6] text-[#374151]">
                  {completedActionsCount} из {actions.length} выполнено
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {actions.length > 0 && (
                  <button
                    onClick={handleCopyAllWithActions}
                    className="text-[11px] font-semibold text-[#1E201E] hover:text-[#65A30D] flex items-center gap-1 transition-colors cursor-pointer"
                    title="Скопировать заметку вместе со списком действий"
                  >
                    {copiedActions ? (
                      <>
                        <Check className="w-3 h-3 text-[#16A34A]" />
                        <span className="text-[#16A34A]">Скопировано все!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Копировать все в CRM</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Action Preset Pills */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-[#9CA3AF] uppercase font-mono mr-1">
                + Добавить шаг:
              </span>
              {PRESET_QUICK_ACTIONS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleAddAction(preset)}
                  className="px-2 py-0.5 rounded-md bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] text-[11px] font-medium transition-colors cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>

            {/* Checklist Items */}
            {actions.length > 0 && (
              <div className="space-y-1.5 bg-[#F9FAFB] p-2.5 rounded-xl border border-[#E5E7EB] max-h-48 overflow-y-auto">
                {actions.map((action) => (
                  <div
                    key={action.id}
                    className={`flex items-center justify-between gap-2 p-1.5 rounded-lg transition-colors ${
                      action.done ? 'bg-white/80 opacity-70' : 'bg-white shadow-2xs'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleAction(action.id)}
                      className="flex items-center gap-2 text-left text-xs flex-1 cursor-pointer"
                    >
                      {action.done ? (
                        <CheckSquare className="w-4 h-4 text-[#16A34A] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-[#9CA3AF] shrink-0 hover:text-[#1E201E]" />
                      )}
                      <span
                        className={`${
                          action.done
                            ? 'line-through text-[#9CA3AF]'
                            : 'text-[#1E201E] font-medium'
                        }`}
                      >
                        {action.text}
                      </span>
                    </button>

                    <button
                      onClick={() => handleRemoveAction(action.id)}
                      className="p-1 text-[#D1D5DB] hover:text-[#DC2626] rounded transition-colors cursor-pointer"
                      title="Удалить шаг"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Custom Action Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Добавить свой шаг в список действий..."
                value={newActionInput}
                onChange={(e) => setNewActionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAction();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-xl outline-none focus:border-[#84CC16] bg-[#FAFAFA]"
              />
              <button
                onClick={() => handleAddAction()}
                disabled={!newActionInput.trim()}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#1E201E] hover:bg-[#374151] disabled:opacity-30 text-white transition-colors cursor-pointer"
              >
                Добавить
              </button>
            </div>
          </div>

          {/* Bottom Controls: Copy Note, Dictate, Clear */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F3F4F6]">
            <div className="flex items-center gap-2">
              {/* Copy Note Button */}
              <button
                onClick={handleCopyNote}
                disabled={!noteText.trim()}
                className="px-3 py-1.5 text-xs font-semibold bg-[#84CC16] hover:bg-[#65A30D] text-[#1E201E] rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#1E201E]" />
                    <span className="font-bold">Скопировано в буфер!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Скопировать текст заметки</span>
                  </>
                )}
              </button>

              {/* Dictate Voice */}
              <button
                onClick={toggleVoiceRecording}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isListening
                    ? 'bg-[#EF4444] text-white shadow-sm animate-pulse'
                    : 'bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151]'
                }`}
                title={isListening ? 'Остановить диктовку' : 'Диктовать текст заметки голосом'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Остановить диктовку</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-[#65A30D]" />
                    <span>Диктовать</span>
                  </>
                )}
              </button>

              {/* Record Audio Memo button */}
              <button
                onClick={isRecordingAudio ? stopAudioMemoRecording : startAudioMemoRecording}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isRecordingAudio
                    ? 'bg-[#EF4444] text-white shadow-sm ring-2 ring-[#FCA5A5] animate-pulse'
                    : 'bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151]'
                }`}
                title={isRecordingAudio ? 'Остановить аудиозапись' : 'Записать аудиосообщение / голосовую заметку'}
              >
                {isRecordingAudio ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Стоп аудио ({audioRecordDuration}с)</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{audioMemo ? 'Перезаписать аудио' : 'Запись звука'}</span>
                  </>
                )}
              </button>
            </div>

            {(noteText.trim() || images.length > 0 || actions.length > 0 || audioMemo) && (
              <button
                onClick={handleClearAll}
                className="text-xs text-[#9CA3AF] hover:text-[#DC2626] transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Очистить блокнот</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* PHOTO PREVIEW MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs"
          onClick={() => {
            setPreviewImage(null);
            setZoomLevel(1);
            setRotation(0);
          }}
        >
          <div
            className="relative max-w-5xl w-full max-h-[92vh] bg-[#1E201E] rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3 sm:px-4 bg-[#181A18] text-white flex items-center justify-between gap-3 text-xs border-b border-white/10">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#A3E635]" />
                <span className="font-bold">Детальный просмотр фото / скриншота из чата</span>
                <span className="text-[11px] text-[#9CA3AF] font-mono hidden sm:inline">
                  (масштаб {Math.round(zoomLevel * 100)}%, поворот {rotation}°)
                </span>
              </div>

              {/* Inspection Toolbar: Zoom / Rotate / Reset */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Уменьшить масштаб (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(3.5, +(z + 0.25).toFixed(2)))}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Увеличить масштаб (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Повернуть на 90 градусов"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setZoomLevel(1);
                    setRotation(0);
                  }}
                  className="px-2 py-1 text-[10px] font-mono font-bold bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-white/90"
                  title="Сбросить масштаб"
                >
                  100%
                </button>

                <div className="w-px h-4 bg-white/20 mx-1" />

                <button
                  onClick={() => {
                    setPreviewImage(null);
                    setZoomLevel(1);
                    setRotation(0);
                  }}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#DC2626] flex items-center justify-center text-white transition-colors cursor-pointer"
                  title="Закрыть"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Body with smooth zoom & rotate */}
            <div className="p-4 overflow-auto max-h-[calc(92vh-120px)] flex items-center justify-center bg-[#0F100F]">
              <div className="relative overflow-hidden transition-transform duration-150">
                <img
                  src={previewImage}
                  alt="Детальный просмотр"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease-out'
                  }}
                  className="max-w-full max-h-[72vh] object-contain rounded-lg select-none"
                />
              </div>
            </div>

            {/* Modal Footer with quick tag inserts */}
            <div className="p-2.5 bg-[#181A18] border-t border-white/10 flex items-center justify-between gap-2 flex-wrap text-xs text-white/80">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-[#9CA3AF] mr-1 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-[#A3E635]" />
                  Отметить фото в заметке:
                </span>
                {['Фото брака / боя', 'Штрихкод / батч', 'Скриншот чека', 'Скриншот ошибки', 'Наклейка ТК'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setNoteText((prev) => {
                        const trimmed = prev.trimEnd();
                        const tagText = `[Прикреплено фото: ${tag}]`;
                        return trimmed ? `${trimmed}\n${tagText}` : tagText;
                      });
                    }}
                    className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-[#84CC16] hover:text-[#1E201E] text-white text-[11px] transition-colors cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setPreviewImage(null);
                  setZoomLevel(1);
                  setRotation(0);
                }}
                className="px-3 py-1 bg-[#84CC16] hover:bg-[#65A30D] text-[#1E201E] font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
