import React from 'react';

const ChatView = () => {
  return (
    <div className="flex h-full flex-col gap-6 p-8">
      <div>
        <h2 className="text-2xl font-bold text-white">채팅</h2>
        <p className="mt-1 text-sm text-slate-500">팀원들과 실시간으로 소통하세요.</p>
      </div>

      <div className="flex flex-1 rounded-2xl border border-dashed border-white/10" />
    </div>
  );
};

export default ChatView;