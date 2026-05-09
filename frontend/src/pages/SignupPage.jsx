import React, { useState } from 'react';
import TextInput from '../components/ui/TextInput.jsx';
import PrimaryButton from '../components/ui/PrimaryButton.jsx';

const SignupPage = ({ onNavigateToLogin }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password, email, nickname }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 오류: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        alert(`${result.data.nickname || loginId}님, 회원가입이 완료되었습니다!`);
        setLoginId('');
        setPassword('');
        setEmail('');
        setNickname('');
      } else {
        alert(result.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      alert(error.message || '회원가입 중 오류가 발생했습니다.');
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
          <h1 className="mb-10 text-center text-6xl font-black tracking-[-0.08em] text-white sm:text-7xl">
            Fask
          </h1>

          <p className="mb-8 text-center text-sm text-slate-400">
            빠르고 간편한 회원가입으로 시작하세요.
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSignup}>
            <TextInput
              label="아이디"
              placeholder="사용할 아이디를 입력하세요"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              autoComplete="username"
            />
            <TextInput
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <TextInput
              label="이메일"
              type="email"
              placeholder="example@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <TextInput
              label="닉네임"
              placeholder="표시될 별명을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />

            <PrimaryButton type="submit" disabled={loading}>
              {loading ? '가입 중...' : '회원가입'}
            </PrimaryButton>
          </form>

          <div className="mt-8 text-sm text-slate-400">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="block leading-relaxed">
                이미 계정이 있다면 로그인으로 이동하세요.
              </span>
              <span
                className="cursor-pointer text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
                onClick={onNavigateToLogin}
              >
                로그인 페이지
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
