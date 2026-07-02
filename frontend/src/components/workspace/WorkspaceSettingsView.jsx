import React, { useState, useEffect } from 'react';
import PeriodSelect from './PeriodSelect.jsx';

const DEFAULT_SUMMARY_PERIOD = 2;
const DEFAULT_AUTO_TASK_PERIOD = 5;

const WorkspaceSettingsView = ({
  user,
  onLeaveWorkspace,
  onUserUpdate,
  onWorkspaceSaved,
}) => {
  const [name, setName] = useState('');
  const [summaryPeriod, setSummaryPeriod] = useState(
    String(DEFAULT_SUMMARY_PERIOD),
  );
  const [autoTaskPeriod, setAutoTaskPeriod] = useState('');
  const [masterNickname, setMasterNickname] = useState(null);
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

      setName(user?.workspaceName ?? '');
      setSummaryPeriod(
        String(
          user?.summary_period ?? user?.summaryPeriod ?? DEFAULT_SUMMARY_PERIOD,
        ),
      );
      setAutoTaskPeriod(
        String(
          user?.auto_task_period ??
            user?.autoTaskPeriod ??
            DEFAULT_AUTO_TASK_PERIOD,
        ),
      );

      try {
        const res = await fetch(`/api/workspaces?userId=${user.userId}`);
        const result = await res.json();
        const workspaces = result.data?.workspaces ?? [];
        const ws = workspaces.find(
          (w) => String(w.workspaceId) === String(user.workspaceId),
        );
        if (ws) {
          setName(ws.name ?? '');
          setMasterNickname(ws.masterNickname ?? null);
          const nextSummaryPeriod = ws.summary_period ?? ws.summaryPeriod;
          const nextAutoTaskPeriod = ws.auto_task_period ?? ws.autoTaskPeriod;

          if (nextSummaryPeriod != null) {
            setSummaryPeriod(String(nextSummaryPeriod));
          }

          if (nextAutoTaskPeriod != null) {
            setAutoTaskPeriod(String(nextAutoTaskPeriod));
          }
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
        summary_period: Number(summaryPeriod) || DEFAULT_SUMMARY_PERIOD,
        auto_task_period: Number(autoTaskPeriod) || DEFAULT_AUTO_TASK_PERIOD,
      });
      if (result.success) {
        onUserUpdate?.({
          ...user,
          workspaceName: name.trim(),
          summary_period: Number(summaryPeriod) || DEFAULT_SUMMARY_PERIOD,
          auto_task_period: Number(autoTaskPeriod) || DEFAULT_AUTO_TASK_PERIOD,
        });
        onWorkspaceSaved?.();
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
        summary_period: Number(summaryPeriod) || DEFAULT_SUMMARY_PERIOD,
        auto_task_period: Number(autoTaskPeriod) || DEFAULT_AUTO_TASK_PERIOD,
      });
      if (result.success) {
        onUserUpdate?.({
          ...user,
          workspaceName: name.trim() || '워크스페이스',
          summary_period: Number(summaryPeriod) || DEFAULT_SUMMARY_PERIOD,
          auto_task_period: Number(autoTaskPeriod) || DEFAULT_AUTO_TASK_PERIOD,
        });
        onWorkspaceSaved?.();
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

  const isMaster = masterNickname !== null && user?.nickname === masterNickname;

  const inputClass = (disabled) =>
    `w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition ${
      disabled ? 'cursor-not-allowed opacity-50' : 'focus:border-cyan-500'
    }`;

  return (
    <div className="flex flex-col items-center justify-start min-h-full p-8 overflow-y-auto bg-slate-950">
      <div className="w-full max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-8">
          워크스페이스 설정
        </h2>

        {fetchLoading ? (
          <p className="text-sm text-slate-600">불러오는 중...</p>
        ) : fetchError ? (
          <p className="text-sm text-red-400">{fetchError}</p>
        ) : (
          <>
            {!isMaster && (
              <div className="mb-5 rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-xs text-slate-500">
                방장만 설정을 변경할 수 있습니다.
              </div>
            )}

            {/* 기본 정보 */}
            <div className="rounded-xl border border-white/10 bg-slate-900 mb-4">
              <div className="px-5 py-4 flex flex-col gap-3">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  기본 정보
                </p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">
                    워크스페이스 이름
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    disabled={!isMaster}
                    className={inputClass(!isMaster)}
                    placeholder="워크스페이스 이름"
                  />
                </div>
                {isMaster && (
                  <button
                    onClick={handleSaveName}
                    disabled={nameLoading}
                    className="self-end rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-400 disabled:opacity-50 transition"
                  >
                    {nameLoading ? '저장 중...' : '저장'}
                  </button>
                )}
              </div>
            </div>

            {/* 요약 설정 */}
            <div className="rounded-xl border border-white/10 bg-slate-900 mb-4">
              <div className="px-5 py-4 flex flex-col gap-3">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  요약 설정
                </p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">
                    요약 생성 주기
                  </label>
                  <PeriodSelect
                    value={summaryPeriod}
                    onChange={setSummaryPeriod}
                    disabled={!isMaster}
                  />
                  <p className="text-[11px] text-slate-600">
                    대화 내용을 자동 요약할 기준 주기입니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 자동화 설정 */}
            <div className="rounded-xl border border-white/10 bg-slate-900 mb-6">
              <div className="px-5 py-4 flex flex-col gap-3">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  자동화 설정
                </p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">
                    칸반 생성 주기
                  </label>
                  <PeriodSelect
                    value={autoTaskPeriod}
                    onChange={setAutoTaskPeriod}
                    disabled={!isMaster}
                  />
                  <p className="text-[11px] text-slate-600">
                    요약을 기반으로 태스크를 자동 생성하는 주기입니다.
                  </p>
                </div>
                {isMaster && (
                  <button
                    onClick={handleSaveAutoTaskPeriod}
                    disabled={autoTaskLoading}
                    className="self-end rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-400 disabled:opacity-50 transition"
                  >
                    {autoTaskLoading ? '저장 중...' : '저장'}
                  </button>
                )}
              </div>
            </div>

            {/* 워크스페이스 삭제 — 방장만 표시 */}
            {isMaster && !showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-sm text-red-400 border border-red-400/30 rounded-xl py-3 hover:bg-red-500/10 transition"
              >
                워크스페이스 삭제
              </button>
            ) : isMaster && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 flex flex-col gap-4">
                <p className="text-sm text-red-300 font-medium">
                  정말로 워크스페이스를 삭제하시겠습니까?
                </p>
                <p className="text-xs text-slate-500">
                  삭제된 워크스페이스와 모든 데이터는 복구할 수 없습니다.
                </p>
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
