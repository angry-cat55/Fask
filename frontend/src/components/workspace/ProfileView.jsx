import React, { useState } from 'react';

const ProfileView = ({ user, onLogout, onUserUpdate }) => {
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(user?.nickname ?? '');
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameLoading, setNicknameLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const validateNickname = (value) => /^[가-힣a-zA-Z0-9]{2,10}$/.test(value);

  const handleNicknameSave = async () => {
    const trimmed = nicknameInput.trim();
    if (!validateNickname(trimmed)) {
      setNicknameError('2~10자의 한글, 영문, 숫자만 사용 가능합니다.');
      return;
    }
    if (trimmed === user?.nickname) {
      setIsEditingNickname(false);
      return;
    }
    setNicknameLoading(true);
    try {
      const res = await fetch(`/api/users/${user?.userId}/nickname`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: trimmed }),
      });
      const result = await res.json();
      if (result.success) {
        onUserUpdate({ ...user, nickname: trimmed });
        setIsEditingNickname(false);
        setNicknameError('');
      } else {
        setNicknameError(result.message || '변경에 실패했습니다.');
      }
    } catch {
      setNicknameError('서버 통신 오류가 발생했습니다.');
    } finally {
      setNicknameLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.userId }),
      });
      if (res.status === 204 || res.ok) {
        alert('계정이 삭제되었습니다.');
        onLogout();
      } else {
        const result = await res.json().catch(() => ({}));
        alert(result.message || '계정 삭제에 실패했습니다.');
      }
    } catch {
      alert('서버 통신 오류가 발생했습니다.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-';

  return (
    <div className="flex flex-col items-center justify-start min-h-full p-8 overflow-y-auto bg-slate-950">
      <div className="w-full max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-8">내 프로필</h2>

        {/* 아바타 + 닉네임 */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <span className="text-3xl font-bold text-cyan-400">
              {(user?.nickname ?? '?')[0].toUpperCase()}
            </span>
          </div>
          <p className="text-lg font-semibold text-white">{user?.nickname}</p>
        </div>

        {/* 정보 카드 */}
        <div className="rounded-xl border border-white/10 bg-slate-900 divide-y divide-white/5 mb-6">

          {/* 닉네임 */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">닉네임</span>
              {isEditingNickname ? (
                <div className="flex flex-col gap-1 mt-1">
                  <input
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => {
                      setNicknameInput(e.target.value);
                      setNicknameError('');
                    }}
                    maxLength={10}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNicknameSave();
                      if (e.key === 'Escape') {
                        setIsEditingNickname(false);
                        setNicknameInput(user?.nickname ?? '');
                        setNicknameError('');
                      }
                    }}
                    className="bg-slate-800 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-500 transition w-48"
                  />
                  {nicknameError && (
                    <p className="text-xs text-red-400">{nicknameError}</p>
                  )}
                </div>
              ) : (
                <span className="text-sm text-white">{user?.nickname}</span>
              )}
            </div>
            <div className="flex gap-2 ml-4 shrink-0">
              {isEditingNickname ? (
                <>
                  <button
                    onClick={handleNicknameSave}
                    disabled={nicknameLoading}
                    className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-50 transition font-medium"
                  >
                    {nicknameLoading ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingNickname(false);
                      setNicknameInput(user?.nickname ?? '');
                      setNicknameError('');
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white transition"
                  >
                    취소
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsEditingNickname(true);
                    setNicknameInput(user?.nickname ?? '');
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-slate-200 transition"
                >
                  변경
                </button>
              )}
            </div>
          </div>

          {/* 아이디 */}
          <div className="flex flex-col gap-1 px-5 py-4">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">아이디</span>
            <span className="text-sm text-white">{user?.loginId ?? '-'}</span>
          </div>

          {/* 이메일 */}
          <div className="flex flex-col gap-1 px-5 py-4">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">이메일</span>
            <span className="text-sm text-white">{user?.email ?? '-'}</span>
          </div>

          {/* 가입일 */}
          <div className="flex flex-col gap-1 px-5 py-4">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">가입일</span>
            <span className="text-sm text-white">{createdAt}</span>
          </div>
        </div>

        {/* 계정 탈퇴 */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-sm text-red-400 border border-red-400/30 rounded-xl py-3 hover:bg-red-500/10 transition"
          >
            계정 탈퇴
          </button>
        ) : (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 flex flex-col gap-4">
            <p className="text-sm text-red-300 font-medium">정말로 계정을 삭제하시겠습니까?</p>
            <p className="text-xs text-slate-500">삭제된 계정은 복구할 수 없습니다.</p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 text-sm px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-400 disabled:opacity-50 transition font-medium"
              >
                {deleteLoading ? '처리 중...' : '탈퇴하기'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 text-sm px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white transition"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
