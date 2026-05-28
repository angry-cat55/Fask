import React, { useState, useEffect } from 'react';

const RoleBadge = ({ role }) =>
  role === 'LEADER' ? (
    <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
      방장
    </span>
  ) : (
    <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
      멤버
    </span>
  );

const MembersView = ({ userId, workspaceId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transferTarget, setTransferTarget] = useState(null);
  const [transferLoading, setTransferLoading] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/members?userId=${userId}`,
      );
      const result = await res.json();
      if (result.success) {
        setMembers(result.data.members);
      } else {
        setError(result.message || '멤버 목록을 불러오지 못했습니다.');
      }
    } catch {
      setError('서버 통신 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId && userId) fetchMembers();
  }, [workspaceId, userId]);

  const isLeader =
    members.find((m) => String(m.userId) === String(userId))?.role === 'LEADER';

  const handleTransfer = async () => {
    if (!transferTarget) return;
    setTransferLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/owner`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newOwnerId: transferTarget.userId }),
      });
      const result = await res.json();
      if (result.success) {
        alert(result.message || '방장 권한이 위임되었습니다.');
        setTransferTarget(null);
        fetchMembers();
      } else {
        alert(result.message || '방장 권한 위임에 실패했습니다.');
      }
    } catch {
      alert('서버 통신 오류가 발생했습니다.');
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-full p-8 overflow-y-auto bg-slate-950">
      <div className="w-full max-w-lg">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">멤버 목록</h2>
          <button
            onClick={fetchMembers}
            disabled={loading}
            className="text-xs text-slate-500 hover:text-slate-300 transition disabled:opacity-40"
          >
            새로고침
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <p className="text-sm text-slate-600">불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            {error}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-slate-900 divide-y divide-white/5">
            {members.map((member) => {
              const isSelf = String(member.userId) === String(userId);
              const isTransferConfirm =
                transferTarget?.userId === member.userId;

              return (
                <div key={member.userId} className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {/* 아바타 */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700/60 text-sm font-bold text-slate-300">
                      {member.nickname[0].toUpperCase()}
                    </div>

                    {/* 이름 + 아이디 */}
                    <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {member.nickname}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] text-slate-600">(나)</span>
                        )}
                        <RoleBadge role={member.role} />
                      </div>
                      <span className="text-xs text-slate-500 truncate">
                        @{member.loginId}
                      </span>
                    </div>

                    {/* 방장 위임 버튼 (현재 사용자가 LEADER이고, 대상이 MEMBER인 경우) */}
                    {isLeader && !isSelf && member.role !== 'LEADER' && !isTransferConfirm && (
                      <button
                        onClick={() => setTransferTarget(member)}
                        className="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition"
                      >
                        방장 위임
                      </button>
                    )}
                  </div>

                  {/* 위임 확인 영역 */}
                  {isTransferConfirm && (
                    <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex flex-col gap-2">
                      <p className="text-xs text-amber-300">
                        <span className="font-semibold">{member.nickname}</span>님에게 방장 권한을 위임할까요?
                      </p>
                      <p className="text-[10px] text-slate-500">위임 후 내 권한은 일반 멤버로 변경됩니다.</p>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleTransfer}
                          disabled={transferLoading}
                          className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-400 disabled:opacity-50 transition font-medium"
                        >
                          {transferLoading ? '처리 중...' : '위임하기'}
                        </button>
                        <button
                          onClick={() => setTransferTarget(null)}
                          disabled={transferLoading}
                          className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white transition"
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
    </div>
  );
};

export default MembersView;
