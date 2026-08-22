import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import HomeView from './views/HomeView';
import MarketView from './views/MarketView';
import ConversationView from './views/ConversationView';
import SettingsModal from './components/SettingsModal';
import BriefingModal from './components/BriefingModal';
import ManualModal from './components/ManualModal';
import OnboardingModal from './components/OnboardingModal';
import SavedPanel, { type SavedItem } from './components/SavedPanel';
import NotifPanel, { INITIAL_UNREAD } from './components/NotifPanel';

function App() {
  const [activeView, setActiveView] = useState<'home' | 'market' | 'briefing' | 'conversation'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [conversationKey, setConversationKey] = useState(0);
  const [assistantContext, setAssistantContext] = useState<{ name: string; starters: string[]; desc?: string } | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [assistantOrder, setAssistantOrder] = useState<string[]>([
    '회의록 문장정리', '이메일 문체변경', '번역 비서', '코드 최적화', '문서 요약 비서',
  ]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [savedPanelOpen, setSavedPanelOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [notifUnread, setNotifUnread] = useState(INITIAL_UNREAD);

  const toggleFavorite = (name: string) =>
    setFavorites(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);

  const handleSubmit = (text: string) => {
    setQuery(text);
    setAssistantContext(null);
    setActiveView('conversation');
    setConversationKey(k => k + 1);
  };

  const handleStartWithAssistant = (ctx: { name: string; starters: string[]; desc?: string }, initialQuery?: string) => {
    setQuery(initialQuery ?? '');
    setAssistantContext(ctx);
    setActiveView('conversation');
    setConversationKey(k => k + 1);
  };

  const handleSaveItem = (q: string, answer: string) => {
    setSavedItems((prev) => [...prev, { query: q, answer, savedAt: new Date() }]);
    setSavedPanelOpen(true);
    setNotifPanelOpen(false);
  };

  const toggleSavedPanel = () => {
    setSavedPanelOpen((v) => !v);
    setNotifPanelOpen(false);
  };
  const toggleNotifPanel = () => {
    setNotifPanelOpen((v) => !v);
    setSavedPanelOpen(false);
  };
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  return (
    <ThemeProvider>
      <div className="flex h-screen w-full overflow-hidden bg-white font-['Jeju_Samdasoo',sans-serif]">
        <Sidebar
          open={sidebarOpen}
          onToggle={toggleSidebar}
          activeView={activeView}
          onNavigate={setActiveView}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenManual={() => setManualOpen(true)}
          onSelectHistory={handleSubmit}
          savedPanelOpen={savedPanelOpen}
          onToggleSavedPanel={toggleSavedPanel}
          savedItemCount={savedItems.length}
        />

        {/* 저장 패널 — 사이드바 바로 오른쪽 */}
        <SavedPanel
          items={savedItems}
          open={savedPanelOpen}
          onClose={() => setSavedPanelOpen(false)}
          onRemove={(index) => setSavedItems(prev => prev.filter((_, itemIndex) => itemIndex !== index))}
        />

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-row h-full min-w-0 overflow-hidden">
          <div className="flex-1 min-w-0 overflow-hidden">
            {activeView === 'home' && (
              <HomeView
                onOpenBriefing={() => setActiveView('briefing')}
                onSubmit={handleSubmit}
                onStartWithAssistant={handleStartWithAssistant}
                savedItems={savedItems}
                savedPanelOpen={savedPanelOpen}
                onToggleSavedPanel={toggleSavedPanel}
                onToggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                notifPanelOpen={notifPanelOpen}
                notifUnread={notifUnread}
                onToggleNotifPanel={toggleNotifPanel}
                assistantOrder={assistantOrder}
                onOpenOnboarding={() => setOnboardingOpen(true)}
                onNavigate={setActiveView}
              />
            )}
            {activeView === 'market' && (
              <MarketView
                savedItems={savedItems}
                savedPanelOpen={savedPanelOpen}
                onToggleSavedPanel={toggleSavedPanel}
                onToggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                notifPanelOpen={notifPanelOpen}
                notifUnread={notifUnread}
                onToggleNotifPanel={toggleNotifPanel}
                onOpenBriefing={() => setActiveView('briefing')}
                onStartWithAssistant={handleStartWithAssistant}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                assistantOrder={assistantOrder}
              />
            )}
            {activeView === 'briefing' && (
              <BriefingModal
                onClose={() => setActiveView('home')}
                savedItems={savedItems}
                savedPanelOpen={savedPanelOpen}
                onToggleSavedPanel={toggleSavedPanel}
                onToggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                notifPanelOpen={notifPanelOpen}
                notifUnread={notifUnread}
                onToggleNotifPanel={toggleNotifPanel}
                onNavigate={setActiveView}
              />
            )}
            {activeView === 'conversation' && (
              <ConversationView
                key={conversationKey}
                initialQuery={query}
                assistantContext={assistantContext}
                onOpenBriefing={() => setActiveView('briefing')}
                savedItems={savedItems}
                savedPanelOpen={savedPanelOpen}
                onToggleSavedPanel={toggleSavedPanel}
                onSaveItem={handleSaveItem}
                onToggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                notifPanelOpen={notifPanelOpen}
                notifUnread={notifUnread}
                onToggleNotifPanel={toggleNotifPanel}
                assistantOrder={assistantOrder}
                onNavigate={setActiveView}
              />
            )}
          </div>

          <NotifPanel
            open={notifPanelOpen}
            onClose={() => setNotifPanelOpen(false)}
            onUnreadChange={setNotifUnread}
          />
        </div>

        {settingsOpen && (
          <SettingsModal
            onClose={() => setSettingsOpen(false)}
            favorites={favorites}
            onRemoveFavorite={toggleFavorite}
            assistantOrder={assistantOrder}
            onReorderAssistant={setAssistantOrder}
          />
        )}
        {manualOpen && <ManualModal onClose={() => setManualOpen(false)} />}
        {onboardingOpen && <OnboardingModal onClose={() => setOnboardingOpen(false)} />}
      </div>
    </ThemeProvider>
  );
}

export default App;
