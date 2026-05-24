import React from 'react';

const WorkspaceList = ({ items = [], onEnterWorkspace }) => {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-md border border-white/5 bg-slate-900/60 p-6 text-slate-400">
        아직 생성된 워크스페이스가 없습니다.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((it) => {
        const id = it.workspaceId ?? it.id;
        return (
          <li
            key={id}
            className="flex cursor-pointer items-center justify-between rounded-md border border-white/5 bg-slate-900/60 p-3 hover:bg-slate-900/80"
            onClick={() => onEnterWorkspace?.(id)}
            role={onEnterWorkspace ? 'button' : undefined}
            tabIndex={onEnterWorkspace ? 0 : undefined}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && onEnterWorkspace) {
                e.preventDefault();
                onEnterWorkspace(id);
              }
            }}
          >
            <div>
              <div className="font-medium text-white">
                {it.name ?? it.workspaceName}
              </div>
              <div className="text-xs text-slate-400">
                {it.masterNickname ?? it.ownerNickname}
              </div>
            </div>
            <div className="text-sm text-slate-500">
              {it.count ? `${it.count}명` : ''}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default WorkspaceList;
