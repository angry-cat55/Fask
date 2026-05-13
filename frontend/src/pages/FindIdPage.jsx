import React, { useState } from 'react';
import TextInput from '../components/ui/TextInput.jsx';
import PrimaryButton from '../components/ui/PrimaryButton.jsx';

const FindIdPage = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleBlur = () => {
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setError('');
  };

  const handleFindId = async (e) => {
    e.preventDefault();
    setResult('');

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/users/find-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || '등록된 이메일이 아닙니다.');
        return;
      }

      setResult(result.data.loginId);
    } catch (requestError) {
      console.error('아이디 찾기 중 오류 발생:', requestError);
      setError('아이디 찾기 중 오류가 발생했습니다.');
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
            가입한 이메일로 아이디를 확인할 수 있습니다.
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleFindId}>
            <TextInput
              label="이메일"
              type="email"
              placeholder="test@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) {
                  setError('');
                }
              }}
              onBlur={handleBlur}
              autoComplete="email"
              error={error}
            />

            <PrimaryButton type="submit" disabled={loading}>
              {loading ? '찾는 중...' : '아이디 찾기'}
            </PrimaryButton>
          </form>

          {(error || result) && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-sm">
              {error ? (
                <p className="text-red-300">{error}</p>
              ) : (
                <p className="text-cyan-100">
                  찾은 아이디는{' '}
                  <span className="font-bold text-white">{result}</span> 입니다.
                </p>
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

export default FindIdPage;
