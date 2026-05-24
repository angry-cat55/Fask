import React, { useCallback, useEffect, useState } from 'react';
import WorkspaceCreateCard from '../components/workspace/WorkspaceCreateCard.jsx';
import WorkspaceList from '../components/workspace/WorkspaceList.jsx';

const WorkspaceLanding = ({ user }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    (newWorkspace) => {
      // 임시: 생성은 4단계에서 API 호출로 대체 예정
      setItems((prev) => [
        {
          workspaceId: Date.now(),
          name: newWorkspace.name,
          masterNickname: user?.nickname ?? 'me',
        },
        ...prev,
      ]);
    },
    [user?.nickname],
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-white">
      <main className="flex flex-1 flex-col overflow-auto divide-y divide-white/5">
        <section className="p-8 flex items-center justify-center">
          <WorkspaceCreateCard onCreate={handleCreate} />
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
