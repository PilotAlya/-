/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { OmniSearchModal } from './components/OmniSearchModal';
import { KnowledgeBaseTable } from './components/KnowledgeBaseTable';
import { ScriptsTable } from './components/ScriptsTable';
import { SchemesView } from './components/SchemesView';
import { KPICalculator } from './components/KPICalculator';
import { GlossaryTable } from './components/GlossaryTable';
import { TestQuestionsTable } from './components/TestQuestionsTable';
import { CheatSheetView } from './components/CheatSheetView';
import { ShiftCalendar } from './components/ShiftCalendar';
import { FavoritesView } from './components/FavoritesView';
import { QuickNotesWidget } from './components/QuickNotesWidget';
import { RecordModal } from './components/RecordModal';
import { ExportImportModal } from './components/ExportImportModal';
import { PhoneSyncModal } from './components/PhoneSyncModal';
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';
import { KBArticle, ScriptItem, GlossaryTerm } from './types';

function DatabaseAppContent() {
  const { tab } = useDatabase();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<KBArticle | ScriptItem | GlossaryTerm | null>(null);

  const handleOpenAddModal = () => {
    setEditItem(null);
    setIsAddModalOpen(true);
  };

  const handleEditArticle = (article: KBArticle) => {
    setEditItem(article);
    setIsAddModalOpen(true);
  };

  const handleEditScript = (script: ScriptItem) => {
    setEditItem(script);
    setIsAddModalOpen(true);
  };

  const handleEditTerm = (term: GlossaryTerm) => {
    setEditItem(term);
    setIsAddModalOpen(true);
  };

  const renderActiveTab = () => {
    switch (tab) {
      case 'kb':
        return <KnowledgeBaseTable onEditArticle={handleEditArticle} />;
      case 'favorites':
        return <FavoritesView onEditArticle={handleEditArticle} onEditScript={handleEditScript} />;
      case 'cheatsheet':
        return <CheatSheetView />;
      case 'calendar':
        return <ShiftCalendar />;
      case 'scripts':
        return <ScriptsTable onEditScript={handleEditScript} />;
      case 'schemes':
        return <SchemesView />;
      case 'kpi':
        return <KPICalculator />;
      case 'glossary':
        return <GlossaryTable onEditTerm={handleEditTerm} onAddNewTerm={handleOpenAddModal} />;
      case 'tests':
        return <TestQuestionsTable />;
      default:
        return <KnowledgeBaseTable onEditArticle={handleEditArticle} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col selection:bg-[#BEF264] selection:text-[#1E201E]">
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenPhoneModal={() => setIsPhoneModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-4 lg:p-8 pb-24 lg:pb-8 flex flex-col lg:flex-row gap-6">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <QuickNotesWidget />
          {renderActiveTab()}
        </div>
      </main>

      <footer className="hidden lg:block border-t border-[#E5E7EB] bg-white py-4 px-6 text-center text-xs text-[#9CA3AF]">
        База данных оператора поддержки · ООО «Телесейлз-Сервис» для сети «Золотое Яблоко» · Все данные сохранены локально
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        onOpenAddModal={handleOpenAddModal}
        onOpenPhoneModal={() => setIsPhoneModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Global Modals */}
      <OmniSearchModal />
      <RecordModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditItem(null);
        }}
        editItem={editItem}
      />
      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
      <PhoneSyncModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
      />
      <PWAUpdatePrompt />
    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <DatabaseAppContent />
    </DatabaseProvider>
  );
}
