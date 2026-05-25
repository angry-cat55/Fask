import React from 'react';

const formatTime = (sendAt) => {
  try {
    return new Date(sendAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const ChatBubble = ({ msg, isMine }) => (
  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
    {!isMine && (
      <span className="mb-1 ml-1 text-xs font-semibold text-slate-400">
        {msg.nickname}
      </span>
    )}
    <div className={`flex items-end gap-1.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          isMine
            ? 'rounded-br-sm bg-cyan-600 text-white'
            : 'rounded-bl-sm bg-white/10 text-slate-200'
        }`}
      >
        <p className="whitespace-pre-wrap wrap-break-word">{msg.content}</p>
      </div>
      <span className="shrink-0 text-[10px] text-slate-600">
        {formatTime(msg.sendAt)}
      </span>
    </div>
  </div>
);

export default ChatBubble;
