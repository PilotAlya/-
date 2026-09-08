export type DatabaseTab = 'kb' | 'cheatsheet' | 'calendar' | 'scripts' | 'schemes' | 'favorites' | 'kpi' | 'glossary' | 'tests';

export interface DayShift {
  date: string; // YYYY-MM-DD
  type: 'work' | 'off' | 'extra' | 'vacation' | 'sick';
  hours: number;
  timeRange?: string; // e.g. "09:00 - 21:00"
  note?: string;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  description?: string;
  patternType: 'cyclic' | 'weekly';
  workDaysCount?: number; // e.g. 2 in 2/2, 3 in 3/3, 4 in 4/2
  offDaysCount?: number; // e.g. 2 in 2/2, 3 in 3/3, 2 in 4/2
  daysOfWeek?: number[]; // [0, 1, 2, 3, 4] for Mon-Fri
  hours: number; // e.g. 12, 9, 8
  timeRange: string; // e.g. "09:00 - 21:00"
  startDayOffset?: number; // default day of month to start pattern (1 = 1st of month)
  isBuiltIn?: boolean;
}

export interface KBArticleVersion {
  id: string;
  versionNumber: number;
  savedAt: string;
  changeSummary?: string;
  author?: string;
  code: string;
  title: string;
  category: string;
  summary: string;
  content: string[];
  rules?: string[];
  keyNumbers?: { label: string; value: string }[];
  tags: string[];
}

export interface KBArticle {
  id: string;
  code: string; // e.g. "01", "02", "15"
  title: string;
  category: string;
  day?: string;
  summary: string;
  content: string[];
  rules?: string[];
  keyNumbers?: { label: string; value: string }[];
  tags: string[];
  updatedAt: string;
  version?: number; // current revision number (e.g. 1, 2, 3)
  versions?: KBArticleVersion[]; // history of saved revisions
}

export interface ScriptItem {
  id: string;
  title: string;
  category: 'start' | 'otmena' | 'dostavka' | 'promo' | 'oplata' | 'tovar' | 'tech' | 'third' | 'empathy' | 'hard' | 'service';
  categoryLabel: string;
  when: string;
  template: string;
  variables: string[]; // e.g. ['[Имя]', '_____ ₽', '№…']
  isService?: boolean;
  notes?: string;
  tags: string[];
  updatedAt: string;
}

export interface DecisionNode {
  id: string;
  question: string;
  description?: string;
  options: {
    label: string;
    description?: string;
    badge?: string;
    nextNodeId?: string;
    result?: {
      title: string;
      details: string[];
      variant: 'success' | 'warning' | 'danger' | 'info';
      actionAdvice?: string;
    };
  }[];
}

export interface SchemeTree {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  rootNodeId: string;
  nodes: Record<string, DecisionNode>;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  fullForm?: string;
  category: 'Инструменты' | 'Процессы' | 'Роли' | 'Организации' | 'Статусы';
  definition: string;
  exampleOrNote?: string;
}

export interface KPIRow {
  chatsPerHour: number;
  ratePerChat: number;
  description: string;
}

export interface TestQuestion {
  id: string;
  day?: string;
  topic: string;
  question: string;
  correctAnswer: string;
  explanation?: string;
  options?: string[];
}

export interface QuickNote {
  id: string;
  text: string;
  category: 'call' | 'chat' | 'order' | 'promo' | 'urgent' | 'general';
  isPinned?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DatabaseState {
  articles: KBArticle[];
  scripts: ScriptItem[];
  glossary: GlossaryTerm[];
  tests: TestQuestion[];
}
