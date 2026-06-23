import React, { useState, useEffect, useRef } from 'react';
import TaskModal from './TaskModal';

const COLUMNS = [
  { id: 'TODO',        title: '할 일',   accent: 'bg-slate-500',  textAccent: 'text-slate-300' },
  { id: 'IN_PROGRESS', title: '진행 중', accent: 'bg-red-500',    textAccent: 'text-slate-300' },
  { id: 'DONE',        title: '완료',    accent: 'bg-green-500',  textAccent: 'text-slate-300' },
];

const groupByStatus = (tasks) => {
  const grouped = { TODO: [], IN_PROGRESS: [], DONE: [] };
  tasks.forEach((task) => {
    if (grouped[task.status]) grouped[task.status].push(task);
  });
  return grouped;
};

const getDueInfo = (endTime) => {
  if (!endTime) return null;

  const due = new Date(endTime);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due - today) / 86400000);
  const dateText = endTime.slice(0, 10);

  if (diffDays < 0) {
    return { text: `${dateText} (기간 초과)`, className: 'text-red-400' };
  }
  if (diffDays === 0) {
    return { text: `${dateText} (오늘 마감)`, className: 'text-yellow-400' };
  }
  return { text: dateText, className: 'text-slate-600' };
};

// ── Mock (workspaceId 없을 때 사용) ─────────────────────────────────────────
let mockTasks = [
  { taskId: 1, kanbanId: 1, title: '로고 이미지 수정', content: '더 멋진 디자인으로 변경', endTime: '2026-06-01', status: 'TODO' },
  { taskId: 2, kanbanId: 1, title: 'API 연동',         content: '백엔드 REST API 붙이기',  endTime: '2026-06-10', status: 'TODO' },
  { taskId: 3, kanbanId: 1, title: '칸반 드래그 구현', content: '드래그&드롭 기능 추가',   endTime: '2026-05-20', status: 'IN_PROGRESS' },
  { taskId: 4, kanbanId: 1, title: '로그인 페이지',    content: '',                         endTime: '2026-05-15', status: 'DONE' },
];
let nextMockId = 100;

const mockMembers = [
  { userId: 1, nickname: '뷔너', role: 'LEADER' },
  { userId: 2, nickname: '야르', role: 'MEMBER' },
];

const mockApi = {
  fetchBoard: () => Promise.resolve({ success: true, data: [...mockTasks] }),
  fetchMembers: () => Promise.resolve({ success: true, data: { members: mockMembers } }),
  createTask: (body) => {
    const taskId = nextMockId++;
    mockTasks = [...mockTasks, { taskId, kanbanId: 1, ...body }];
    return Promise.resolve({ success: true });
  },
  updateTask: (taskId, body) => {
    mockTasks = mockTasks.map((t) => (t.taskId === taskId ? { ...t, ...body } : t));
    return Promise.resolve({ success: true });
  },
  deleteTask: (taskId) => {
    mockTasks = mockTasks.filter((t) => t.taskId !== taskId);
    return Promise.resolve({ ok: true, status: 204 });
  },
};

const realApi = {
  fetchBoard: (workspaceId, userId) =>
    fetch(`/api/workspaces/${workspaceId}/kanban?userId=${userId}`).then((r) => r.json()),
  fetchMembers: (workspaceId, userId) =>
    fetch(`/api/workspaces/${workspaceId}/members?userId=${userId}`).then((r) => r.json()),
  createTask: (workspaceId, body) =>
    fetch(`/api/workspaces/${workspaceId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  updateTask: (taskId, body) =>
    fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  deleteTask: (taskId, userId) =>
    fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }),
};
// ────────────────────────────────────────────────────────────────────────────

const KanbanBoard = ({ userId, workspaceId }) => {
  const api = workspaceId ? realApi : mockApi;

  const [cards, setCards] = useState({ TODO: [], IN_PROGRESS: [], DONE: [] });
  const [kanbanId, setKanbanId] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [dragCard, setDragCard] = useState(null);   // { fromColId, ...card }
  const [dragOverCol, setDragOverCol] = useState(null);
  const dragging = useRef(false);

  const loadBoard = async () => {
    const result = await (workspaceId
      ? api.fetchBoard(workspaceId, userId)
      : api.fetchBoard());
    if (result.success && Array.isArray(result.data)) {
      setCards(groupByStatus(result.data));
      if (result.data[0]?.kanbanId) setKanbanId(result.data[0].kanbanId);
    }
  };

  const loadMembers = async () => {
    const result = await (workspaceId
      ? api.fetchMembers(workspaceId, userId)
      : api.fetchMembers());
    if (result.success) setMembers(result.data?.members ?? []);
  };

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([loadBoard(), loadMembers()]);
      } catch (err) {
        console.error('칸반 조회 오류:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [workspaceId, userId, api]);

  const openAdd  = (colId) => setModal({ colId, card: { status: colId } });
  const openEdit = (colId, card) => setModal({ colId, card });
  const closeModal = () => setModal(null);

  const handleSave = async (form) => {
    try {
      if (modal.card.taskId) {
        const result = await api.updateTask(modal.card.taskId, { userId, kanbanId, ...form });
        if (result.success) {
          setCards((prev) => {
            const next = { ...prev };
            next[modal.colId] = next[modal.colId].filter((c) => c.taskId !== modal.card.taskId);
            next[form.status] = [...next[form.status], { ...modal.card, ...form }];
            return next;
          });
          closeModal();
        } else {
          alert(result.message || '수정에 실패했습니다.');
        }
      } else {
        const createResult = await (workspaceId
          ? api.createTask(workspaceId, { userId, ...form })
          : api.createTask({ userId, ...form }));
        if (createResult.success) {
          await loadBoard();
          closeModal();
        } else {
          alert(createResult.message || '태스크 생성에 실패했습니다.');
        }
      }
    } catch (err) {
      console.error('태스크 저장 오류:', err);
      alert('태스크 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('태스크를 삭제하시겠습니까?')) return;
    const { taskId } = modal.card;
    const { colId } = modal;
    const res = await (workspaceId
      ? api.deleteTask(taskId, userId)
      : api.deleteTask(taskId));
    if (res.status === 204 || res.ok) {
      setCards((prev) => ({ ...prev, [colId]: prev[colId].filter((c) => c.taskId !== taskId) }));
      closeModal();
    } else {
      alert('삭제에 실패했습니다.');
    }
  };

  // ── Drag & Drop ─────────────────────────────────────────────────────────────
  const handleDragStart = (e, card, colId) => {
    dragging.current = true;
    setDragCard({ ...card, fromColId: colId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    dragging.current = false;
    setDragCard(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) setDragOverCol(colId);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOverCol(null);
  };

  const handleDrop = async (e, toColId) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!dragCard || dragCard.fromColId === toColId) return;

    const { fromColId, ...card } = dragCard;
    setDragCard(null);

    // 낙관적 업데이트
    setCards((prev) => {
      const next = { ...prev };
      next[fromColId] = next[fromColId].filter((c) => c.taskId !== card.taskId);
      next[toColId]   = [...next[toColId], { ...card, status: toColId }];
      return next;
    });

    try {
      await api.updateTask(card.taskId, { userId, kanbanId, status: toColId });
    } catch (err) {
      console.error('상태 변경 오류:', err);
      // 실패 시 롤백
      setCards((prev) => {
        const next = { ...prev };
        next[toColId]   = next[toColId].filter((c) => c.taskId !== card.taskId);
        next[fromColId] = [...next[fromColId], { ...card, status: fromColId }];
        return next;
      });
    }
  };
  // ────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-500">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 p-8 overflow-hidden">
      <div>
        <h2 className="text-2xl font-bold text-white">칸반 보드</h2>
        <p className="mt-1 text-sm text-slate-500">업무를 카드로 관리하고 진행 상황을 추적하세요.</p>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {COLUMNS.map((col) => {
          const isOver = dragOverCol === col.id;
          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-1 flex-col gap-3 rounded-2xl border p-4 transition-colors ${
                isOver
                  ? 'border-cyan-400/40 bg-cyan-400/5'
                  : 'border-white/5 bg-white/3'
              }`}
            >
              {/* 컬럼 헤더 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.accent}`} />
                  <span className={`text-sm font-semibold ${col.textAccent}`}>{col.title}</span>
                </div>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-400">
                  {cards[col.id].length}
                </span>
              </div>

              {/* 카드 추가 버튼 */}
              <button
                onClick={() => openAdd(col.id)}
                className="flex items-center gap-1.5 rounded-xl border border-dashed border-white/10 px-3 py-2 text-sm text-slate-600 transition hover:border-white/20 hover:text-slate-400"
              >
                <span className="text-base leading-none">+</span> 카드 추가
              </button>

              {/* 카드 목록 */}
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
                {cards[col.id].length === 0 ? (
                  <div
                    className={`flex flex-1 items-center justify-center rounded-xl border border-dashed py-8 transition-colors ${
                      isOver ? 'border-cyan-400/30' : 'border-white/5'
                    }`}
                  >
                    <p className="text-xs text-slate-700">
                      {isOver ? '여기에 놓기' : '카드 없음'}
                    </p>
                  </div>
                ) : (
                  cards[col.id].map((card) => {
                    const isBeingDragged = dragCard?.taskId === card.taskId;
                    const dueInfo = getDueInfo(card.endTime);
                    return (
                      <div
                        key={card.taskId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card, col.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => { if (!dragging.current) openEdit(col.id, card); }}
                        className={`cursor-grab rounded-xl border border-white/5 bg-slate-900 p-3 text-sm text-white transition select-none
                          hover:border-white/20 hover:bg-slate-800 active:cursor-grabbing
                          ${isBeingDragged ? 'opacity-30' : 'opacity-100'}`}
                      >
                        <p className="font-medium">{card.title}</p>
                        {card.content && (
                          <p className="mt-1 text-xs text-slate-500 line-clamp-2">{card.content}</p>
                        )}
                        {dueInfo && (
                          <p className={`mt-2 text-right text-xs ${dueInfo.className}`}>{dueInfo.text}</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <TaskModal
          task={modal.card}
          columns={COLUMNS}
          members={members}
          onSave={handleSave}
          onDelete={modal.card.taskId ? handleDelete : null}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
