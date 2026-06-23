import React, { useState } from 'react';

const ManagerSelect = ({ members, value, onChange }) => {
  const selectedMember = members.find((m) => m.userId === value);
  const [query, setQuery] = useState(selectedMember?.nickname || '');
  const [open, setOpen] = useState(false);

  const filtered = members.filter((m) =>
    m.nickname.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (member) => {
    onChange(member.userId);
    setQuery(member.nickname);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder="담당자 이름 검색"
        className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
      />
      {open && (
        <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-xl border border-white/10 bg-slate-800 shadow-xl">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-500">검색 결과가 없습니다.</p>
          ) : (
            filtered.map((member) => (
              <button
                key={member.userId}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(member); }}
                className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-slate-700 ${
                  member.userId === value ? 'text-cyan-300' : 'text-white'
                }`}
              >
                {member.nickname}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const fmt = (dateStr) => {
  if (!dateStr) return '-';
  return dateStr.slice(0, 10);
};

const STATUS_LABEL = { TODO: '할 일', IN_PROGRESS: '진행 중', DONE: '완료' };

/* 조회/수정 모드 공통 최소 높이 */
const INNER_MIN_H = 'min-h-[28rem]';

/* 조회 모드에서 입력 필드와 높이를 맞추기 위한 읽기전용 행 스타일 */
const viewRowCls = 'rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white';

const TaskModal = ({ task, columns, members = [], onSave, onDelete, onClose }) => {
  const isNew = !task.taskId;
  const [isEditing, setIsEditing] = useState(isNew);
  const [form, setForm] = useState({
    title:     task.title                       || '',
    content:   task.content                     || '',
    startTime: task.startTime?.slice(0, 10)     || '',
    endTime:   task.endTime?.slice(0, 10)       || '',
    status:    task.status                      || 'TODO',
    managerId: task.managerId ?? members[0]?.userId ?? '',
  });

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const managerName =
    members.find((m) => m.userId === form.managerId)?.nickname || '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto modal-scroll">

        <h3 className="mb-5 text-lg font-bold text-white">
          {isNew ? '태스크 추가' : isEditing ? '태스크 수정' : '태스크 상세'}
        </h3>

        {isEditing ? (
          /* ── 편집 모드 ── */
          <div className={`flex flex-col ${INNER_MIN_H}`}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">제목</label>
                <input
                  autoFocus
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSave(form); }}
                  className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">내용</label>
                <textarea
                  rows={3}
                  value={form.content}
                  onChange={(e) => set('content', e.target.value)}
                  className="modal-scroll resize-none rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
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
                <label className="text-xs font-medium text-slate-400">담당자</label>
                <ManagerSelect
                  members={members}
                  value={form.managerId}
                  onChange={(managerId) => set('managerId', managerId)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">상태</label>
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between">
              {onDelete ? (
                <button
                  onClick={onDelete}
                  className="rounded-xl px-4 py-2 text-sm text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                >
                  삭제
                </button>
              ) : <span />}
              <div className="flex gap-2">
                <button
                  onClick={() => isNew ? onClose() : setIsEditing(false)}
                  className="rounded-xl px-4 py-2 text-sm text-slate-400 transition hover:text-white"
                >
                  취소
                </button>
                <button
                  onClick={async () => {
                    const ok = await onSave(form);
                    if (ok && !isNew) setIsEditing(false);
                  }}
                  className="rounded-xl bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/30"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── 조회 모드 ── */
          <div className={`flex flex-col ${INNER_MIN_H}`}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-slate-400">제목</span>
                <p className={viewRowCls}>{form.title || '-'}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-slate-400">내용</span>
                <textarea
                  rows={3}
                  readOnly
                  value={form.content || '-'}
                  className="modal-scroll resize-none rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-slate-300 outline-none cursor-default"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-slate-400">시작일</span>
                  <p className={viewRowCls}>{fmt(form.startTime)}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-slate-400">마감일</span>
                  <p className={viewRowCls}>{fmt(form.endTime)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-slate-400">담당자</span>
                <p className={viewRowCls}>{managerName}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-slate-400">상태</span>
                <p className={viewRowCls}>{STATUS_LABEL[form.status] || form.status}</p>
              </div>
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between">
              {onDelete ? (
                <button
                  onClick={onDelete}
                  className="rounded-xl px-4 py-2 text-sm text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                >
                  삭제
                </button>
              ) : <span />}
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-sm text-slate-400 transition hover:text-white"
                >
                  닫기
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/30"
                >
                  수정
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskModal;
