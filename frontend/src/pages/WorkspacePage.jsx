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
    case 'chat':
      return <ChatView {...chatProps} />;
    case 'kanban':
      return <KanbanBoard userId={user?.userId} workspaceId={user?.workspaceId} />;
    case 'summary':
      return <SummaryView summaries={summaries} />;
    default:
      return null;
  }
};

// ── WorkspacePage ────────────────────────────────────────────────────────────
const WorkspacePage = ({ user, onLogout }) => {
  const [openPanels, setOpenPanels] = useState([]);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [exclusiveView, setExclusiveView] = useState(null);

  const [chatUnread, setChatUnread] = useState(0);
  const [latestSocketMessage, setLatestSocketMessage] = useState(null);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState(null);
  const [summaries, setSummaries] = useState([]);

  const socketMessageHandler = useRef(null);

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

  useEffect(() => {
    const workspaceId = user?.workspaceId;
    const userId = user?.userId;
    if (!workspaceId || !userId) return;

    const ws = new WebSocket(
      `ws://${location.host}/ws/workspaces/${workspaceId}?userId=${userId}`,
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
    if (id === 'inbox') {
      setIsInboxOpen((prev) => !prev);
      return;
    }

    if (id === 'profile' || id === 'workspace-settings') {
      setIsInboxOpen(false);
      setOpenPanels([]);
      setExclusiveView((prev) => (prev === id ? null : id));
      return;
    }

    setExclusiveView(null);

    if (id === 'chat') {
      const isClosing = openPanels.includes('chat');
      if (isClosing) {
        setFirstUnreadMessageId(null);
      } else {
        setChatUnread(0);
      }
    }

    setOpenPanels((prev) => {
      const isExist = prev.includes(id);
      
      if (isExist) {
        return prev.filter((p) => p !== id);
      } else {
        let filtered = [...prev];
        
        if (id === 'kanban') {
          filtered = filtered.filter((p) => p !== 'summary');
        }
        if (id === 'summary') {
          filtered = filtered.filter((p) => p !== 'kanban');
        }

        return [id, ...filtered];
      }
    });
  };

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

  const activeIds = [...openPanels];
  if (isInboxOpen) activeIds.push('inbox');
  if (exclusiveView) activeIds.push(exclusiveView);

  const sortedPanels = [...openPanels].sort((a, b) => {
    if (a === 'chat') return -1;
    if (b === 'chat') return 1;
    return 0;
  });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-white">
      <Sidebar
        openPanels={activeIds}
        onSelect={handleSelect}
        nickname={user?.nickname}
        onLogout={onLogout}
        userId={user?.userId}
        workspaceId={user?.workspaceId}
        chatUnread={chatUnread}
      />

      {/* 💡 relative 속성을 주어 하위의 수신함 패널이 이 메인 영역 기준으로 배치되도록 설정 */}
      <main className="flex flex-1 overflow-hidden divide-x divide-white/5 relative">
        
        {/* 메인 작업 화면 렌더링 영역 */}
        {exclusiveView ? (
          <div className="flex-1 overflow-hidden bg-slate-950">
            {exclusiveView === 'profile' && <ProfileView />}
            {exclusiveView === 'workspace-settings' && <WorkspaceSettingsView />}
          </div>
        ) : openPanels.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <p className="text-sm text-slate-600">
              사이드바에서 메뉴를 선택하세요.
            </p>
            <button
              onClick={simulateSocketMessage}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
            >
              소켓 메시지 시뮬레이션
            </button>
          </div>
        ) : (
          /* 기존 컴포넌트들: 수신함이 켜져도 사이즈 변동 없이 그대로 유지됨 */
          sortedPanels.map((id) => (
            <div
              key={id}
              className={`flex flex-col overflow-hidden ${id === 'chat' ? 'flex-1' : 'flex-2'}`}
            >
              {renderPanel(id, user, chatProps, summaries)}
            </div>
          ))
        )}

        {/* ── 💡 규칙 1: 사이드바에서 튀어나오는 수신함 패널 (Drawer Style) ── */}
        {/* 기존 영역을 침범하지 않고, 왼쪽 끝(사이드바 바로 우측)에서 원래 화면 위로 레이어처럼 올라옵니다. */}
        {isInboxOpen && (
          <div className="absolute top-0 bottom-0 left-0 w-80.1 z-40 flex flex-col border-r border-white/10 bg-slate-900 shadow-[10px_0_30px_rgba(0,0,0,0.6)] animate-slide-right overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-950/40">
              <span className="text-sm font-semibold text-slate-300">수신함</span>
              <button 
                onClick={() => setIsInboxOpen(false)}
                className="text-xs text-slate-500 hover:text-white transition"
              >
                닫기 ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <InboxView />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkspacePage;