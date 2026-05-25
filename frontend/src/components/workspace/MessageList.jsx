import React from 'react';
import MessageItem from './MessageItem.jsx';

const MessageList = ({ items, onAccept, onReject }) => {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-500">수신된 초대가 없습니다.</div>
    );
  }

  return (
    <div className="divide-y divide-white/5 overflow-auto">
      {items.map((item) => (
        <MessageItem
          key={item.workspaceId}
          item={item}
          onAccept={onAccept}
          onReject={onReject}
        />
      ))}
    </div>
  );
};

export default MessageList;
