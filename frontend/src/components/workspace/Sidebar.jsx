import React from 'react';

const Ico = ({ children }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const InboxIcon = () => <Ico><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" /></Ico>;
const ChatIcon = () => <Ico><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></Ico>;
const KanbanIcon = () => <Ico><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18" /></Ico>;
const SummaryIcon = () => <Ico><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></Ico>;
const MembersIcon = () => <Ico><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></Ico>;
const ProfileIcon = () => <Ico><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></Ico>;
const SettingsIcon = () => <Ico><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></Ico>;
const LogoutIcon = () => <Ico><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Ico>;

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { id: 'inbox',  label: '수신함', icon: <InboxIcon /> },
      { id: 'chat',   label: '채팅',   icon: <ChatIcon /> },
    ],
  },
  {
    label: '워크스페이스',
    items: [
      { id: 'kanban',  label: '칸반 보드', icon: <KanbanIcon /> },
      { id: 'summary', label: '요약 공간', icon: <SummaryIcon /> },
    ],
  },
  {
    label: '팀',
    items: [
      { id: 'members', label: '멤버 초대', icon: <MembersIcon /> },
    ],
  },
  {
    label: '설정',
    items: [
      { id: 'profile',             label: '프로필',            icon: <ProfileIcon /> },
      { id: 'workspace-settings',  label: '워크스페이스 설정', icon: <SettingsIcon /> },
    ],
  },
];

const Sidebar = ({ active, onSelect, nickname, onLogout }) => (
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
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-white/10 font-medium text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-slate-600'}>
                  {item.icon}
                </span>
                {item.label}
              </button>
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
          <span className="text-xs font-medium text-slate-400">{nickname || '사용자'}</span>
        </div>
        <button onClick={onLogout} className="text-slate-600 transition hover:text-slate-300" title="로그아웃">
          <LogoutIcon />
        </button>
      </div>
    </div>
  </aside>
);

export default Sidebar;
