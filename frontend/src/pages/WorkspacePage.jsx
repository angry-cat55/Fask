import React, { useCallback, useEffect, useState } from 'react';
import Sidebar from '../components/workspace/Sidebar.jsx';
import KanbanBoard from '../components/workspace/KanbanBoard.jsx';
import ChatView from '../components/workspace/ChatView.jsx';

// ── 뷰 컴포넌트 ─────────────────────────────────────────────────────────────
const fetchInboxMock = () =>
  Promise.resolve({
    success: true,
    data: [
      {
        workspaceId: 1,
        workspaceName: '팀-알파',
        ownerNickname: '태호',
        invitedAt: '2026-05-19T08:26:14.000Z',
        message: '워크스페이스에 초대합니다',
      },
      {
        workspaceId: 2,
        workspaceName: '프로젝트-베타',
        ownerNickname: '수진',
        invitedAt: '2026-05-18T08:26:14.000Z',
        message: '함께 해요!',
      },
    ],
  });

const MessageItem = ({ item, onAccept, onReject }) => (
  <div className="border-b border-white/5 px-4 py-3 last:border-b-0">
    <div className="text-sm font-semibold text-white">{item.workspaceName}</div>
    <div className="mt-1 text-xs text-slate-400">
      초대한 사람: {item.ownerNickname}
    </div>
    <div className="mt-1 text-xs text-slate-500">
      {new Date(item.invitedAt).toLocaleString()}
    </div>
    <div className="mt-2 text-sm text-slate-300">{item.message}</div>

    <div className="mt-3 flex items-center gap-2">
      <button
        type="button"
        onClick={() => onAccept?.(item)}
        className="rounded bg-emerald-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-emerald-400"
      >
        수락
      </button>
      <button
        type="button"
        onClick={() => onReject?.(item)}
        className="rounded border border-white/10 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/5"
      >
        거절
      </button>
    </div>
  </div>
);

const MessageList = ({ items, onAccept, onReject }) => {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-500">수신된 초대가 없습니다.</div>
    );
  }

  return (
    <div className="divide-y divide-white/5 overflow-auto">
      {items.map((item) => (
        <MessageItem
          key={item.workspaceId}
          item={item}
          onAccept={onAccept}
          onReject={onReject}
        />
      ))}
    </div>
  );
};

const InboxView = ({ user }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const removeItem = useCallback((workspaceId) => {
    setItems((prev) => prev.filter((item) => item.workspaceId !== workspaceId));
  }, []);

  const loadInbox = useCallback(() => {
    setLoading(true);
    setError(null);

    fetch(
      `/api/workspaces/inbox?userId=${encodeURIComponent(user?.userId ?? '')}`,
    )
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error('fetch failed')),
      )
      .then((json) => {
        setItems(json?.data ?? []);
        setLoading(false);
      })
      .catch(() => {
        fetchInboxMock()
          .then((response) => {
            setItems(response.data ?? []);
            setLoading(false);
          })
          .catch((mockError) => {
            setError(mockError);
            setLoading(false);
          });
      });
  }, [user?.userId]);

  useEffect(() => {
    const initialLoad = setTimeout(() => loadInbox(), 0);

    return () => clearTimeout(initialLoad);
  }, [loadInbox]);

  return (
    <div className="flex h-full min-h-0">
      <aside className="w-80 shrink-0 border-r border-white/5 bg-slate-950/90">
        <div className="border-b border-white/5 p-4">
          <h2 className="text-lg font-bold text-white">수신함</h2>
          <p className="mt-1 text-xs text-slate-500">초대 목록</p>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-slate-500">불러오는 중...</div>
        ) : error ? (
          <div className="p-4 text-sm text-red-400">
            수신함을 불러오지 못했습니다.
          </div>
        ) : (
          <MessageList
            items={items}
            onAccept={(item) => removeItem(item.workspaceId)}
            onReject={(item) => removeItem(item.workspaceId)}
          />
        )}
      </aside>
    </div>
  );
};

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
