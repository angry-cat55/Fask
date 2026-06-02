import React, { useState, useEffect } from 'react';

const PERIOD_OPTIONS = [
  { label: '10분',  value: 10 },
  { label: '20분',  value: 20 },
  { label: '30분',  value: 30 },
  { label: '40분',  value: 40 },
  { label: '50분',  value: 50 },
  { label: '1시간',  value: 60 },
  { label: '2시간',  value: 120 },
  { label: '3시간',  value: 180 },
  { label: '4시간',  value: 240 },
  { label: '6시간',  value: 360 },
  { label: '8시간',  value: 480 },
  { label: '12시간', value: 720 },
  { label: '24시간', value: 1440 },
];

const PeriodSelect = ({ value, onChange }) => {
  const matched = PERIOD_OPTIONS.some((opt) => String(opt.value) === String(value));
  const effectiveValue = matched ? String(value) : String(PERIOD_OPTIONS[0].value);
  return (
    <select
      value={effectiveValue}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 transition cursor-pointer"
    >
      {PERIOD_OPTIONS.map((opt) => (
        <option key={opt.value} value={String(opt.value)}>{opt.label}</option>
      ))}
    </select>
  );
};

const WorkspaceSettingsView = ({ user, onLeaveWorkspace }) => {
  const [name, setName] = useState('');
  const [autoTaskPeriod, setAutoTaskPeriod] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [autoTaskLoading, setAutoTaskLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.userId || !user?.workspaceId) {
        setFetchLoading(false);
        return;
      }
      setFetchLoading(true);
      setFetchError('');
      try {
        const res = await fetch(`/api/workspaces?userId=${user.userId}`);
        const result = await res.json();
        const workspaces = result.data?.workspaces ?? [];
        const ws = workspaces.find(
          (w) => String(w.workspaceId) === String(user.workspaceId),
        );
        if (ws) {
          setName(ws.name ?? '');
          setAutoTaskPeriod(ws.auto_task_period ?? ws.autoTaskPeriod ?? '');
        }
      } catch {
        setFetchError('서버 통신 오류가 발생했습니다.');
      } finally {
        setFetchLoading(false);
      }
    };
    load();
  }, [user]);

  const patch = async (body) => {
    const res = await fetch(`/api/workspaces/${user?.workspaceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.userId, ...body }),
    });
    return res.json();
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      alert('워크스페이스 이름을 입력해주세요.');
      return;
    }
    setNameLoading(true);
    try {
      const result = await patch({
        name: name.trim(),
        auto_task_period: Number(autoTaskPeriod) || 10,
      });
      if (result.success) {
        alert('이름이 저장되었습니다.');
      } else {
        alert(result.message || '저장에 실패했습니다.');
      }
    } catch {
      alert('서버 통신 오류가 발생했습니다.');
    } finally {
      setNameLoading(false);
    }
  };

  const handleSaveAutoTaskPeriod = async () => {
    setAutoTaskLoading(true);
    try {
      const result = await patch({
        name: name.trim() || '워크스페이스',
        auto_task_period: Number(autoTaskPeriod) || 10,
      });
      if (result.success) {
        alert('칸반 생성 주기가 저장되었습니다.');
      } else {
        alert(result.message || '저장에 실패했습니다.');
      }
    } catch {
      alert('서버 통신 오류가 발생했습니다.');
    } finally {
      setAutoTaskLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(
        `/api/workspaces/${user?.workspaceId}?userId=${user?.userId}`,
        { method: 'DELETE' },
      );
      if (res.status === 204 || res.ok) {
        const result = await res.json().catch(() => ({}));
        if (res.status === 204 || result.success) {
          alert('워크스페이스가 삭제되었습니다.');
          onLeaveWorkspace();
          return;
        }
        alert(result.message || '삭제에 실패했습니다.');
      } else {
        const result = await res.json().catch(() => ({}));
        alert(result.message || '삭제에 실패했습니다.');
      }
    } catch {
      alert('서버 통신 오류가 발생했습니다.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 transition';

  return (
    <div className="flex flex-col items-center justify-start min-h-full p-8 overflow-y-auto bg-slate-950">
      <div className="w-full max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-8">워크스페이스 설정</h2>

        {fetchLoading ? (
          <p className="text-sm text-slate-600">불러오는 중...</p>
        ) : fetchError ? (
          <p className="text-sm text-red-400">{fetchError}</p>
        ) : (
          <>
            {/* 기본 정보 */}
            <div className="rounded-xl border border-white/10 bg-slate-900 mb-4">
              <div className="px-5 py-4 flex flex-col gap-3">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">기본 정보</p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">워크스페이스 이름</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    className={inputClass}
                    placeholder="워크스페이스 이름"
                  />
                </div>
                <button
                  onClick={handleSaveName}
                  disabled={nameLoading}
                  className="self-end rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-400 disabled:opacity-50 transition"
                >
                  {nameLoading ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>

            {/* 자동화 설정 */}
            <div className="rounded-xl border border-white/10 bg-slate-900 mb-6">
              <div className="px-5 py-4 flex flex-col gap-3">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">자동화 설정</p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">칸반 생성 주기</label>
                  <PeriodSelect value={autoTaskPeriod} onChange={setAutoTaskPeriod} />
                  <p className="text-[11px] text-slate-600">요약을 기반으로 태스크를 자동 생성하는 주기입니다.</p>
                </div>
                <button
                  onClick={handleSaveAutoTaskPeriod}
                  disabled={autoTaskLoading}
                  className="self-end rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-400 disabled:opacity-50 transition"
                >
                  {autoTaskLoading ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>

            {/* 워크스페이스 삭제 */}
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-sm text-red-400 border border-red-400/30 rounded-xl py-3 hover:bg-red-500/10 transition"
              >
                워크스페이스 삭제
              </button>
            ) : (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 flex flex-col gap-4">
                <p className="text-sm text-red-300 font-medium">정말로 워크스페이스를 삭제하시겠습니까?</p>
                <p className="text-xs text-slate-500">삭제된 워크스페이스와 모든 데이터는 복구할 수 없습니다.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex-1 text-sm px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-400 disabled:opacity-50 transition font-medium"
                  >
                    {deleteLoading ? '처리 중...' : '삭제하기'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 text-sm px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white transition"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkspaceSettingsView;
