import React, { useState, useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble.jsx';

const LIMIT = 30;

// ── Mock (workspaceId 없을 때 사용) ──────────────────────────────────────────
let mockMessages = [
  { messageId: 1, nickname: '팀원A', sendAt: '2026-05-24T09:00:00Z', content: '안녕하세요!' },
  { messageId: 2, nickname: '팀원B', sendAt: '2026-05-24T09:01:00Z', content: '오늘 작업 분배 어떻게 할까요?' },
  { messageId: 3, nickname: '팀원A', sendAt: '2026-05-24T09:02:00Z', content: '일단 칸반 보드에서 할 일 먼저 정하고 얘기해요' },
];
let nextMockId = 100;

const mockApi = {
  fetchMessages: () => Promise.resolve({ success: true, data: [...mockMessages] }),
  sendMessage: async (_, __, content, nick = '나') => {
    const msg = { messageId: nextMockId++, sendAt: new Date().toISOString(), content };
    mockMessages = [...mockMessages, { ...msg, nickname: nick }];
    return { success: true, data: { messageId: msg.messageId, sendAt: msg.sendAt } };
  },
  summarize: () => Promise.resolve({ success: true, data: { summaryContent: '(Mock) 팀원들이 작업 분배에 대해 논의했습니다.' } }),
};

const realApi = {
  fetchMessages: (workspaceId, userId, { cursor, direction } = {}) => {
    const params = new URLSearchParams({ userId, limit: LIMIT });
    if (cursor != null) params.set('cursor', cursor);
    if (direction != null) params.set('direction', direction);
    return fetch(`/api/workspaces/${workspaceId}/messages?${params}`).then((r) => r.json());
  },
  sendMessage: (workspaceId, userId, content) =>
    fetch(`/api/workspaces/${workspaceId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, content }),
    }).then((r) => r.json()),
  summarize: (workspaceId, userId) =>
    fetch(`/api/workspaces/${workspaceId}/messages/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }).then((r) => r.json()),
};
// ─────────────────────────────────────────────────────────────────────────────

const ChatView = ({ userId, workspaceId, nickname }) => {
  const api = workspaceId ? realApi : mockApi;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await (workspaceId
          ? api.fetchMessages(workspaceId, userId)
          : api.fetchMessages());
        if (result.success && Array.isArray(result.data)) {
          setMessages(result.data);
          setHasMore(result.data.length >= LIMIT);
        }
      } catch (err) {
        console.error('채팅 조회 오류:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [workspaceId, userId, api]);

  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView();
  }, [loading]);

  const loadMore = async () => {
    if (loadingMore || !hasMore || messages.length === 0) return;
    const cursor = messages[0].messageId;
    setLoadingMore(true);
    try {
      const result = await (workspaceId
        ? api.fetchMessages(workspaceId, userId, { cursor, direction: 'prev' })
        : api.fetchMessages({ cursor, direction: 'prev' }));
      if (result.success && Array.isArray(result.data)) {
        setMessages((prev) => [...result.data, ...prev]);
        setHasMore(result.data.length >= LIMIT);
      }
    } catch (err) {
      console.error('이전 메시지 로드 오류:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const result = await (workspaceId
        ? api.sendMessage(workspaceId, userId, content)
        : api.sendMessage(null, null, content, nickname ?? '나'));
      if (result.success) {
        setMessages((prev) => [
          ...prev,
          {
            messageId: result.data.messageId,
            nickname: nickname ?? '나',
            sendAt: result.data.sendAt,
            content,
          },
        ]);
        setInput('');
        textareaRef.current.style.height = 'auto';
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      } else {
        alert(result.message || '메시지 전송에 실패했습니다.');
      }
    } catch (err) {
      console.error('메시지 전송 오류:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleSummarize = async () => {
    try {
      const result = await (workspaceId
        ? api.summarize(workspaceId, userId)
        : api.summarize());
      if (result.success) {
        alert(`요약이 생성되었습니다.\n\n${result.data.summaryContent}`);
      } else {
        alert(result.message || '요약 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('요약 오류:', err);
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
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white">채팅</h2>
          <p className="text-xs text-slate-500">팀원들과 실시간으로 소통하세요.</p>
        </div>
        <button
          onClick={handleSummarize}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-white"
        >
          요약 생성
        </button>
      </div>

      {/* 메시지 목록 */}
      <div
        className="flex flex-1 flex-col overflow-y-auto px-4 py-3 gap-3
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-white/10
          hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
      >
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="mx-auto mb-1 rounded-full border border-white/10 px-4 py-1 text-xs text-slate-500 transition hover:text-slate-300 disabled:opacity-50"
          >
            {loadingMore ? '불러오는 중...' : '이전 메시지 보기'}
          </button>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-slate-600">첫 번째 메시지를 보내보세요.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.messageId}
              msg={msg}
              isMine={msg.nickname === (nickname ?? '나')}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="border-t border-white/5 px-4 py-3 shrink-0">
        <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus-within:border-white/20">
          <textarea
            ref={textareaRef}
            value={input}
            onInput={handleInput}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지 입력..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-white placeholder-slate-600 outline-none
              [&::-webkit-scrollbar]:w-1
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-white/10
              hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-40 shrink-0"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
