import React, { useCallback, useEffect, useRef, useState } from 'react';
import WorkspaceCreateCard from '../components/workspace/WorkspaceCreateCard.jsx';
import WorkspaceList from '../components/workspace/WorkspaceList.jsx';
import InboxView from '../components/workspace/InboxView.jsx';

const WorkspaceLanding = ({ user, onEnterWorkspace, onLogout, onUserUpdate }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef(null);

  const handleScroll = (e) => {
    setShowScrollTop(e.target.scrollTop > 300);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadList = useCallback(() => {
    const userId = user?.userId ?? '';
    if (!userId) return;

    setLoading(true);
    setError(null);

    fetch(`/api/workspaces?userId=${encodeURIComponent(userId)}`)
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error('Failed to fetch')),
      )
      .then((json) => {
        const workspaces = json?.data?.workspaces ?? [];
        if (!Array.isArray(workspaces)) {
          setItems([]);
        } else {
          setItems(workspaces);
        }
      })
      .catch((err) => {
        console.error('워크스페이스 목록 로드 실패:', err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [user?.userId]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleCreate = useCallback(
    async (newWorkspace) => {
      if (!user?.userId) {
        alert('사용자 정보가 없습니다. 다시 로그인 해주세요.');
        return;
      }

      setCreating(true);
      try {
        const summaryPeriod = Number(newWorkspace.summary_period) || 2;
        const autoTaskPeriod = Number(newWorkspace.auto_task_period) || 5;

        const body = {
          userId: user.userId,
          name: newWorkspace.name,
          summary_period: summaryPeriod,
          auto_task_period: autoTaskPeriod,
        };

        const res = await fetch('/api/workspaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const json = await res.json();

        if (!res.ok) {
          alert(json.message || '워크스페이스 생성에 실패했습니다.');
          return;
        }

        const newId = json?.data?.workspaceId;

        // 백엔드의 워크스페이스 목록 조회 API가 summary_period/auto_task_period를
        // 응답에 포함하지 않으므로, 생성 시 입력한 값을 user에 직접 반영해
        // 설정 화면 진입 시 방금 지정한 주기가 보이도록 함
        onUserUpdate?.({
          ...user,
          workspaceName: newWorkspace.name,
          summary_period: summaryPeriod,
          auto_task_period: autoTaskPeriod,
        });

        if (newId && typeof onEnterWorkspace === 'function') {
          onEnterWorkspace(newId);
          return;
        }

        await loadList();
      } catch (err) {
        console.error('워크스페이스 생성 오류:', err);
        alert('워크스페이스 생성 중 오류가 발생했습니다.');
      } finally {
        setCreating(false);
      }
    },
    [user, loadList, onEnterWorkspace, onUserUpdate],
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-white">
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-80 rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl flex flex-col gap-4">
            <div className="text-center">
              <p className="text-sm font-semibold text-white">로그아웃</p>
              <p className="mt-1.5 text-sm text-slate-400">정말 로그아웃 하시겠습니까?</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-white/10 py-2 text-sm text-slate-400 transition hover:text-white"
              >
                취소
              </button>
              <button
                onClick={onLogout}
                className="flex-1 rounded-xl bg-cyan-500/20 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/30"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 수신함 드로어 */}
      {isInboxOpen && (
        <aside className="w-80 shrink-0 border-r border-white/10 bg-slate-900/80 flex flex-col">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-white">수신함</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                받은 초대 목록
              </p>
            </div>
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
                onAccepted={(workspaceId) => {
                  if (workspaceId) onEnterWorkspace?.(workspaceId);
                  else loadList();
                }}
              />
          </div>
        </aside>
      )}

      <main className="relative flex flex-1 flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="flex items-center justify-between border-b border-white/5 px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400/15 text-sm font-black text-cyan-300">
              F
            </div>
            <span className="text-sm font-bold text-white">Fask</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsInboxOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition
                ${
                  isInboxOpen
                    ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                    : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
            >
              수신함
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="text-xs text-slate-500 hover:text-white transition"
            >
              로그아웃
            </button>
          </div>
        </header>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex flex-1 flex-col overflow-auto divide-y divide-white/5
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-white/10
            hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
        >
          <section className="p-8 flex items-center justify-center">
            <WorkspaceCreateCard onCreate={handleCreate} loading={creating} />
          </section>

          <section className="p-8 flex flex-col items-center">
            <div className="w-full max-w-2xl">
              <h2 className="text-lg font-semibold mb-4">내 워크스페이스</h2>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="워크스페이스 이름 검색"
                className="mb-4 w-full max-w-xs rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
              />

              {loading ? (
                <div className="rounded-md border border-white/5 bg-slate-900/60 p-6 text-slate-400">
                  불러오는 중...
                </div>
              ) : error ? (
                <div className="rounded-md border border-white/5 bg-rose-900/60 p-6 text-red-300">
                  워크스페이스를 불러오지 못했습니다.
                </div>
              ) : (
                <WorkspaceList
                  items={items.filter((it) =>
                    (it.name ?? it.workspaceName ?? '')
                      .toLowerCase()
                      .includes(searchTerm.trim().toLowerCase()),
                  )}
                  onEnterWorkspace={onEnterWorkspace}
                />
              )}
            </div>
          </section>
        </div>

        {showScrollTop && (
          <button
            onClick={scrollToTop}
            aria-label="맨 위로 이동"
            className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-800/90 text-white shadow-lg transition hover:bg-slate-700"
          >
            ↑
          </button>
        )}
      </main>
    </div>
  );
};

export default WorkspaceLanding;
