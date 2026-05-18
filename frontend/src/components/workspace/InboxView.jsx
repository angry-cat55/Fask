import React, { useCallback, useEffect, useState } from 'react';
import MessageList from './MessageList.jsx';

const fetchInboxMock = () =>
  Promise.resolve({
    success: true,
    data: [
      {
        workspaceId: 1,
        workspaceName: '팀-알파',
        ownerNickname: '태호',
        invitedAt: '2026-05-19T08:26:14.000Z',
        message: '워크스페이스에 초대합니다',
      },
      {
        workspaceId: 2,
        workspaceName: '프로젝트-베타',
        ownerNickname: '수진',
        invitedAt: '2026-05-18T08:26:14.000Z',
        message: '함께 해요!',
      },
    ],
  });

const InboxView = ({ user }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const removeItem = useCallback((workspaceId) => {
    setItems((prev) => prev.filter((item) => item.workspaceId !== workspaceId));
  }, []);

  const loadInbox = useCallback(() => {
    setLoading(true);
    setError(null);

    fetch(
      `/api/workspaces/inbox?userId=${encodeURIComponent(user?.userId ?? '')}`,
    )
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error('fetch failed')),
      )
      .then((json) => {
        setItems(json?.data ?? []);
        setLoading(false);
      })
      .catch(() => {
        fetchInboxMock()
          .then((response) => {
            setItems(response.data ?? []);
            setLoading(false);
          })
          .catch((mockError) => {
            setError(mockError);
            setLoading(false);
          });
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
            onAccept={(item) => removeItem(item.workspaceId)}
            onReject={(item) => removeItem(item.workspaceId)}
          />
        )}
      </aside>
    </div>
  );
};

export default InboxView;
