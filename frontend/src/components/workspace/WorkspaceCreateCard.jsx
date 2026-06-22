import React, { useState } from 'react';
import PeriodSelect from './PeriodSelect.jsx';

const WorkspaceCreateCard = ({
  onCreate,
  loading: externalLoading = false,
}) => {
  const [name, setName] = useState('');
  const [summaryPeriod, setSummaryPeriod] = useState('2');
  const [autoTaskPeriod, setAutoTaskPeriod] = useState('5');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      summary_period: Number(summaryPeriod) || 2,
      auto_task_period: Number(autoTaskPeriod) || 5,
    };
    const result = onCreate?.(payload);

    // if parent returned a promise, await it and show local loading
    if (result && typeof result.then === 'function') {
      try {
        setLoading(true);
        await result;
      } finally {
        setLoading(false);
      }
    }

    setName('');
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
          disabled={externalLoading}
          className="w-64 rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none disabled:opacity-60"
        />

        <button
          onClick={handleCreate}
          disabled={externalLoading || loading}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {externalLoading || loading ? '생성 중...' : '생성'}
        </button>
      </div>

      <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs text-slate-400">
          <span>요약 생성 주기</span>
          <PeriodSelect value={summaryPeriod} onChange={setSummaryPeriod} />
        </label>
        <label className="flex flex-col gap-2 text-xs text-slate-400">
          <span>태스크 자동 생성 주기</span>
          <PeriodSelect value={autoTaskPeriod} onChange={setAutoTaskPeriod} />
        </label>
      </div>
    </div>
  );
};

export default WorkspaceCreateCard;
