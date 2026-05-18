import React, { useEffect, useState } from 'react';
import Sidebar from '../components/workspace/Sidebar.jsx';
import KanbanBoard from '../components/workspace/KanbanBoard.jsx';
import ChatView from '../components/workspace/ChatView.jsx';
import InboxView from '../components/workspace/InboxView.jsx';

const SummaryView = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold text-white">요약 공간</h2>
  </div>
);

const ProfileView = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold text-white">프로필</h2>
  </div>
);

const WorkspaceSettingsView = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold text-white">워크스페이스 설정</h2>
  </div>
);

const renderPanel = (id, user) => {
  switch (id) {
    case 'inbox':
      return <InboxView user={user} />;
    case 'chat':
      return <ChatView />;
    case 'kanban':
      return <KanbanBoard userId={user?.userId} />;
    case 'summary':
      return <SummaryView />;
    case 'profile':
      return <ProfileView />;
    case 'workspace-settings':
      return <WorkspaceSettingsView />;
    default:
      return null;
  }
};

// ── WorkspacePage ────────────────────────────────────────────────────────────
const WorkspacePage = ({ user, onLogout }) => {
  // 패널 상태: opening -> open -> closing
  const [panels, setPanels] = useState([]);

  const handleSelect = (id) => {
    setPanels((prev) => {
      const existing = prev.find((panel) => panel.id === id);

      if (existing) {
        if (existing.phase === 'closing') {
          return prev;
        }

        return prev.map((panel) =>
          panel.id === id ? { ...panel, phase: 'closing' } : panel,
        );
      }

      if (id === 'inbox') {
        return [{ id, phase: 'opening' }, ...prev];
      }

      const inboxIndex = prev.findIndex((panel) => panel.id === 'inbox');

      if (inboxIndex === -1) {
        return [...prev, { id, phase: 'opening' }];
      }

      const nextPanels = [...prev];
      nextPanels.splice(inboxIndex + 1, 0, { id, phase: 'opening' });
      return nextPanels;
    });
  };

  useEffect(() => {
    const openingPanels = panels.filter((panel) => panel.phase === 'opening');

    if (openingPanels.length === 0) {
      return undefined;
    }

    const frameId = requestAnimationFrame(() => {
      setPanels((prev) =>
        prev.map((panel) =>
          panel.phase === 'opening' ? { ...panel, phase: 'open' } : panel,
        ),
      );
    });

    return () => cancelAnimationFrame(frameId);
  }, [panels]);

  useEffect(() => {
    const closingTimers = panels
      .filter((panel) => panel.phase === 'closing')
      .map((panel) =>
        setTimeout(() => {
          setPanels((prev) =>
            prev.filter((current) => current.id !== panel.id),
          );
        }, 220),
      );

    return () => {
      closingTimers.forEach((timerId) => clearTimeout(timerId));
    };
  }, [panels]);

  const openPanelIds = panels
    .filter((panel) => panel.phase !== 'closing')
    .map((panel) => panel.id);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-white">
      <Sidebar
        openPanels={openPanelIds}
        onSelect={handleSelect}
        nickname={user?.nickname}
        onLogout={onLogout}
      />

      <main className="flex flex-1 overflow-hidden divide-x divide-white/5">
        {panels.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-slate-600">
              사이드바에서 메뉴를 선택하세요.
            </p>
          </div>
        ) : (
          panels.map(({ id, phase }) => (
            <div
              key={id}
              className={`overflow-hidden transition-all duration-200 ease-out will-change-transform ${
                id === 'inbox'
                  ? `flex-none w-80 ${phase === 'opening' ? '-translate-x-8 opacity-0' : phase === 'closing' ? '-translate-x-8 opacity-0' : 'translate-x-0 opacity-100'}`
                  : `flex flex-col ${id === 'chat' ? 'flex-1' : 'flex-2'} ${phase === 'closing' ? 'translate-x-8 opacity-0' : 'translate-x-0 opacity-100'}`
              }`}
            >
              {renderPanel(id, user)}
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default WorkspacePage;
