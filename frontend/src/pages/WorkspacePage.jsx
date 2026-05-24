import React, { useState } from 'react';
import Sidebar from '../components/workspace/Sidebar.jsx';
import KanbanBoard from '../components/workspace/KanbanBoard.jsx';
import ChatView from '../components/workspace/ChatView.jsx';

// ── 뷰 컴포넌트 ─────────────────────────────────────────────────────────────
const InboxView = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold text-white">수신함</h2>
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
    case 'inbox':              return <InboxView />;
    case 'chat':               return <ChatView />;
    case 'kanban':             return <KanbanBoard userId={user?.userId} workspaceId={user?.workspaceId} />;
    case 'summary':            return <SummaryView />;
    case 'profile':            return <ProfileView />;
    case 'workspace-settings': return <WorkspaceSettingsView />;
    default:                   return null;
  }
};

// ── WorkspacePage ────────────────────────────────────────────────────────────
const WorkspacePage = ({ user, onLogout }) => {
  // 열려 있는 패널 목록 (왼쪽부터 오른쪽 순)
  // 새 패널은 맨 왼쪽에 삽입, 마지막 패널이 남은 공간을 채움
  const [openPanels, setOpenPanels] = useState([]);

  const handleSelect = (id) => {
    setOpenPanels((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)   // 이미 열려 있으면 닫기
        : [id, ...prev]                   // 새 패널은 맨 왼쪽에 추가
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-white">
      <Sidebar
        openPanels={openPanels}
        onSelect={handleSelect}
        nickname={user?.nickname}
        onLogout={onLogout}
      />

      <main className="flex flex-1 overflow-hidden divide-x divide-white/5">
        {openPanels.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-slate-600">사이드바에서 메뉴를 선택하세요.</p>
          </div>
        ) : (
          openPanels.map((id) => (
            <div key={id} className={`flex flex-col overflow-hidden ${id === 'chat' ? 'flex-[1]' : 'flex-[2]'}`}>
              {renderPanel(id, user)}
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default WorkspacePage;
