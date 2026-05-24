import React from 'react';

const WorkspaceLanding = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-white">
      <main className="flex flex-1 flex-col overflow-auto divide-y divide-white/5">
        <section className="p-8 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-lg border border-white/5 bg-slate-900/80 p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Workspace를 생성하세요.</h1>
            <p className="text-sm text-slate-400 mb-6">
              워크스페이스 이름을 입력하고 생성할 수 있습니다.
            </p>
            <button className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
              워크스페이스 생성
            </button>
          </div>
        </section>

        <section className="p-8">
          <h2 className="text-lg font-semibold mb-4">내 워크스페이스</h2>
          <div className="rounded-md border border-white/5 bg-slate-900/60 p-4 text-slate-400">
            워크스페이스 목록이 여기에 표시됩니다.
          </div>
        </section>
      </main>
    </div>
  );
};

export default WorkspaceLanding;
