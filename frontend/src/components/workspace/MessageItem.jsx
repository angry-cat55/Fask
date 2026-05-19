import React from 'react';

const MessageItem = ({ item, onAccept, onReject }) => (
  <div className="border-b border-white/5 px-4 py-3 last:border-b-0">
    <div className="text-sm font-semibold text-white">{item.workspaceName}</div>
    <div className="mt-1 text-xs text-slate-400">
      초대한 사람: {item.ownerNickname}
    </div>
    <div className="mt-1 text-xs text-slate-500">
      {new Date(item.invitedAt).toLocaleString()}
    </div>
    <div className="mt-2 text-sm text-slate-300">{item.message}</div>

    <div className="mt-3 flex items-center gap-2">
      <button
        type="button"
        onClick={() => onAccept?.(item)}
        className="rounded bg-emerald-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-emerald-400"
      >
        수락
      </button>
      <button
        type="button"
        onClick={() => onReject?.(item)}
        className="rounded border border-white/10 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/5"
      >
        거절
      </button>
    </div>
  </div>
);

export default MessageItem;
