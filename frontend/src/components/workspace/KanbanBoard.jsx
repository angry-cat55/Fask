import React, { useState, useEffect } from 'react';
import TaskModal from './TaskModal';

const COLUMNS = [
  { id: 'TODO',        title: '할 일',   accent: 'bg-slate-500',  textAccent: 'text-slate-300' },
  { id: 'IN_PROGRESS', title: '진행 중', accent: 'bg-cyan-500',   textAccent: 'text-cyan-300'  },
  { id: 'DONE',        title: '완료',    accent: 'bg-green-500',  textAccent: 'text-green-300' },
];

// ── 더미 데이터 (백엔드 API 완성 전 임시) ───────────────────────────────────
const DUMMY_KANBAN_ID = 1;
const DUMMY_TASKS = [
  {
    taskId: 1, kanbanId: 1, managerId: 1,
    title: '로고 이미지 수정', content: '더 멋지게 변경',
    startTime: '2026-05-01', endTime: '2026-05-10', status: 'TODO',
  },
  {
    taskId: 2, kanbanId: 1, managerId: 1,
    title: '메인 페이지 레이아웃', content: '반응형 레이아웃 구성',
    startTime: '2026-05-05', endTime: '2026-05-15', status: 'IN_PROGRESS',
  },
  {
    taskId: 3, kanbanId: 1, managerId: 1,
    title: '로그인 API 연동', content: null,
    startTime: '2026-05-01', endTime: '2026-05-08', status: 'DONE',
  },
];
// status 가능 값: 'TODO' | 'IN_PROGRESS' | 'DONE'

let mockTasks = [...DUMMY_TASKS];
let nextTaskId = 100;

const mockApi = {
  fetchBoard: () =>
    Promise.resolve({ success: true, data: [...mockTasks] }),

  createTask: () => {
    const taskId = nextTaskId++;
    return Promise.resolve({ success: true, data: { taskId, kanbanId: DUMMY_KANBAN_ID } });
  },

  updateTask: (taskId, body) => {
    mockTasks = mockTasks.map((t) =>
      t.taskId === taskId ? { ...t, ...body } : t
    );
    return Promise.resolve({ success: true });
  },

  deleteTask: (taskId) => {
    mockTasks = mockTasks.filter((t) => t.taskId !== taskId);
    return Promise.resolve({ ok: true, status: 204 });
  },
};
// ────────────────────────────────────────────────────────────────────────────

const groupByStatus = (tasks) => {
  const grouped = { TODO: [], IN_PROGRESS: [], DONE: [] };
  tasks.forEach((task) => {
    if (grouped[task.status]) grouped[task.status].push(task);
  });
  return grouped;
};

const KanbanBoard = ({ userId }) => {
  const [cards, setCards] = useState({ TODO: [], IN_PROGRESS: [], DONE: [] });
  const [kanbanId, setKanbanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  // 칸반 보드 조회: GET /api/workspaces/{workspaceId}/kanban
  useEffect(() => {
    (async () => {
      try {
        const result = await mockApi.fetchBoard();
        if (result.success && Array.isArray(result.data)) {
          setCards(groupByStatus(result.data));
          if (result.data[0]?.kanbanId) setKanbanId(result.data[0].kanbanId);
        }
      } catch (err) {
        console.error('칸반 조회 오류:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openAdd  = (colId) => setModal({ colId, card: { status: colId } });
  const openEdit = (colId, card) => setModal({ colId, card });
  const closeModal = () => setModal(null);

  const handleSave = async (form) => {
    if (modal.card.taskId) {
      // 태스크 수정: PATCH /api/tasks/{taskId}
      const result = await mockApi.updateTask(modal.card.taskId, { userId, kanbanId, ...form });
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
      // 태스크 추가: POST /api/workspaces/{workspaceId}/tasks → PATCH /api/tasks/{taskId}
      const createResult = await mockApi.createTask();
      if (!createResult.success) {
        alert(createResult.message || '태스크 생성에 실패했습니다.');
        return;
      }
      const newTaskId   = createResult.data.taskId;
      const newKanbanId = createResult.data.kanbanId ?? kanbanId;

      const patchResult = await mockApi.updateTask(newTaskId, { userId, kanbanId: newKanbanId, ...form });
      if (patchResult.success) {
        setCards((prev) => ({
          ...prev,
          [form.status]: [
            ...prev[form.status],
            { taskId: newTaskId, kanbanId: newKanbanId, ...form },
          ],
        }));
        if (newKanbanId && !kanbanId) setKanbanId(newKanbanId);
        closeModal();
      } else {
        alert(patchResult.message || '태스크 저장에 실패했습니다.');
      }
    }
  };

  // 태스크 삭제: DELETE /api/tasks/{taskId}
  const handleDelete = async () => {
    if (!window.confirm('태스크를 삭제하시겠습니까?')) return;
    const { taskId } = modal.card;
    const { colId } = modal;
    const res = await mockApi.deleteTask(taskId);
    if (res.status === 204 || res.ok) {
      setCards((prev) => ({
        ...prev,
        [colId]: prev[colId].filter((c) => c.taskId !== taskId),
      }));
      closeModal();
    } else {
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-500">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 p-8 overflow-hidden">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-white">칸반 보드</h2>
        <p className="mt-1 text-sm text-slate-500">업무를 카드로 관리하고 진행 상황을 추적하세요.</p>
      </div>

      {/* 컬럼 영역 */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className="flex flex-1 flex-col gap-3 rounded-2xl border border-white/5 bg-white/3 p-4"
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
            <div className="flex flex-1 flex-col gap-2">
              {cards[col.id].length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/5 py-8">
                  <p className="text-xs text-slate-700">카드 없음</p>
                </div>
              ) : (
                cards[col.id].map((card) => (
                  <div
                    key={card.taskId}
                    onClick={() => openEdit(col.id, card)}
                    className="cursor-pointer rounded-xl border border-white/5 bg-slate-900 p-3 text-sm text-white transition hover:border-white/20 hover:bg-slate-800"
                  >
                    <p className="font-medium">{card.title}</p>
                    {card.content && (
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{card.content}</p>
                    )}
                    {card.endTime && (
                      <p className="mt-2 text-xs text-slate-600">{card.endTime?.slice(0, 10)}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <TaskModal
          task={modal.card}
          columns={COLUMNS}
          onSave={handleSave}
          onDelete={modal.card.taskId ? handleDelete : null}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
