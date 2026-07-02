import React, { useState, useRef, useEffect } from 'react';
import TextInput from '../ui/TextInput';

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
const RefreshIcon = () => (
  <Ico size={13}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0114.36-3.36L23 10M1 14l5.13 4.36A9 9 0 0020.49 15" />
  </Ico>
);
const MemberListIcon = () => (
  <Ico>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="3" cy="6" r="1" />
    <circle cx="3" cy="12" r="1" />
    <circle cx="3" cy="18" r="1" />
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
const ChevronDownIcon = () => (
  <Ico size={13}>
    <polyline points="6 9 12 15 18 9" />
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
    items: [
      { id: 'members', label: '멤버 초대', icon: <MembersIcon /> },
      { id: 'member-list', label: '멤버 목록', icon: <MemberListIcon /> },
    ],
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

// ── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({
  openPanels = [],
  onSelect,
  nickname,
  onLogout,
  userId,
  workspaceId,
  workspaceName,
  chatUnread = 0,
  onSwitchWorkspace,
  workspaceRefreshToken = 0,
}) => {
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const membersButtonRef = useRef(null);
  const membersPanelRef = useRef(null);
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteTouched, setInviteTouched] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const memberListButtonRef = useRef(null);
  const memberListPanelRef = useRef(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState('');
  // actionTarget: { member, type: 'transfer' | 'kick' } | null
  const [actionTarget, setActionTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedMemberId, setExpandedMemberId] = useState(null);

  const [isWorkspaceSwitcherOpen, setIsWorkspaceSwitcherOpen] = useState(false);
  const [workspaceList, setWorkspaceList] = useState([]);
  const workspaceSwitcherRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/workspaces?userId=${userId}`)
      .then((r) => r.json())
      .then((result) => {
        setWorkspaceList(result.data?.workspaces ?? []);
      })
      .catch(() => {});
    // nickname이 바뀌면 masterNickname과의 비교가 최신 닉네임을 기준으로
    // 다시 이뤄지도록 워크스페이스 목록(서버의 최신 masterNickname 포함)을 재조회
  }, [userId, workspaceRefreshToken, nickname]);

  useEffect(() => {
    if (workspaceRefreshToken > 0 && isMemberListOpen) {
      fetchMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceRefreshToken]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isWorkspaceSwitcherOpen &&
        workspaceSwitcherRef.current &&
        !workspaceSwitcherRef.current.contains(e.target)
      ) {
        setIsWorkspaceSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isWorkspaceSwitcherOpen]);

  const currentWorkspaceName =
    workspaceName ??
    workspaceList.find((w) => String(w.workspaceId) === String(workspaceId))
      ?.name ??
    '워크스페이스';

  const isLeader =
    members.find((m) => String(m.userId) === String(userId))?.role === 'LEADER';

  const validateInviteId = (value) => /^[a-zA-Z0-9_-]{4,20}$/.test(value);

  const fetchMembers = async () => {
    setMembersLoading(true);
    setMembersError('');
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/members?userId=${userId}`,
      );
      const result = await res.json();
      if (result.success) {
        setMembers(result.data.members);
      } else {
        setMembersError(result.message || '멤버 목록을 불러오지 못했습니다.');
      }
    } catch {
      setMembersError('서버 통신 오류가 발생했습니다.');
    } finally {
      setMembersLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (actionTarget?.type !== 'transfer') return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/owner`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          newOwnerId: actionTarget.member.userId,
        }),
      });
      const result = await res.json();
      if (result.success) {
        alert(result.message || '방장 권한이 위임되었습니다.');
        setActionTarget(null);
        fetchMembers();
      } else {
        alert(result.message || '방장 권한 위임에 실패했습니다.');
      }
    } catch {
      alert('서버 통신 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleKick = async () => {
    if (actionTarget?.type !== 'kick') return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/members/${actionTarget.member.userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        },
      );
      const result = await res.json();
      if (result.success) {
        alert(result.message || '멤버를 강퇴했습니다.');
        setActionTarget(null);
        fetchMembers();
      } else {
        alert(result.message || '강퇴에 실패했습니다.');
      }
    } catch {
      alert('서버 통신 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const inviteMember = async ({
    workspaceId: targetWorkspaceId,
    userId: targetUserId,
    invitedLoginId,
  }) => {
    const response = await fetch(
      `/api/workspaces/${targetWorkspaceId}/invitations`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          invitedLoginId,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || '멤버 초대에 실패했습니다.');
    }

    return result;
  };

  const handleSelect = (itemId) => {
    if (itemId === 'members') {
      setIsMemberListOpen(false);
      setActionTarget(null);
      setIsMembersOpen((prev) => {
        const next = !prev;
        if (next) setInviteTouched(false);
        if (!next) {
          setInviteUserId('');
          setInviteTouched(false);
        }
        return next;
      });
      return;
    }
    if (itemId === 'member-list') {
      setIsMembersOpen(false);
      setInviteUserId('');
      if (!isMemberListOpen) {
        fetchMembers();
      } else {
        setActionTarget(null);
      }
      setIsMemberListOpen((prev) => !prev);
      return;
    }
    setIsMembersOpen(false);
    setIsMemberListOpen(false);
    setInviteUserId('');
    setActionTarget(null);
    onSelect(itemId);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMembersOpen) {
        const panel = membersPanelRef.current;
        const btn = membersButtonRef.current;
        if (
          !(panel && panel.contains(e.target)) &&
          !(btn && btn.contains(e.target))
        ) {
          setIsMembersOpen(false);
          setInviteUserId('');
          setInviteTouched(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMembersOpen]);

  return (
    <aside className="relative flex h-full w-56 shrink-0 flex-col border-r border-white/5 bg-slate-900/60">
      <div
        ref={workspaceSwitcherRef}
        className="relative border-b border-white/5"
      >
        <button
          type="button"
          onClick={() => setIsWorkspaceSwitcherOpen((prev) => !prev)}
          className="flex w-full items-center gap-3 px-4 py-4 hover:bg-white/5 transition"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/15 text-sm font-black text-cyan-300">
            F
          </div>
          <div className="flex flex-1 flex-col items-start min-w-0">
            <p className="text-sm font-bold text-white truncate w-full text-left">
              {currentWorkspaceName}
            </p>
            <p className="text-[10px] text-slate-600">워크스페이스</p>
          </div>
          <span
            className={`shrink-0 text-slate-500 transition-transform ${isWorkspaceSwitcherOpen ? 'rotate-180' : ''}`}
          >
            <ChevronDownIcon />
          </span>
        </button>

        {isWorkspaceSwitcherOpen && (
          <div className="absolute top-full left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-sm border border-white/10 rounded-b-2xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] overflow-hidden">
            <p className="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              내 워크스페이스
            </p>

            <div className="flex flex-col gap-0.5 px-2 pb-2">
              {workspaceList.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-600">
                  워크스페이스 없음
                </p>
              ) : (
                workspaceList.map((ws) => {
                  const isCurrent =
                    String(ws.workspaceId) === String(workspaceId);
                  return (
                    <button
                      key={ws.workspaceId}
                      type="button"
                      onClick={() => {
                        if (!isCurrent) onSwitchWorkspace?.(ws.workspaceId, ws.name);
                        setIsWorkspaceSwitcherOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition
                        ${
                          isCurrent
                            ? 'bg-cyan-500/10 text-white cursor-default'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold
                        ${isCurrent ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}
                      >
                        {ws.name?.[0]?.toUpperCase() ?? 'W'}
                      </div>
                      <span className="flex-1 truncate text-left text-xs font-medium">
                        {ws.name}
                        {nickname && ws.masterNickname === nickname && (
                          <span className="ml-1.5 text-[10px] font-normal text-cyan-400">
                            (방장)
                          </span>
                        )}
                      </span>
                      {isCurrent && (
                        <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <nav className="sidebar-scroll flex flex-1 flex-col overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
            {group.label && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const highlighted =
                (item.id === 'members' && isMembersOpen) ||
                (item.id === 'member-list' && isMemberListOpen) ||
                openPanels.includes(item.id);
              return (
                <React.Fragment key={item.id}>
                  <button
                    ref={
                      item.id === 'members'
                        ? membersButtonRef
                        : item.id === 'member-list'
                          ? memberListButtonRef
                          : null
                    }
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                      highlighted
                        ? 'bg-white/10 font-medium text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <span
                      className={
                        highlighted ? 'text-cyan-400' : 'text-slate-600'
                      }
                    >
                      {item.icon}
                    </span>
                    {item.label}
                    {item.id === 'chat' && chatUnread > 0 && (
                      <span className="ml-auto rounded-full bg-cyan-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                        {chatUnread > 99 ? '99+' : chatUnread}
                      </span>
                    )}
                  </button>

                  {item.id === 'member-list' && isMemberListOpen && (
                    <div
                      ref={memberListPanelRef}
                      className="mt-2 ml-1 rounded-2xl border border-white/10 bg-slate-950/60 p-3 shadow-lg shadow-black/10"
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-sm font-semibold text-white">
                          멤버 목록
                        </span>
                        <button
                          onClick={fetchMembers}
                          disabled={membersLoading}
                          title="새로고침"
                          className={`text-slate-500 hover:text-slate-300 transition disabled:opacity-40 ${membersLoading ? 'animate-spin' : ''}`}
                        >
                          <RefreshIcon />
                        </button>
                      </div>

                      {membersLoading ? (
                        <p className="py-3 text-center text-xs text-slate-600">
                          불러오는 중...
                        </p>
                      ) : membersError ? (
                        <p className="py-2 text-center text-xs text-red-400">
                          {membersError}
                        </p>
                      ) : (
                        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
                          {members.map((member) => {
                            const isSelf =
                              String(member.userId) === String(userId);
                            const isExpanded =
                              expandedMemberId === member.userId;
                            const isActive =
                              actionTarget?.member?.userId === member.userId;
                            const isTransferConfirm =
                              isActive && actionTarget.type === 'transfer';
                            const isKickConfirm =
                              isActive && actionTarget.type === 'kick';
                            const clickable =
                              isLeader && !isSelf && member.role !== 'LEADER';

                            return (
                              <div
                                key={member.userId}
                                onClick={() => {
                                  if (!clickable || isActive) return;
                                  setExpandedMemberId((prev) =>
                                    prev === member.userId
                                      ? null
                                      : member.userId,
                                  );
                                }}
                                className={`rounded-lg bg-slate-800/40 px-2.5 py-2 ${clickable && !isActive ? 'cursor-pointer hover:bg-slate-700/50 transition' : ''}`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-slate-300">
                                    {member.nickname[0].toUpperCase()}
                                  </div>
                                  <div className="flex flex-1 flex-col min-w-0">
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs font-medium text-white truncate">
                                        {member.nickname}
                                      </span>
                                      {isSelf && (
                                        <span className="text-[9px] text-slate-600">
                                          (나)
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-500 truncate">
                                      @{member.loginId}
                                    </span>
                                  </div>
                                  <span
                                    className={`shrink-0 text-[10px] font-semibold ${member.role === 'LEADER' ? 'text-cyan-400' : 'text-slate-600'}`}
                                  >
                                    {member.role === 'LEADER' ? '방장' : '멤버'}
                                  </span>
                                </div>

                                {isExpanded && !isActive && (
                                  <div className="mt-2 flex gap-1.5 border-t border-white/5 pt-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedMemberId(null);
                                        setActionTarget({
                                          member,
                                          type: 'transfer',
                                        });
                                      }}
                                      className="flex-1 rounded border border-white/10 py-1 text-[10px] text-slate-300 hover:bg-white/5 transition"
                                    >
                                      방장 위임
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedMemberId(null);
                                        setActionTarget({
                                          member,
                                          type: 'kick',
                                        });
                                      }}
                                      className="flex-1 rounded border border-red-500/20 py-1 text-[10px] text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition"
                                    >
                                      강제 퇴장
                                    </button>
                                  </div>
                                )}

                                {isTransferConfirm && (
                                  <div className="mt-2 border-t border-white/5 pt-2">
                                    <p className="mb-1.5 text-[10px] text-amber-300">
                                      <span className="font-semibold">
                                        {member.nickname}
                                      </span>
                                      님에게 방장을 위임할까요?
                                    </p>
                                    <div className="flex gap-1.5">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTransfer();
                                        }}
                                        disabled={actionLoading}
                                        className="flex-1 rounded bg-amber-500 py-1 text-[10px] font-medium text-white hover:bg-amber-400 disabled:opacity-50 transition"
                                      >
                                        {actionLoading ? '처리중...' : '위임'}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActionTarget(null);
                                        }}
                                        disabled={actionLoading}
                                        className="flex-1 rounded border border-white/10 py-1 text-[10px] text-slate-400 hover:text-white transition"
                                      >
                                        취소
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {isKickConfirm && (
                                  <div className="mt-2 border-t border-white/5 pt-2">
                                    <p className="mb-1.5 text-[10px] text-red-300">
                                      <span className="font-semibold">
                                        {member.nickname}
                                      </span>
                                      님을 강제 퇴장시킬까요?
                                    </p>
                                    <div className="flex gap-1.5">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleKick();
                                        }}
                                        disabled={actionLoading}
                                        className="flex-1 rounded bg-red-500 py-1 text-[10px] font-medium text-white hover:bg-red-400 disabled:opacity-50 transition"
                                      >
                                        {actionLoading ? '처리중...' : '강퇴'}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActionTarget(null);
                                        }}
                                        disabled={actionLoading}
                                        className="flex-1 rounded border border-white/10 py-1 text-[10px] text-slate-400 hover:text-white transition"
                                      >
                                        취소
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

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
                              onChange={(e) => {
                                setInviteUserId(e.target.value);
                                if (e.target.value.trim().length > 0)
                                  setInviteTouched(false);
                              }}
                              onBlur={(e) => {
                                if (
                                  !e.target.value ||
                                  e.target.value.trim().length === 0
                                )
                                  setInviteTouched(true);
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
                              inviteLoading ||
                              !workspaceId ||
                              !userId ||
                              inviteUserId.trim().length === 0 ||
                              !validateInviteId(inviteUserId)
                            }
                            onClick={async () => {
                              if (inviteLoading) return;
                              const invitedLoginId = inviteUserId.trim();
                              if (
                                !workspaceId ||
                                !userId ||
                                !validateInviteId(invitedLoginId)
                              ) {
                                alert('초대에 필요한 정보가 부족합니다.');
                                return;
                              }
                              try {
                                setInviteLoading(true);
                                const res = await inviteMember({
                                  workspaceId,
                                  userId,
                                  invitedLoginId,
                                });
                                alert(res.message || '초대가 발송되었습니다.');
                                setInviteUserId('');
                                setIsMembersOpen(false);
                                onSelect('inbox');
                              } catch (err) {
                                alert(
                                  err.message || '초대 중 오류가 발생했습니다.',
                                );
                              } finally {
                                setInviteLoading(false);
                              }
                            }}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium text-white transition ${
                              inviteLoading ||
                              !workspaceId ||
                              !userId ||
                              inviteUserId.trim().length === 0 ||
                              !validateInviteId(inviteUserId)
                                ? 'cursor-not-allowed bg-cyan-500/40'
                                : 'bg-cyan-500 hover:bg-cyan-600'
                            }`}
                          >
                            {inviteLoading ? '전송중...' : '초대'}
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

export default Sidebar;
