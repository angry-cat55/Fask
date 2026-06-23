import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Sidebar from '../components/workspace/Sidebar.jsx';
import KanbanBoard from '../components/workspace/KanbanBoard.jsx';
import ChatView from '../components/workspace/ChatView.jsx';
import InboxView from '../components/workspace/InboxView.jsx';
import SummaryView from '../components/workspace/SummaryView.jsx';
import ProfileView from '../components/workspace/ProfileView.jsx';
import WorkspaceSettingsView from '../components/workspace/WorkspaceSettingsView.jsx';

const renderPanel = (id, user, chatProps, summary) => {
  switch (id) {
    case 'chat':
      return <ChatView {...chatProps} />;
    case 'kanban':
      return (
        <KanbanBoard userId={user?.userId} workspaceId={user?.workspaceId} />
      );
    case 'summary':
      return <SummaryView summary={summary} />;
    default:
      return null;
  }
};

// ── WorkspacePage ────────────────────────────────────────────────────────────
const WorkspacePage = ({
  user,
  onLogout,
  onUserUpdate,
  onLeaveWorkspace,
  onSwitchWorkspace,
}) => {
  const [openPanels, setOpenPanels] = useState([]);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [exclusiveView, setExclusiveView] = useState(null);

  const [chatUnread, setChatUnread] = useState(0);
  const [latestSocketMessage, setLatestSocketMessage] = useState(null);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [workspaceRefreshToken, setWorkspaceRefreshToken] = useState(0);

  useEffect(() => {
    const workspaceId = user?.workspaceId;
    const userId = user?.userId;
    if (!workspaceId || !userId) return;
    fetch(`/api/workspaces/${workspaceId}/messages/summary?userId=${userId}`)
      .then((r) => r.json())
      .then((result) => {
        if (result.success) setSummary(result.data ?? null);
      })
      .catch(() => {});
  }, [user?.workspaceId, user?.userId]);

  const socketMessageHandler = useRef(null);
  const socketRef = useRef(null);

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

    const socket = io(
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000',
      {
        transports: ['websocket'],
        auth: { userId },
      },
    );

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_workspace', { workspaceId });
    });

    socket.on('new_message', (msg) => {
      socketMessageHandler.current?.(msg);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO 연결 오류:', error);
    });

    return () => {
      socket.emit('leave_workspace', { workspaceId });
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
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

  const handleSummaryCreated = (newSummary) => {
    setSummary(newSummary);
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
        workspaceName={user?.workspaceName}
        chatUnread={chatUnread}
        onSwitchWorkspace={onSwitchWorkspace}
        workspaceRefreshToken={workspaceRefreshToken}
      />

      {/* 💡 relative 속성을 주어 하위의 수신함 패널이 이 메인 영역 기준으로 배치되도록 설정 */}
      <main className="flex flex-1 overflow-hidden divide-x divide-white/5 relative">
        {/* 메인 작업 화면 렌더링 영역 */}
        {exclusiveView ? (
          <div className="flex-1 overflow-hidden bg-slate-950">
            {exclusiveView === 'profile' && (
              <ProfileView
                user={user}
                onLogout={onLogout}
                onUserUpdate={onUserUpdate}
              />
            )}
            {exclusiveView === 'workspace-settings' && (
              <WorkspaceSettingsView
                user={user}
                onLeaveWorkspace={onLeaveWorkspace}
                onUserUpdate={onUserUpdate}
                onWorkspaceSaved={() =>
                  setWorkspaceRefreshToken((prev) => prev + 1)
                }
              />
            )}
          </div>
        ) : openPanels.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="text-sm text-slate-600">
              사이드바에서 메뉴를 선택하세요.
            </p>
          </div>
        ) : (
          /* 기존 컴포넌트들: 수신함이 켜져도 사이즈 변동 없이 그대로 유지됨 */
          sortedPanels.map((id) => (
            <div
              key={id}
              className={`flex flex-col overflow-hidden ${id === 'chat' ? 'flex-1' : 'flex-2'}`}
            >
              {renderPanel(id, user, chatProps, summary)}
            </div>
          ))
        )}

        {/* ── 💡 규칙 1: 사이드바에서 튀어나오는 수신함 패널 (Drawer Style) ── */}
        {/* 기존 영역을 침범하지 않고, 왼쪽 끝(사이드바 바로 우측)에서 원래 화면 위로 레이어처럼 올라옵니다. */}
        {isInboxOpen && (
          <div className="absolute top-0 bottom-0 left-0 w-80.1 z-40 flex flex-col border-r border-white/10 bg-slate-900 shadow-[10px_0_30px_rgba(0,0,0,0.6)] animate-slide-right overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-950/40">
              <span className="text-sm font-semibold text-slate-300">
                수신함
              </span>
              <button
                onClick={() => setIsInboxOpen(false)}
                className="text-xs text-slate-500 hover:text-white transition"
              >
                닫기 ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <InboxView
                user={user}
                onAccepted={() => setWorkspaceRefreshToken((prev) => prev + 1)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkspacePage;
