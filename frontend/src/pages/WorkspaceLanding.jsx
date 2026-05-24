import React, { useCallback, useEffect, useState } from 'react';
import WorkspaceCreateCard from '../components/workspace/WorkspaceCreateCard.jsx';
import WorkspaceList from '../components/workspace/WorkspaceList.jsx';

const WorkspaceLanding = ({ user, onEnterWorkspace }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);

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
        // 백엔드 응답 스펙: data.workspaces = Array
        const workspaces = json?.data?.workspaces ?? [];
        if (!Array.isArray(workspaces)) {
          console.warn(
            'Unexpected workspaces format, normalizing to array:',
            workspaces,
          );
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

        // 생성 성공한 워크스페이스 ID로 바로 입장 시도
        const newId = json?.data?.workspaceId;
        if (newId && typeof onEnterWorkspace === 'function') {
          onEnterWorkspace(newId);
          return;
        }

        // fallback: 목록 갱신
        await loadList();
      } catch (err) {
        console.error('워크스페이스 생성 오류:', err);
        alert('워크스페이스 생성 중 오류가 발생했습니다.');
      } finally {
        setCreating(false);
      }
    },
    [user?.userId, loadList],
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-white">
      <main className="flex flex-1 flex-col overflow-auto divide-y divide-white/5">
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
            <WorkspaceList items={items} />
          )}
        </section>
      </main>
    </div>
  );
};

export default WorkspaceLanding;
