import React from 'react';

const WorkspaceList = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-md border border-white/5 bg-slate-900/60 p-6 text-slate-400">
        아직 생성된 워크스페이스가 없습니다.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li
          key={it.workspaceId ?? it.id}
          className="flex items-center justify-between rounded-md border border-white/5 bg-slate-900/60 p-3"
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
      ))}
    </ul>
  );
};

export default WorkspaceList;
