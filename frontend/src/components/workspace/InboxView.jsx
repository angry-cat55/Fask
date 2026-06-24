import React, { useCallback, useEffect, useState } from 'react';
import MessageList from './MessageList.jsx';

const InboxView = ({ user, onAccepted }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const removeItem = useCallback((workspaceId) => {
    setItems((prev) => prev.filter((item) => item.workspaceId !== workspaceId));
  }, []);

  const handleAccept = useCallback(async (item) => {
    try {
      const res = await fetch(`/api/workspaces/${item.workspaceId}/invitations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.userId, status: 'ACCEPTED' }),
      });
      const result = await res.json();
      if (result.success) {
        removeItem(item.workspaceId);
        onAccepted?.(item.workspaceId);
      } else {
        alert(result.message || '수락에 실패했습니다.');
      }
    } catch {
      alert('서버 통신 오류가 발생했습니다.');
    }
  }, [user, removeItem, onAccepted]);

  const handleReject = useCallback(async (item) => {
    try {
      const res = await fetch(`/api/workspaces/${item.workspaceId}/invitations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.userId, status: 'REJECTED' }),
      });
      const result = await res.json();
      if (result.success) {
        removeItem(item.workspaceId);
      } else {
        alert(result.message || '거절에 실패했습니다.');
      }
    } catch {
      alert('서버 통신 오류가 발생했습니다.');
    }
  }, [user, removeItem]);

  const loadInbox = useCallback(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/workspaces/inbox?userId=${encodeURIComponent(user?.userId ?? '')}`)
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('fetch failed')))
      .then((json) => {
        setItems(json?.data ?? []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [user?.userId]);

  useEffect(() => {
    const initialLoad = setTimeout(() => loadInbox(), 0);
    return () => clearTimeout(initialLoad);
  }, [loadInbox]);

  return (
    <div className="flex h-full min-h-0">
      <aside className="w-80 shrink-0 border-r border-white/5 bg-slate-950/90">
        <div className="border-b border-white/5 p-4">
          <h2 className="text-lg font-bold text-white">수신함</h2>
          <p className="mt-1 text-xs text-slate-500">초대 목록</p>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-slate-500">불러오는 중...</div>
        ) : error ? (
          <div className="p-4 text-sm text-red-400">
            수신함을 불러오지 못했습니다.
          </div>
        ) : (
          <MessageList
            items={items}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}
      </aside>
    </div>
  );
};

export default InboxView;
