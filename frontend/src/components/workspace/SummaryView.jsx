import React from 'react';

const fmt = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const SummaryView = ({ summaries = [] }) => (
  <div className="flex h-full flex-col">
    <div className="border-b border-white/5 px-6 py-4 shrink-0">
      <h2 className="text-lg font-bold text-white">요약 공간</h2>
      <p className="text-xs text-slate-500">AI가 생성한 채팅 요약 목록입니다.</p>
    </div>

    <div
      className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3
        [&::-webkit-scrollbar]:w-1
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-white/10
        hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
    >
      {summaries.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-center text-sm text-slate-600">
            아직 생성된 요약이 없습니다.
            <br />
            채팅에서 요약 생성 버튼을 눌러보세요.
          </p>
        </div>
      ) : (
        [...summaries].reverse().map((s) => (
          <div
            key={s.summaryId}
            className="rounded-xl border border-white/5 bg-white/3 p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-cyan-400/70">
                #{s.startMessageId} ~ #{s.endMessageId}
              </span>
              <span className="text-xs text-slate-600">{fmt(s.createdAt)}</span>
            </div>
            <p className="text-sm text-white leading-relaxed">{s.summaryContent}</p>
          </div>
        ))
      )}
    </div>
  </div>
);

export default SummaryView;
