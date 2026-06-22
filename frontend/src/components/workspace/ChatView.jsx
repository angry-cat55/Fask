import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ChatBubble from './ChatBubble.jsx';

const LIMIT = 30;
const TOP_THRESHOLD = 72;
const BOTTOM_THRESHOLD = 48;

const extractMessages = (payload) =>
  Array.isArray(payload) ? payload : (payload?.messages ?? []);

const extractLastReadMessageId = (payload) =>
  Array.isArray(payload) ? null : (payload?.lastReadMessageId ?? null);

const mergeMessages = (currentMessages, incomingMessages, mode) => {
  const currentIds = new Set(
    currentMessages.map((message) => message.messageId),
  );
  const filteredIncoming = incomingMessages.filter(
    (message) => !currentIds.has(message.messageId),
  );

  return mode === 'prepend'
    ? [...filteredIncoming, ...currentMessages]
    : [...currentMessages, ...filteredIncoming];
};

// ── Mock (workspaceId 없을 때 사용) ──────────────────────────────────────────
let mockMessages = [
  {
    messageId: 1,
    nickname: '팀원A',
    sendAt: '2026-05-25T00:00:00Z',
    content: '안녕하세요!',
  },
  {
    messageId: 2,
    nickname: '팀원B',
    sendAt: '2026-05-25T00:01:00Z',
    content: '오늘 작업 분배 어떻게 할까요?',
  },
  {
    messageId: 3,
    nickname: '팀원A',
    sendAt: '2026-05-25T00:02:00Z',
    content: '일단 칸반 보드에서 할 일 먼저 정하고 얘기해요',
  },
  {
    messageId: 4,
    nickname: '팀원B',
    sendAt: '2026-05-25T00:05:00Z',
    content: '좋아요! 저는 API 연동 담당할게요',
  },
  {
    messageId: 5,
    nickname: '팀원A',
    sendAt: '2026-05-25T00:07:00Z',
    content: '저는 UI 마무리 할게요. 채팅 말풍선 디자인 수정 중이에요',
  },
  {
    messageId: 6,
    nickname: '팀원B',
    sendAt: '2026-05-25T00:10:00Z',
    content: '오케이~ 완료되면 PR 올려주세요',
  },
  {
    messageId: 7,
    nickname: '팀원A',
    sendAt: '2026-05-25T00:15:00Z',
    content: '넵! 오늘 중으로 올리겠습니다',
  },
  {
    messageId: 8,
    nickname: '팀원B',
    sendAt: '2026-05-25T00:30:00Z',
    content: '칸반 드래그 기능도 완료됐나요?',
  },
  {
    messageId: 9,
    nickname: '팀원A',
    sendAt: '2026-05-25T00:32:00Z',
    content: '네 드래그 앤 드롭 다 됩니다. 테스트 해보시면 됩니다',
  },
  {
    messageId: 10,
    nickname: '팀원B',
    sendAt: '2026-05-25T00:35:00Z',
    content: '확인했어요! 잘 동작하네요 👍',
  },
  {
    messageId: 11,
    nickname: '팀원A',
    sendAt: '2026-05-25T01:00:00Z',
    content: '소켓 연결은 백엔드 준비 되면 바로 붙이면 될 것 같아요',
  },
  {
    messageId: 12,
    nickname: '팀원B',
    sendAt: '2026-05-25T01:05:00Z',
    content: '맞아요 URL만 맞추면 될 것 같아요',
  },
  {
    messageId: 13,
    nickname: '팀원A',
    sendAt: '2026-05-25T01:10:00Z',
    content: '오늘 회의 몇 시예요?',
  },
  {
    messageId: 14,
    nickname: '팀원B',
    sendAt: '2026-05-25T01:11:00Z',
    content: '오후 3시요!',
  },
  {
    messageId: 15,
    nickname: '팀원A',
    sendAt: '2026-05-25T01:12:00Z',
    content: '알겠습니다. 그럼 그 전까지 PR 리뷰 부탁드려요',
  },
];
let nextMockId = 100;

const mockApi = {
  fetchMessages: () =>
    Promise.resolve({ success: true, data: [...mockMessages] }),
  sendMessage: async (_, __, content, nick = '나') => {
    const msg = {
      messageId: nextMockId++,
      sendAt: new Date().toISOString(),
      content,
    };
    mockMessages = [...mockMessages, { ...msg, nickname: nick }];
    return {
      success: true,
      data: { messageId: msg.messageId, sendAt: msg.sendAt },
    };
  },
  summarize: () =>
    Promise.resolve({ success: false, message: '워크스페이스 정보가 없어 요약을 생성할 수 없습니다.' }),
};

const realApi = {
  fetchMessages: (workspaceId, userId, { cursor, direction } = {}) => {
    const params = new URLSearchParams({ userId, limit: LIMIT });
    if (cursor != null) params.set('cursor', cursor);
    if (direction != null) params.set('direction', direction);
    return fetch(`/api/workspaces/${workspaceId}/messages?${params}`).then(
      (r) => r.json(),
    );
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

const ChatView = ({
  userId,
  workspaceId,
  nickname,
  latestSocketMessage,
  firstUnreadMessageId,
  onSummaryCreated,
}) => {
  const api = workspaceId ? realApi : mockApi;

  const [messages, setMessages] = useState([]);
  const [lastReadMessageId, setLastReadMessageId] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadingNewer, setLoadingNewer] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [hasMoreNewer, setHasMoreNewer] = useState(false);
  const [sending, setSending] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const latestMessageIdRef = useRef(null);
  const workspaceIdRef = useRef(workspaceId);
  const userIdRef = useRef(userId);
  useEffect(() => { workspaceIdRef.current = workspaceId; }, [workspaceId]);
  useEffect(() => { userIdRef.current = userId; }, [userId]);

  // 채팅 패널 닫힐 때(언마운트) 마지막 읽은 메시지 ID 갱신
  useEffect(() => {
    return () => {
      const lastId = latestMessageIdRef.current;
      const wId = workspaceIdRef.current;
      const uId = userIdRef.current;
      if (!lastId || !wId || !uId) return;
      fetch(`/api/workspaces/${wId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uId, lastReadMessageId: lastId }),
        keepalive: true,
      }).catch(() => {});
    };
  }, []);

  const scrollContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const unreadRef = useRef(null);
  const scrollAdjustmentRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const tempMessageIdRef = useRef(0);
  const unreadBoundaryMessageId =
    firstUnreadMessageId ??
    (lastReadMessageId != null ? lastReadMessageId + 1 : null);

  const scrollToBottom = (behavior = 'auto') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  const loadOlderMessages = async () => {
    if (loadingOlder || !hasMoreOlder || messages.length === 0) return;

    const container = scrollContainerRef.current;
    const previousScrollHeight = container?.scrollHeight ?? 0;
    const previousScrollTop = container?.scrollTop ?? 0;
    const cursor = messages[0].messageId;

    setLoadingOlder(true);
    try {
      const result = await (workspaceId
        ? api.fetchMessages(workspaceId, userId, {
            cursor,
            direction: 'older',
          })
        : api.fetchMessages({ cursor, direction: 'older' }));

      if (result.success) {
        const incomingMessages = extractMessages(result.data);

        if (incomingMessages.length > 0) {
          scrollAdjustmentRef.current = {
            type: 'prepend',
            previousScrollHeight,
            previousScrollTop,
          };

          setMessages((prev) =>
            mergeMessages(prev, incomingMessages, 'prepend'),
          );
        }

        setHasMoreOlder(incomingMessages.length >= LIMIT);
      }
    } catch (err) {
      console.error('이전 메시지 로드 오류:', err);
    } finally {
      setLoadingOlder(false);
    }
  };

  const loadNewerMessages = async () => {
    if (loadingNewer || !hasMoreNewer || messages.length === 0) return;

    const cursor = messages[messages.length - 1].messageId;

    setLoadingNewer(true);
    try {
      const result = await (workspaceId
        ? api.fetchMessages(workspaceId, userId, {
            cursor,
            direction: 'newer',
          })
        : api.fetchMessages({ cursor, direction: 'newer' }));

      if (result.success) {
        const incomingMessages = extractMessages(result.data);

        if (incomingMessages.length > 0) {
          if (stickToBottomRef.current) {
            scrollAdjustmentRef.current = { type: 'bottom' };
          }

          setMessages((prev) =>
            mergeMessages(prev, incomingMessages, 'append'),
          );
        }

        setHasMoreNewer(incomingMessages.length >= LIMIT);
      }
    } catch (err) {
      console.error('최신 메시지 로드 오류:', err);
    } finally {
      setLoadingNewer(false);
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    const isScrollable = scrollHeight > clientHeight + 1;

    stickToBottomRef.current = distanceToBottom <= BOTTOM_THRESHOLD;

    if (!isScrollable) return;

    if (scrollTop <= TOP_THRESHOLD && hasMoreOlder && !loadingOlder) {
      void loadOlderMessages();
    }

    if (distanceToBottom <= BOTTOM_THRESHOLD && hasMoreNewer && !loadingNewer) {
      void loadNewerMessages();
    }
  };

  useEffect(() => {
    let isCancelled = false;

    setLoading(true);
    setMessages([]);
    setLastReadMessageId(null);
    setHasMoreOlder(false);
    setHasMoreNewer(false);

    (async () => {
      try {
        const result = await (workspaceId
          ? api.fetchMessages(workspaceId, userId)
          : api.fetchMessages());
        const payload = result?.data;
        const nextMessages = extractMessages(payload);
        const nextLastReadMessageId = extractLastReadMessageId(payload);

        if (!isCancelled && result.success) {
          setMessages(nextMessages);
          setLastReadMessageId(nextLastReadMessageId);
          setHasMoreOlder(nextMessages.length > 0);
          setHasMoreNewer(nextMessages.length > 0);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('채팅 조회 오류:', err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [workspaceId, userId, api]);

  useEffect(() => {
    if (messages.length > 0) {
      latestMessageIdRef.current = messages[messages.length - 1].messageId;
    }
  }, [messages]);

  useLayoutEffect(() => {
    const action = scrollAdjustmentRef.current;
    if (!action) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    if (action.type === 'prepend') {
      container.scrollTop =
        action.previousScrollTop +
        (container.scrollHeight - action.previousScrollHeight);
    } else if (action.type === 'bottom') {
      scrollToBottom();
    }

    scrollAdjustmentRef.current = null;
  }, [messages]);

  useEffect(() => {
    if (!loading) {
      if (unreadBoundaryMessageId && unreadRef.current) {
        unreadRef.current.scrollIntoView({ block: 'center' });
      } else {
        scrollToBottom();
      }
    }
  }, [loading, unreadBoundaryMessageId]);

  // 소켓으로 새 메시지 수신
  useEffect(() => {
    if (!latestSocketMessage) return;
    setMessages((prev) => {
      if (prev.some((m) => m.messageId === latestSocketMessage.messageId))
        return prev;

      if (String(latestSocketMessage.userId) === String(userId)) {
        const pendingIndex = prev.findIndex(
          (message) =>
            typeof message.messageId === 'string' &&
            message.messageId.startsWith('temp-') &&
            message.content === latestSocketMessage.content,
        );

        if (pendingIndex !== -1) {
          const nextMessages = [...prev];
          nextMessages[pendingIndex] = latestSocketMessage;
          return nextMessages;
        }
      }

      if (stickToBottomRef.current) {
        scrollAdjustmentRef.current = { type: 'bottom' };
      }
      return [...prev, latestSocketMessage];
    });
  }, [latestSocketMessage, userId]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;

    const tempMessageId = `temp-${Date.now()}-${tempMessageIdRef.current++}`;
    const optimisticMessage = {
      messageId: tempMessageId,
      userId,
      nickname: nickname ?? '나',
      sendAt: new Date().toISOString(),
      content,
    };

    setMessages((prev) => {
      scrollAdjustmentRef.current = { type: 'bottom' };
      return [...prev, optimisticMessage];
    });

    setInput('');
    textareaRef.current.style.height = 'auto';
    setSending(true);
    try {
      const result = await (workspaceId
        ? api.sendMessage(workspaceId, userId, content)
        : api.sendMessage(null, null, content, nickname ?? '나'));
      if (result.success) {
        const sentMessage = {
          messageId: result.data.messageId,
          nickname: nickname ?? '나',
          sendAt: result.data.sendAt,
          userId,
          content,
        };

        setMessages((prev) => {
          const tempIndex = prev.findIndex(
            (message) => message.messageId === tempMessageId,
          );

          if (tempIndex === -1) {
            if (
              prev.some(
                (message) => message.messageId === sentMessage.messageId,
              )
            ) {
              return prev;
            }

            scrollAdjustmentRef.current = { type: 'bottom' };
            return [...prev, sentMessage];
          }

          const nextMessages = [...prev];
          nextMessages[tempIndex] = sentMessage;
          return nextMessages;
        });
      } else {
        setMessages((prev) =>
          prev.filter((message) => message.messageId !== tempMessageId),
        );
        alert(result.message || '메시지 전송에 실패했습니다.');
      }
    } catch (err) {
      setMessages((prev) =>
        prev.filter((message) => message.messageId !== tempMessageId),
      );
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
    setSummarizing(true);
    try {
      const result = await (workspaceId
        ? api.summarize(workspaceId, userId)
        : api.summarize());
      if (result.success) {
        onSummaryCreated?.(result.data);
        alert('요약 생성이 완료되었습니다.');
      } else {
        alert(result.message || '요약 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('요약 오류:', err);
    } finally {
      setSummarizing(false);
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
          <p className="text-xs text-slate-500">
            팀원들과 실시간으로 소통하세요.
          </p>
        </div>
        <button
          onClick={handleSummarize}
          disabled={summarizing}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {summarizing ? '생성 중...' : '요약 생성'}
        </button>
      </div>

      {/* 메시지 목록 */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex flex-1 flex-col overflow-y-auto px-4 py-3 gap-3
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-white/10
          hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
      >
        {loadingOlder && (
          <div className="text-center text-[11px] text-slate-500">
            이전 메시지를 불러오는 중...
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-slate-600">
              첫 번째 메시지를 보내보세요.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <React.Fragment key={msg.messageId}>
              {msg.messageId === unreadBoundaryMessageId && (
                <div ref={unreadRef} className="flex items-center gap-2 my-1">
                  <div className="flex-1 h-px bg-cyan-400/30" />
                  <span className="text-[10px] text-cyan-400 shrink-0">
                    여기서부터 읽지 않은 메시지
                  </span>
                  <div className="flex-1 h-px bg-cyan-400/30" />
                </div>
              )}
              <ChatBubble
                msg={msg}
                isMine={msg.nickname === (nickname ?? '나')}
              />
            </React.Fragment>
          ))
        )}
        {loadingNewer && (
          <div className="text-center text-[11px] text-slate-500">
            최신 메시지를 불러오는 중...
          </div>
        )}
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
