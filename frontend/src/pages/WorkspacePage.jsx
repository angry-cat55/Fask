import React, { useState, useRef, useEffect } from 'react';
import TextInput from '../components/ui/TextInput';

// ── SVG Icons ──────────────────────────────────────────────────────────────
const Ico = ({ children, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const InboxIcon = () => (
  <Ico>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
  </Ico>
);
const ChatIcon = () => (
  <Ico>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </Ico>
);
const KanbanIcon = () => (
  <Ico>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M15 3v18" />
  </Ico>
);
const SummaryIcon = () => (
  <Ico>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </Ico>
);
const MembersIcon = () => (
  <Ico>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </Ico>
);
const ProfileIcon = () => (
  <Ico>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Ico>
);
const SettingsIcon = () => (
  <Ico>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </Ico>
);
const LogoutIcon = () => (
  <Ico>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Ico>
);

// ── Nav 구조 ────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: null,
    items: [
      { id: 'inbox', label: '수신함', icon: <InboxIcon /> },
      { id: 'chat', label: '채팅', icon: <ChatIcon /> },
    ],
  },
  {
    label: '워크스페이스',
    items: [
      { id: 'kanban', label: '칸반 보드', icon: <KanbanIcon /> },
      { id: 'summary', label: '요약 공간', icon: <SummaryIcon /> },
    ],
  },
  {
    label: '팀',
    items: [{ id: 'members', label: '멤버 초대', icon: <MembersIcon /> }],
  },
  {
    label: '설정',
    items: [
      { id: 'profile', label: '프로필', icon: <ProfileIcon /> },
      {
        id: 'workspace-settings',
        label: '워크스페이스 설정',
        icon: <SettingsIcon />,
      },
    ],
  },
];

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

const KanbanView = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold text-white">칸반 보드</h2>
  </div>
);

const SummaryView = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold text-white">요약 공간</h2>
  </div>
);

const MembersView = () => null;

const ProfileView = () => (
  <div className="p-8">
    <h2 className="text-2xl font-bold text-white">프로필</h2>
  </div>
);

const Sidebar = ({ active, onSelect, nickname, onLogout }) => {
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const membersButtonRef = useRef(null);
  const membersPanelRef = useRef(null);
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteTouched, setInviteTouched] = useState(false);
  const validateInviteId = (value) => {
    const regex = /^[a-zA-Z0-9_-]{4,20}$/;
    return regex.test(value);
  };

  const handleSelect = (itemId) => {
    if (itemId === 'members') {
      setIsMembersOpen((prev) => {
        const next = !prev;
        if (next) {
          onSelect('members');
          setInviteTouched(false);
        }
        if (!next) {
          setInviteUserId('');
          setInviteTouched(false);
        }
        return next;
      });
      return;
    }

    setIsMembersOpen(false);
    setInviteUserId('');
    onSelect(itemId);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!isMembersOpen) return;
      const panel = membersPanelRef.current;
      const btn = membersButtonRef.current;
      const clickedInsidePanel = panel && panel.contains(e.target);
      const clickedOnButton = btn && btn.contains(e.target);

      if (!clickedInsidePanel && !clickedOnButton) {
        setIsMembersOpen(false);
        setInviteUserId('');
        setInviteTouched(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMembersOpen]);

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-white/5 bg-slate-900/60">
      <div className="flex items-center gap-3 border-b border-white/5 px-4 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400/15 text-sm font-black text-cyan-300">
          F
        </div>
        <div>
          <p className="text-sm font-bold text-white">Fask</p>
          <p className="text-[10px] text-slate-600">워크스페이스</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
            {group.label && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                {group.label}
              </p>
            )}

            {group.items.map((item) => {
              const isActive = active === item.id;

              return (
                <React.Fragment key={item.id}>
                  <button
                    ref={item.id === 'members' ? membersButtonRef : null}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                      item.id === 'members' && isMembersOpen
                        ? 'bg-white/10 font-medium text-white'
                        : isActive
                          ? 'bg-white/10 font-medium text-white'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <span
                      className={
                        item.id === 'members' && isMembersOpen
                          ? 'text-cyan-400'
                          : isActive
                            ? 'text-cyan-400'
                            : 'text-slate-600'
                      }
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </button>

                  {item.id === 'members' && isMembersOpen && (
                    <div
                      ref={membersPanelRef}
                      className="mt-2 ml-1 rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-lg shadow-black/10"
                    >
                      <div className="space-y-3 text-xs text-slate-400">
                        <div className="text-sm font-semibold text-white">
                          멤버 초대
                        </div>
                        <div className="w-full max-w-47.5">
                          <div className="rounded-md border border-cyan-500/20 focus-within:ring-2 focus-within:ring-cyan-400/30 p-0.5">
                            <TextInput
                              value={inviteUserId}
                              onChange={(event) => {
                                const v = event.target.value;
                                setInviteUserId(v);
                                if (v.trim().length > 0) setInviteTouched(false);
                              }}
                              onBlur={(e) => {
                                if (!e.target.value || e.target.value.trim().length === 0) {
                                  setInviteTouched(true);
                                }
                              }}
                              placeholder="사용자 ID 입력"
                              autoComplete="off"
                              required={false}
                              className="px-3 py-3 text-sm"
                            />
                          </div>
                        </div>
                        {inviteTouched && inviteUserId.trim().length === 0 && (
                          <div className="text-center text-xs text-rose-400">
                            사용자 ID를 입력해주세요.
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            disabled={
                              inviteUserId.trim().length === 0 ||
                              !validateInviteId(inviteUserId)
                            }
                            className={`rounded-md px-3 py-1.5 text-xs font-medium text-white transition ${
                              inviteUserId.trim().length === 0 ||
                              !validateInviteId(inviteUserId)
                                ? 'bg-cyan-500/40 cursor-not-allowed'
                                : 'bg-cyan-500 hover:bg-cyan-600'
                            }`}
                          >
                            초대
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsMembersOpen(false);
                              setInviteUserId('');
                            }}
                            className="rounded-md bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-600"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/5 p-3">
        <div className="flex items-center justify-between rounded-lg px-2 py-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-bold text-cyan-300">
              {nickname ? nickname[0].toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-medium text-slate-400">
              {nickname || '사용자'}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="text-slate-600 transition hover:text-slate-300"
            title="로그아웃"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
};

// ── WorkspacePage ────────────────────────────────────────────────────────────
const WorkspacePage = ({ user, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('inbox');

  const renderContent = () => {
    switch (activeMenu) {
      case 'inbox':
        return <InboxView />;
      case 'chat':
        return <ChatView />;
      case 'kanban':
        return <KanbanView />;
      case 'summary':
        return <SummaryView />;
      case 'profile':
        return <ProfileView nickname={user?.nickname} />;
      case 'workspace-settings':
        return <WorkspaceSettingsView />;
      default:
        return <InboxView />;
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
