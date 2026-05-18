import React, { useEffect, useState } from 'react';
import Sidebar from '../components/workspace/Sidebar.jsx';
import KanbanBoard from '../components/workspace/KanbanBoard.jsx';
import ChatView from '../components/workspace/ChatView.jsx';

// ── 뷰 컴포넌트 ─────────────────────────────────────────────────────────────
const InboxView = () => (
  <div className="flex h-full min-h-0">
    <aside className="w-80 shrink-0 border-r border-white/5 bg-slate-950/90">
      <div className="border-b border-white/5 p-4">
        <h2 className="text-lg font-bold text-white">수신함</h2>
        <p className="mt-1 text-xs text-slate-500">초대 목록이 들어올 자리</p>
      </div>

      <div className="p-4 text-sm text-slate-500">
        목록 영역을 위한 기본 자리만 확보합니다.
      </div>
    </aside>
  </div>
);

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
      return <InboxView />;
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

      return [{ id, phase: 'opening' }, ...prev];
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
