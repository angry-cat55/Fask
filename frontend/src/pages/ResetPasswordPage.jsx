import React, { useState } from 'react';
import TextInput from '../components/ui/TextInput.jsx';
import PrimaryButton from '../components/ui/PrimaryButton.jsx';

const ResetPasswordPage = ({ onNavigateToLogin }) => {
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validatePassword = (value) => {
    const regex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,20}$/;
    return regex.test(value);
  };

  const passwordMismatchError =
    confirmPassword && newPassword && newPassword !== confirmPassword
      ? '새 비밀번호와 확인 값이 일치하지 않습니다.'
      : '';

  const resetStatus = () => {
    setError('');
    setSuccessMessage('');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetStatus();

    if (!isVerified) {
      setError('먼저 아이디와 이메일 확인을 완료해주세요.');
      return;
    }

    if (!newPassword) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('비밀번호는 8-20자의 영문, 숫자, 특수문자를 포함해야 합니다.');
      return;
    }

    if (!confirmPassword) {
      setError('새 비밀번호 확인을 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호와 확인 값이 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/users/reset-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: loginId.trim(), newPassword }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || '비밀번호 변경에 실패했습니다.');
        return;
      }

      const msg = result.message || '비밀번호가 변경되었습니다.';
      alert(msg);
      setIsVerified(false);
      setNewPassword('');
      setConfirmPassword('');
      onNavigateToLogin();
    } catch (requestError) {
      console.error('비밀번호 변경 중 오류 발생:', requestError);
      setError('비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPassword = async (e) => {
    e.preventDefault();
    resetStatus();

    if (!loginId.trim()) {
      setError('아이디를 입력해주세요.');
      return;
    }

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/users/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: loginId.trim(), email: email.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setIsVerified(false);
        setError(result.message || '아이디 또는 이메일을 확인할 수 없습니다.');
        return;
      }

      setIsVerified(true);
      setSuccessMessage(
        '본인 확인이 완료되었습니다. 새 비밀번호를 입력하세요.',
      );
    } catch (requestError) {
      console.error('비밀번호 확인 중 오류 발생:', requestError);
      setError('비밀번호 확인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
        <div className="pointer-events-none absolute left-6 top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-6 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 px-6 py-10 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-10">
          <h1 className="mb-6 text-center text-6xl font-black tracking-[-0.08em] text-white sm:text-7xl">
            Fask
          </h1>
          <p className="mb-8 text-center text-sm text-slate-400">
            새 비밀번호와 확인 값을 입력해 비밀번호 변경을 진행합니다.
          </p>

          <form
            className="flex flex-col gap-4"
            onSubmit={isVerified ? handleResetPassword : handleCheckPassword}
          >
            {!isVerified && (
              <>
                <TextInput
                  label="아이디"
                  placeholder="test1234"
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value);
                    setIsVerified(false);
                    resetStatus();
                  }}
                  autoComplete="username"
                  required
                />

                <TextInput
                  label="이메일"
                  type="email"
                  placeholder="test1234@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsVerified(false);
                    resetStatus();
                  }}
                  autoComplete="email"
                  required
                />
              </>
            )}

            {isVerified && (
              <>
                <TextInput
                  label="새 비밀번호"
                  type="password"
                  placeholder="새 비밀번호를 입력하세요"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    resetStatus();
                  }}
                  autoComplete="new-password"
                  required
                />

                <TextInput
                  label="새 비밀번호 확인"
                  type="password"
                  placeholder="새 비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    resetStatus();
                  }}
                  autoComplete="new-password"
                  required
                  error={passwordMismatchError}
                />
              </>
            )}

            <PrimaryButton type="submit" disabled={loading}>
              {loading
                ? '처리 중...'
                : isVerified
                  ? '비밀번호 변경'
                  : '본인 확인'}
            </PrimaryButton>
          </form>

          {(error || successMessage) && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-sm">
              {error ? (
                <p className="text-red-300">{error}</p>
              ) : (
                <p className="text-cyan-100">{successMessage}</p>
              )}
            </div>
          )}

          <div className="mt-8 text-center text-sm text-slate-400">
            <button
              type="button"
              className="font-semibold text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
              onClick={onNavigateToLogin}
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
