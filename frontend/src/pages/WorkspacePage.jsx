import React, { useState } from 'react';
import Sidebar from '../components/workspace/Sidebar.jsx';
import KanbanBoard from '../components/workspace/KanbanBoard.jsx';

// ── 뷰 컴포넌트 자리표시자 (추후 components/workspace/ 로 분리 예정) ───────────
const InboxView = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold text-white">수신함</h2>
  </div>
);

const ChatView = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold text-white">채팅</h2>
  </div>
);

const KanbanView = () => <KanbanBoard />;

const SummaryView = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold text-white">요약 공간</h2>
  </div>
);

const MembersView = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold text-white">멤버 초대</h2>
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

// ── WorkspacePage ────────────────────────────────────────────────────────────
const WorkspacePage = ({ user, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('inbox');

  const renderContent = () => {
    switch (activeMenu) {
      case 'inbox':               return <InboxView />;
      case 'chat':                return <ChatView />;
      case 'kanban':              return <KanbanView />;
      case 'summary':             return <SummaryView />;
      case 'members':             return <MembersView />;
      case 'profile':             return <ProfileView />;
      case 'workspace-settings':  return <WorkspaceSettingsView />;
      default:                    return <InboxView />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-white">
      <Sidebar
        active={activeMenu}
        onSelect={setActiveMenu}
        nickname={user?.nickname}
        onLogout={onLogout}
      />
      <main className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default WorkspacePage;
