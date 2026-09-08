import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { KBArticle, KBArticleVersion, ScriptItem, GlossaryTerm, TestQuestion, DatabaseTab } from '../types';
import {
  INITIAL_ARTICLES,
  INITIAL_SCRIPTS,
  INITIAL_GLOSSARY,
  INITIAL_TESTS
} from '../data/initialData';

interface DatabaseContextType {
  tab: DatabaseTab;
  setTab: (tab: DatabaseTab) => void;
  articles: KBArticle[];
  scripts: ScriptItem[];
  glossary: GlossaryTerm[];
  tests: TestQuestion[];
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  selectedArticleId: string | null;
  setSelectedArticleId: (id: string | null) => void;

  // CRUD actions
  addArticle: (article: Omit<KBArticle, 'id' | 'updatedAt'>) => void;
  updateArticle: (id: string, updates: Partial<KBArticle>, changeSummary?: string, author?: string) => void;
  rollbackArticleVersion: (articleId: string, targetVersionId: string, rollbackNote?: string) => boolean;
  createArticleSnapshot: (articleId: string, snapshotNote?: string) => boolean;
  deleteArticle: (id: string) => void;

  addScript: (script: Omit<ScriptItem, 'id' | 'updatedAt'>) => void;
  updateScript: (id: string, updates: Partial<ScriptItem>) => void;
  updateScriptTags: (scriptId: string, tags: string[]) => void;
  deleteScript: (id: string) => void;

  addGlossaryTerm: (term: Omit<GlossaryTerm, 'id'>) => void;
  updateGlossaryTerm: (id: string, updates: Partial<GlossaryTerm>) => void;
  deleteGlossaryTerm: (id: string) => void;

  addTestQuestion: (test: Omit<TestQuestion, 'id'>) => void;
  updateTestQuestion: (id: string, updates: Partial<TestQuestion>) => void;
  deleteTestQuestion: (id: string) => void;

  // Favorites
  favoriteArticleIds: string[];
  favoriteScriptIds: string[];
  toggleFavoriteArticle: (id: string) => void;
  toggleFavoriteScript: (id: string) => void;
  isFavoriteArticle: (id: string) => boolean;
  isFavoriteScript: (id: string) => boolean;

  resetDatabase: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonString: string) => boolean;
}

const STORAGE_KEY = 'aurelia_operator_database_v1';

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tab, setTab] = useState<DatabaseTab>('kb');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const [articles, setArticles] = useState<KBArticle[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_articles`);
      if (!saved) return INITIAL_ARTICLES;
      const parsed: KBArticle[] = JSON.parse(saved);
      if (!parsed.some((a) => a.id === 'kb-00')) {
        const kb00 = INITIAL_ARTICLES.find((a) => a.id === 'kb-00');
        if (kb00) return [kb00, ...parsed];
      }
      return parsed;
    } catch {
      return INITIAL_ARTICLES;
    }
  });

  const [scripts, setScripts] = useState<ScriptItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_scripts`);
      if (!saved) return INITIAL_SCRIPTS;
      const parsed: ScriptItem[] = JSON.parse(saved);
      return parsed.map((s) => {
        const defaultScript = INITIAL_SCRIPTS.find((init) => init.id === s.id);
        const tags = Array.isArray(s.tags) && s.tags.length > 0 ? s.tags : (defaultScript?.tags || []);
        return {
          ...s,
          tags
        };
      });
    } catch {
      return INITIAL_SCRIPTS;
    }
  });

  const [glossary, setGlossary] = useState<GlossaryTerm[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_glossary`);
      return saved ? JSON.parse(saved) : INITIAL_GLOSSARY;
    } catch {
      return INITIAL_GLOSSARY;
    }
  });

  const [tests, setTests] = useState<TestQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tests`);
      return saved ? JSON.parse(saved) : INITIAL_TESTS;
    } catch {
      return INITIAL_TESTS;
    }
  });

  const [favoriteArticleIds, setFavoriteArticleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_fav_articles`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favoriteScriptIds, setFavoriteScriptIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_fav_scripts`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_articles`, JSON.stringify(articles));
    } catch (e) {
      console.error('Failed to save articles:', e);
    }
  }, [articles]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_scripts`, JSON.stringify(scripts));
    } catch (e) {
      console.error('Failed to save scripts:', e);
    }
  }, [scripts]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_glossary`, JSON.stringify(glossary));
    } catch (e) {
      console.error('Failed to save glossary:', e);
    }
  }, [glossary]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_tests`, JSON.stringify(tests));
    } catch (e) {
      console.error('Failed to save tests:', e);
    }
  }, [tests]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_fav_articles`, JSON.stringify(favoriteArticleIds));
    } catch (e) {
      console.error('Failed to save favorite articles:', e);
    }
  }, [favoriteArticleIds]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_fav_scripts`, JSON.stringify(favoriteScriptIds));
    } catch (e) {
      console.error('Failed to save favorite scripts:', e);
    }
  }, [favoriteScriptIds]);

  // Global hotkey Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Article handlers
  const addArticle = (article: Omit<KBArticle, 'id' | 'updatedAt'>) => {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10);
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newId = `kb-custom-${Date.now()}`;
    const initialVersion: KBArticleVersion = {
      id: `ver-${newId}-v1`,
      versionNumber: 1,
      savedAt: `${formattedDate} ${timeStr}`,
      changeSummary: 'Создание статьи (первая редакция)',
      author: 'Оператор',
      code: article.code,
      title: article.title,
      category: article.category,
      summary: article.summary,
      content: [...article.content],
      rules: article.rules ? [...article.rules] : [],
      tags: [...article.tags],
      keyNumbers: article.keyNumbers ? [...article.keyNumbers] : []
    };

    const newArticle: KBArticle = {
      ...article,
      id: newId,
      version: 1,
      versions: [initialVersion],
      updatedAt: formattedDate
    };
    setArticles((prev) => [newArticle, ...prev]);
  };

  const updateArticle = (
    id: string,
    updates: Partial<KBArticle>,
    changeSummary?: string,
    author: string = 'Оператор'
  ) => {
    setArticles((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const currentVersionNumber = item.version || (item.versions && item.versions.length > 0 ? item.versions.length : 1);
        const existingVersions: KBArticleVersion[] = item.versions ? [...item.versions] : [];

        // If no versions exist yet, record base v1 from original state
        if (existingVersions.length === 0) {
          existingVersions.push({
            id: `ver-${item.id}-v1`,
            versionNumber: 1,
            savedAt: item.updatedAt ? `${item.updatedAt} 09:00` : new Date().toISOString().slice(0, 10),
            changeSummary: 'Начальная базовая редакция',
            author: 'База знаний',
            code: item.code,
            title: item.title,
            category: item.category,
            summary: item.summary,
            content: [...item.content],
            rules: item.rules ? [...item.rules] : [],
            tags: [...item.tags],
            keyNumbers: item.keyNumbers ? [...item.keyNumbers] : []
          });
        }

        // If current state wasn't archived in existingVersions, archive it
        if (!existingVersions.some((v) => v.versionNumber === currentVersionNumber)) {
          existingVersions.push({
            id: `ver-${item.id}-v${currentVersionNumber}`,
            versionNumber: currentVersionNumber,
            savedAt: item.updatedAt ? `${item.updatedAt} 10:00` : new Date().toISOString().slice(0, 10),
            changeSummary: 'Предыдущая редакция',
            author: 'Оператор',
            code: item.code,
            title: item.title,
            category: item.category,
            summary: item.summary,
            content: [...item.content],
            rules: item.rules ? [...item.rules] : [],
            tags: [...item.tags],
            keyNumbers: item.keyNumbers ? [...item.keyNumbers] : []
          });
        }

        const newVersionNumber = currentVersionNumber + 1;
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 10);
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const savedAtString = `${formattedDate} ${timeStr}`;

        const newVersionEntry: KBArticleVersion = {
          id: `ver-${item.id}-v${newVersionNumber}-${Date.now()}`,
          versionNumber: newVersionNumber,
          savedAt: savedAtString,
          changeSummary: changeSummary || 'Обновление статьи',
          author,
          code: updates.code !== undefined ? updates.code : item.code,
          title: updates.title !== undefined ? updates.title : item.title,
          category: updates.category !== undefined ? updates.category : item.category,
          summary: updates.summary !== undefined ? updates.summary : item.summary,
          content: updates.content !== undefined ? [...updates.content] : [...item.content],
          rules: updates.rules !== undefined ? [...updates.rules] : (item.rules ? [...item.rules] : []),
          tags: updates.tags !== undefined ? [...updates.tags] : [...item.tags],
          keyNumbers: updates.keyNumbers !== undefined ? [...updates.keyNumbers] : (item.keyNumbers ? [...item.keyNumbers] : [])
        };

        return {
          ...item,
          ...updates,
          version: newVersionNumber,
          versions: [...existingVersions, newVersionEntry],
          updatedAt: formattedDate
        };
      })
    );
  };

  const rollbackArticleVersion = (
    articleId: string,
    targetVersionId: string,
    rollbackNote?: string
  ): boolean => {
    let success = false;
    setArticles((prev) =>
      prev.map((item) => {
        if (item.id !== articleId) return item;

        const versions = item.versions || [];
        const target = versions.find(
          (v) => v.id === targetVersionId || String(v.versionNumber) === targetVersionId
        );
        if (!target) return item;

        const currentVersionNumber = item.version || (versions.length > 0 ? versions.length : 1);
        const newVersionNumber = currentVersionNumber + 1;
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 10);
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const savedAtString = `${formattedDate} ${timeStr}`;

        const rollbackVersionEntry: KBArticleVersion = {
          id: `ver-${item.id}-v${newVersionNumber}-${Date.now()}`,
          versionNumber: newVersionNumber,
          savedAt: savedAtString,
          changeSummary:
            rollbackNote ||
            `Откат к версии v.${target.versionNumber} (${target.changeSummary || 'Редакция ' + target.savedAt})`,
          author: 'Оператор',
          code: target.code,
          title: target.title,
          category: target.category,
          summary: target.summary,
          content: [...target.content],
          rules: target.rules ? [...target.rules] : [],
          tags: [...target.tags],
          keyNumbers: target.keyNumbers ? [...target.keyNumbers] : []
        };

        success = true;
        return {
          ...item,
          code: target.code,
          title: target.title,
          category: target.category,
          summary: target.summary,
          content: [...target.content],
          rules: target.rules ? [...target.rules] : [],
          tags: [...target.tags],
          keyNumbers: target.keyNumbers ? [...target.keyNumbers] : [],
          version: newVersionNumber,
          versions: [...versions, rollbackVersionEntry],
          updatedAt: formattedDate
        };
      })
    );
    return success;
  };

  const createArticleSnapshot = (articleId: string, snapshotNote: string = 'Контрольная точка сохранения'): boolean => {
    let success = false;
    setArticles((prev) =>
      prev.map((item) => {
        if (item.id !== articleId) return item;

        const currentVersionNumber = item.version || (item.versions && item.versions.length > 0 ? item.versions.length : 1);
        const existingVersions: KBArticleVersion[] = item.versions ? [...item.versions] : [];

        if (existingVersions.length === 0) {
          existingVersions.push({
            id: `ver-${item.id}-v1`,
            versionNumber: 1,
            savedAt: item.updatedAt ? `${item.updatedAt} 09:00` : new Date().toISOString().slice(0, 10),
            changeSummary: 'Начальная базовая редакция',
            author: 'База знаний',
            code: item.code,
            title: item.title,
            category: item.category,
            summary: item.summary,
            content: [...item.content],
            rules: item.rules ? [...item.rules] : [],
            tags: [...item.tags],
            keyNumbers: item.keyNumbers ? [...item.keyNumbers] : []
          });
        }

        const newVersionNumber = currentVersionNumber + 1;
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 10);
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const savedAtString = `${formattedDate} ${timeStr}`;

        const snapshotEntry: KBArticleVersion = {
          id: `ver-${item.id}-v${newVersionNumber}-${Date.now()}`,
          versionNumber: newVersionNumber,
          savedAt: savedAtString,
          changeSummary: snapshotNote,
          author: 'Оператор',
          code: item.code,
          title: item.title,
          category: item.category,
          summary: item.summary,
          content: [...item.content],
          rules: item.rules ? [...item.rules] : [],
          tags: [...item.tags],
          keyNumbers: item.keyNumbers ? [...item.keyNumbers] : []
        };

        success = true;
        return {
          ...item,
          version: newVersionNumber,
          versions: [...existingVersions, snapshotEntry],
          updatedAt: formattedDate
        };
      })
    );
    return success;
  };

  const deleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((item) => item.id !== id));
  };

  // Script handlers
  const addScript = (script: Omit<ScriptItem, 'id' | 'updatedAt'>) => {
    const newScript: ScriptItem = {
      ...script,
      tags: script.tags || [],
      id: `sc-custom-${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    setScripts((prev) => [newScript, ...prev]);
  };

  const updateScript = (id: string, updates: Partial<ScriptItem>) => {
    setScripts((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString().slice(0, 10) }
          : item
      )
    );
  };

  const updateScriptTags = (scriptId: string, tags: string[]) => {
    setScripts((prev) =>
      prev.map((item) =>
        item.id === scriptId
          ? { ...item, tags, updatedAt: new Date().toISOString().slice(0, 10) }
          : item
      )
    );
  };

  const deleteScript = (id: string) => {
    setScripts((prev) => prev.filter((item) => item.id !== id));
  };

  // Glossary handlers
  const addGlossaryTerm = (term: Omit<GlossaryTerm, 'id'>) => {
    const newTerm: GlossaryTerm = {
      ...term,
      id: `gl-custom-${Date.now()}`
    };
    setGlossary((prev) => [...prev, newTerm]);
  };

  const updateGlossaryTerm = (id: string, updates: Partial<GlossaryTerm>) => {
    setGlossary((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteGlossaryTerm = (id: string) => {
    setGlossary((prev) => prev.filter((item) => item.id !== id));
  };

  // Test handlers
  const addTestQuestion = (test: Omit<TestQuestion, 'id'>) => {
    const newTest: TestQuestion = {
      ...test,
      id: `t-custom-${Date.now()}`
    };
    setTests((prev) => [newTest, ...prev]);
  };

  const updateTestQuestion = (id: string, updates: Partial<TestQuestion>) => {
    setTests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteTestQuestion = (id: string) => {
    setTests((prev) => prev.filter((item) => item.id !== id));
  };

  // Favorites handlers
  const toggleFavoriteArticle = (id: string) => {
    setFavoriteArticleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleFavoriteScript = (id: string) => {
    setFavoriteScriptIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isFavoriteArticle = (id: string) => favoriteArticleIds.includes(id);
  const isFavoriteScript = (id: string) => favoriteScriptIds.includes(id);

  const resetDatabase = () => {
    setArticles(INITIAL_ARTICLES);
    setScripts(INITIAL_SCRIPTS);
    setGlossary(INITIAL_GLOSSARY);
    setTests(INITIAL_TESTS);
    setFavoriteArticleIds([]);
    setFavoriteScriptIds([]);
    localStorage.removeItem(`${STORAGE_KEY}_articles`);
    localStorage.removeItem(`${STORAGE_KEY}_scripts`);
    localStorage.removeItem(`${STORAGE_KEY}_glossary`);
    localStorage.removeItem(`${STORAGE_KEY}_tests`);
    localStorage.removeItem(`${STORAGE_KEY}_fav_articles`);
    localStorage.removeItem(`${STORAGE_KEY}_fav_scripts`);
  };

  const exportDatabaseJson = () => {
    const dump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      articles,
      scripts,
      glossary,
      tests,
      favoriteArticleIds,
      favoriteScriptIds
    };
    return JSON.stringify(dump, null, 2);
  };

  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.articles)) setArticles(parsed.articles);
      if (Array.isArray(parsed.scripts)) setScripts(parsed.scripts);
      if (Array.isArray(parsed.glossary)) setGlossary(parsed.glossary);
      if (Array.isArray(parsed.tests)) setTests(parsed.tests);
      if (Array.isArray(parsed.favoriteArticleIds)) setFavoriteArticleIds(parsed.favoriteArticleIds);
      if (Array.isArray(parsed.favoriteScriptIds)) setFavoriteScriptIds(parsed.favoriteScriptIds);
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        tab,
        setTab,
        articles,
        scripts,
        glossary,
        tests,
        isSearchOpen,
        setIsSearchOpen,
        selectedArticleId,
        setSelectedArticleId,
        addArticle,
        updateArticle,
        rollbackArticleVersion,
        createArticleSnapshot,
        deleteArticle,
        addScript,
        updateScript,
        updateScriptTags,
        deleteScript,
        addGlossaryTerm,
        updateGlossaryTerm,
        deleteGlossaryTerm,
        addTestQuestion,
        updateTestQuestion,
        deleteTestQuestion,
        favoriteArticleIds,
        favoriteScriptIds,
        toggleFavoriteArticle,
        toggleFavoriteScript,
        isFavoriteArticle,
        isFavoriteScript,
        resetDatabase,
        exportDatabaseJson,
        importDatabaseJson
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
