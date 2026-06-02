import React, { useCallback, useEffect, useState } from 'react';
import WorkspaceCreateCard from '../components/workspace/WorkspaceCreateCard.jsx';
import WorkspaceList from '../components/workspace/WorkspaceList.jsx';
import InboxView from '../components/workspace/InboxView.jsx';

const WorkspaceLanding = ({ user, onEnterWorkspace, onLogout }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);

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
        const body = {
          userId: user.userId,
          name: newWorkspace.name,
          summary_period: 1,
          auto_task_period: 7,
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
    [user?.userId, loadList, onEnterWorkspace],
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-white">
      {/* 수신함 드로어 */}
      {isInboxOpen && (
        <aside className="w-80 shrink-0 border-r border-white/10 bg-slate-900/80 flex flex-col">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-white">수신함</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">받은 초대 목록</p>
            </div>
            <button
              onClick={() => setIsInboxOpen(false)}
              className="text-xs text-slate-500 hover:text-white transition"
            >
              닫기 ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <InboxView user={user} onAccepted={loadList} />
          </div>
        </aside>
      )}

      <main className="flex flex-1 flex-col overflow-auto">
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
                ${isInboxOpen
                  ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                  : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'}`}
            >
              수신함
            </button>
            <button
              onClick={onLogout}
              className="text-xs text-slate-500 hover:text-white transition"
            >
              로그아웃
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col overflow-auto divide-y divide-white/5">
          <section className="p-8 flex items-center justify-center">
            <WorkspaceCreateCard onCreate={handleCreate} loading={creating} />
          </section>

          <section className="p-8">
            <h2 className="text-lg font-semibold mb-4">내 워크스페이스</h2>

            {loading ? (
              <div className="rounded-md border border-white/5 bg-slate-900/60 p-6 text-slate-400">
                불러오는 중...
              </div>
            ) : error ? (
              <div className="rounded-md border border-white/5 bg-rose-900/60 p-6 text-red-300">
                워크스페이스를 불러오지 못했습니다.
              </div>
            ) : (
              <WorkspaceList items={items} onEnterWorkspace={onEnterWorkspace} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default WorkspaceLanding;
