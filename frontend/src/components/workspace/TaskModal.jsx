import React, { useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'TODO',        label: '할 일'   },
  { value: 'IN_PROGRESS', label: '진행 중' },
  { value: 'REVIEW',      label: '검토 중' },
  { value: 'DONE',        label: '완료'    },
];

const TaskModal = ({ task, onSave, onClose }) => {
  const [form, setForm] = useState({
    title:     task.title                   || '',
    content:   task.content                 || '',
    startTime: task.startTime?.slice(0, 10) || '',
    endTime:   task.endTime?.slice(0, 10)   || '',
    status:    task.status                  || 'TODO',
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-5 text-lg font-bold text-white">{task.id ? '태스크 수정' : '태스크 추가'}</h3>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">제목</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSave(form); if (e.key === 'Escape') onClose(); }}
              className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">내용</label>
            <textarea
              rows={3}
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              className="resize-none rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">시작일</label>
              <input
                type="date"
                value={form.startTime}
                onChange={(e) => set('startTime', e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">마감일</label>
              <input
                type="date"
                value={form.endTime}
                onChange={(e) => set('endTime', e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">상태</label>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-slate-400 transition hover:text-white"
          >
            취소
          </button>
          <button
            onClick={() => onSave(form)}
            className="rounded-xl bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/30"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
