import React, { useState } from 'react';

const LoginPage = ({
  onNavigateToSignup,
  onNavigateToFindId,
  onNavigateToResetPassword,
  onLoginSuccess,
}) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // API 명세서 규격: POST /api/auth/login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password }),
      });

      const result = await response.json();

      if (result.success) {
        onLoginSuccess(result.data);
      } else {
        alert(result.message || '로그인 실패');
      }
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
        <div className="pointer-events-none absolute left-6 top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-6 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 px-6 py-10 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-10">
          <h1 className="mb-10 text-center text-6xl font-black tracking-[-0.08em] text-white sm:text-7xl">
            Fask
          </h1>

          <form className="flex flex-col gap-3" onSubmit={handleLogin}>
            <input
              type="text"
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-4 text-base text-white placeholder:text-slate-400 outline-none transition focus:border-cyan-300/70 focus:bg-slate-900 focus:ring-2 focus:ring-cyan-300/20"
              placeholder="아이디"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-4 text-base text-white placeholder:text-slate-400 outline-none transition focus:border-cyan-300/70 focus:bg-slate-900 focus:ring-2 focus:ring-cyan-300/20"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="pt-1 text-left">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-cyan-400 accent-cyan-400"
                />
                아이디 저장
              </label>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-white px-4 py-4 text-lg font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-100 active:translate-y-0"
            >
              로그인
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400">
            <button
              type="button"
              className="cursor-pointer transition hover:text-white"
              onClick={onNavigateToFindId}
            >
              아이디 찾기
            </button>
            <span className="cursor-default text-slate-600">|</span>
            <button
              type="button"
              className="cursor-pointer transition hover:text-white"
              onClick={onNavigateToResetPassword}
            >
              비밀번호 변경
            </button>
            <span className="cursor-default text-slate-600">|</span>
            <button
              type="button"
              className="font-semibold text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
              onClick={onNavigateToSignup}
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
