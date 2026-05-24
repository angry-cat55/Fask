import React, { useState } from 'react';

const WorkspaceCreateCard = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) return;
    setLoading(true);
    // 실제 API는 아직 연결하지 않음; 상위에서 onCreate로 처리하도록 함
    Promise.resolve()
      .then(() => {
        onCreate?.({ name: name.trim() });
      })
      .finally(() => {
        setLoading(false);
        setName('');
      });
  };

  return (
    <div className="w-full max-w-2xl rounded-lg border border-white/5 bg-slate-900/80 p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Workspace를 생성하세요.</h1>
      <p className="text-sm text-slate-400 mb-6">
        워크스페이스 이름을 입력하고 생성할 수 있습니다.
      </p>

      <div className="flex items-center justify-center gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="워크스페이스 이름"
          className="w-64 rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none"
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? '생성 중...' : '생성'}
        </button>
      </div>
    </div>
  );
};

export default WorkspaceCreateCard;
