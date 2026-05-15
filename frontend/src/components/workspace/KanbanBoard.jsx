import React, { useState } from 'react';
import TaskModal from './TaskModal';

const COLUMNS = [
  { id: 'TODO',        title: '할 일',   accent: 'bg-slate-500',   textAccent: 'text-slate-300' },
  { id: 'IN_PROGRESS', title: '진행 중', accent: 'bg-cyan-500',    textAccent: 'text-cyan-300'  },
  { id: 'REVIEW',      title: '검토 중', accent: 'bg-yellow-500',  textAccent: 'text-yellow-300'},
  { id: 'DONE',        title: '완료',    accent: 'bg-green-500',   textAccent: 'text-green-300' },
];

const INITIAL_CARDS = {
  TODO:        [],
  IN_PROGRESS: [],
  REVIEW:      [],
  DONE:        [],
};

const KanbanBoard = () => {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [modal, setModal] = useState(null); // { colId, card }

  const openAdd  = (colId) => setModal({ colId, card: { status: colId } });
  const openEdit = (colId, card) => setModal({ colId, card });
  const closeModal = () => setModal(null);

  const handleSave = (form) => {
    if (modal.card.id) {
      // 수정: 기존 카드 업데이트 (상태 변경 시 컬럼 이동)
      setCards((prev) => {
        const next = { ...prev };
        next[modal.colId] = next[modal.colId].filter((c) => c.id !== modal.card.id);
        next[form.status] = [...next[form.status], { ...modal.card, ...form }];
        return next;
      });
    } else {
      // 추가: 선택된 상태 컬럼에 새 카드 삽입
      const newCard = { id: Date.now(), ...form };
      setCards((prev) => ({
        ...prev,
        [form.status]: [...prev[form.status], newCard],
      }));
    }
    closeModal();
  };

  return (
    <div className="flex h-full flex-col gap-6 p-8 overflow-hidden">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-white">칸반 보드</h2>
        <p className="mt-1 text-sm text-slate-500">업무를 카드로 관리하고 진행 상황을 추적하세요.</p>
      </div>

      {/* 컬럼 영역 */}
      <div className="kanban-scroll flex flex-1 gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className="flex w-64 shrink-0 flex-col gap-3 rounded-2xl border border-white/5 bg-white/3 p-4"
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
                    key={card.id}
                    onClick={() => openEdit(col.id, card)}
                    className="cursor-pointer rounded-xl border border-white/5 bg-slate-900 p-3 text-sm text-white transition hover:border-white/20 hover:bg-slate-800"
                  >
                    <p className="font-medium">{card.title}</p>
                    {card.content && (
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{card.content}</p>
                    )}
                    {card.endTime && (
                      <p className="mt-2 text-xs text-slate-600">{card.endTime}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}

        {/* 컬럼 추가 버튼 — 추후 구현 예정 */}
        <button className="flex w-56 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 text-slate-700 transition hover:border-white/20 hover:text-slate-500">
          <span className="text-2xl">+</span>
          <span className="text-sm">컬럼 추가</span>
        </button>
      </div>

      {modal && (
        <TaskModal
          task={modal.card}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
