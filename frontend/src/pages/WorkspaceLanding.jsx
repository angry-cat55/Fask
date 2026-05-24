import React, { useCallback, useState } from 'react';
import WorkspaceCreateCard from '../components/workspace/WorkspaceCreateCard.jsx';
import WorkspaceList from '../components/workspace/WorkspaceList.jsx';

const WorkspaceLanding = () => {
  const [items, setItems] = useState([]);

  const handleCreate = useCallback((newWorkspace) => {
    // 아직 API 연결 전이므로 로컬에서 임시로 추가
    setItems((prev) => [
      {
        workspaceId: Date.now(),
        name: newWorkspace.name,
        masterNickname: 'me',
      },
      ...prev,
    ]);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-white">
      <main className="flex flex-1 flex-col overflow-auto divide-y divide-white/5">
        <section className="p-8 flex items-center justify-center">
          <WorkspaceCreateCard onCreate={handleCreate} />
        </section>

        <section className="p-8">
          <h2 className="text-lg font-semibold mb-4">내 워크스페이스</h2>
          <WorkspaceList items={items} />
        </section>
      </main>
    </div>
  );
};

export default WorkspaceLanding;
