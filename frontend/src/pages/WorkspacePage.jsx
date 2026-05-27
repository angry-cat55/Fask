import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/workspace/Sidebar.jsx';
import KanbanBoard from '../components/workspace/KanbanBoard.jsx';
import ChatView from '../components/workspace/ChatView.jsx';
import InboxView from '../components/workspace/InboxView.jsx';
import SummaryView from '../components/workspace/SummaryView.jsx';

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

const renderPanel = (id, user, chatProps, summaries) => {
  switch (id) {
    case 'inbox':
      return <InboxView />;
    case 'chat':
      return <ChatView {...chatProps} />;
    case 'kanban':
      return <KanbanBoard userId={user?.userId} workspaceId={user?.workspaceId} />;
    case 'summary':
      return <SummaryView summaries={summaries} />;
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
  const [openPanels, setOpenPanels] = useState([]);
  const [chatUnread, setChatUnread] = useState(0);
  const [latestSocketMessage, setLatestSocketMessage] = useState(null);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState(null);
  const [summaries, setSummaries] = useState([]);

  const socketMessageHandler = useRef(null);

  // 항상 최신 openPanels를 참조하는 핸들러
  useEffect(() => {
    socketMessageHandler.current = (msg) => {
      if (openPanels.includes('chat')) {
        setLatestSocketMessage(msg);
      } else {
        setChatUnread((prev) => prev + 1);
        setFirstUnreadMessageId((prev) => prev ?? msg.messageId);
      }
    };
  }, [openPanels]);

  // 소켓 연결 (workspaceId가 있을 때만)
  useEffect(() => {
    const workspaceId = user?.workspaceId;
    const userId = user?.userId;
    if (!workspaceId || !userId) return;

    const ws = new WebSocket(
      `ws://${location.host}/ws/workspaces/${workspaceId}?userId=${userId}`
    );
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        socketMessageHandler.current?.(msg);
      } catch {
        console.error('소켓 메시지 파싱 오류');
      }
    };
    ws.onerror = () => console.error('WebSocket 연결 오류');

    return () => ws.close();
  }, [user?.workspaceId, user?.userId]);

  const handleSelect = (id) => {
    if (id === 'chat') {
      const isClosing = openPanels.includes('chat');
      if (isClosing) {
        setFirstUnreadMessageId(null);
      } else {
        setChatUnread(0);
      }
    }
    setOpenPanels((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [id, ...prev],
    );
  };

  // TODO: 테스트용 - 확인 후 제거
  const simulateSocketMessage = () => {
    const msg = {
      messageId: Date.now(),
      nickname: '팀원A',
      sendAt: new Date().toISOString(),
      content: '소켓 테스트 메시지입니다!',
    };
    socketMessageHandler.current?.(msg);
  };

  const handleSummaryCreated = (summary) => {
    setSummaries((prev) => [...prev, summary]);
  };

  const chatProps = {
    userId: user?.userId,
    workspaceId: user?.workspaceId,
    nickname: user?.nickname,
    latestSocketMessage,
    firstUnreadMessageId,
    onSummaryCreated: handleSummaryCreated,
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-white">
      <Sidebar
        openPanels={openPanels}
        onSelect={handleSelect}
        nickname={user?.nickname}
        onLogout={onLogout}
        chatUnread={chatUnread}
      />

      <main className="flex flex-1 overflow-hidden divide-x divide-white/5">
        {openPanels.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <p className="text-sm text-slate-600">사이드바에서 메뉴를 선택하세요.</p>
            {/* TODO: 테스트용 버튼 - 확인 후 제거 */}
            <button
              onClick={simulateSocketMessage}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
            >
              소켓 메시지 시뮬레이션
            </button>
          </div>
        ) : (
          openPanels.map((id) => (
            <div
              key={id}
              className={`flex flex-col overflow-hidden ${id === 'chat' ? 'flex-1' : 'flex-2'}`}
            >
              {renderPanel(id, user, chatProps, summaries)}
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default WorkspacePage;
