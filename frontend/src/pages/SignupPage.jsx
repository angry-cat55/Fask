import React, { useState } from 'react';
import TextInput from '../components/ui/TextInput.jsx';
import PrimaryButton from '../components/ui/PrimaryButton.jsx';

const SignupPage = ({ onNavigateToLogin }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // --- 추가된 상태: 중복 확인 여부 및 로딩 상태 ---
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [checkingId, setCheckingId] = useState(false);

  // 유효성 검사 정규식
  const validateLoginId = (value) => {
    const regex = /^[a-zA-Z0-9_-]{4,20}$/;
    return regex.test(value);
  };

  const validatePassword = (value) => {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,20}$/;
    return regex.test(value);
  };

  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const validateNickname = (value) => {
    const regex = /^[가-힣a-zA-Z0-9]{2,10}$/;
    return regex.test(value);
  };

  // --- 추가된 함수: 아이디 중복 확인 API 호출 ---
  const checkDuplicateId = async () => {
    if (!loginId.trim()) {
      setErrors(prev => ({ ...prev, loginId: '아이디를 입력해주세요.' }));
      return;
    }
    if (!validateLoginId(loginId)) {
      setErrors(prev => ({ ...prev, loginId: '아이디 형식이 올바르지 않습니다.' }));
      return;
    }

    setCheckingId(true);
    try {
      const response = await fetch(`/api/users/check-username?username=${encodeURIComponent(loginId)}`);
      
      if (!response.ok) throw new Error('서버 통신 오류');

      const result = await response.json();

      if (result.success) {
        if (result.data.isDuplicated) {
          setErrors(prev => ({ ...prev, loginId: '이미 사용 중인 아이디입니다.' }));
          setIsIdChecked(false);
        } else {
          alert('사용 가능한 아이디입니다.');
          setIsIdChecked(true);
          setErrors(prev => {
            const { loginId: _, ...rest } = prev;
            return rest;
          });
        }
      } else {
        alert(result.message || '확인에 실패했습니다.');
      }
    } catch (error) {
      console.error('중복 확인 중 오류:', error);
      alert('중복 확인 서버 통신 중 오류가 발생했습니다.');
    } finally {
      setCheckingId(false);
    }
  };

  const handleBlur = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'loginId':
        if (!value.trim()) {
          newErrors.loginId = '아이디를 입력해주세요.';
        } else if (!validateLoginId(value)) {
          newErrors.loginId = '아이디는 4-20자의 영문, 숫자, 특수문자(-, _)만 사용 가능합니다.';
        } else {
          delete newErrors.loginId;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = '비밀번호를 입력해주세요.';
        } else if (!validatePassword(value)) {
          newErrors.password = '비밀번호는 8-20자의 영문, 숫자, 특수문자를 포함해야 합니다.';
        } else {
          delete newErrors.password;
        }
        break;
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
        } else if (value !== password) {
          newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      case 'email':
        if (!value.trim()) {
          newErrors.email = '이메일을 입력해주세요.';
        } else if (!validateEmail(value)) {
          newErrors.email = '올바른 이메일 형식을 입력해주세요.';
        } else {
          delete newErrors.email;
        }
        break;
      case 'nickname':
        if (!value.trim()) {
          newErrors.nickname = '닉네임을 입력해주세요.';
        } else if (!validateNickname(value)) {
          newErrors.nickname = '닉네임은 2-10자의 한글, 영문, 숫자만 사용 가능합니다.';
        } else {
          delete newErrors.nickname;
        }
        break;
    }

    setErrors(newErrors);
  }; 

  const validateForm = () => {
    const newErrors = {};

    if (!loginId.trim()) newErrors.loginId = '아이디를 입력해주세요.';
    else if (!validateLoginId(loginId)) newErrors.loginId = '아이디 형식이 올바르지 않습니다.';

    if (!password) newErrors.password = '비밀번호를 입력해주세요.';
    else if (!validatePassword(password)) newErrors.password = '비밀번호 형식이 올바르지 않습니다.';

    if (!confirmPassword) newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    else if (password !== confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';

    if (!email.trim()) newErrors.email = '이메일을 입력해주세요.';
    else if (!validateEmail(email)) newErrors.email = '이메일 형식이 올바르지 않습니다.';

    if (!nickname.trim()) newErrors.nickname = '닉네임을 입력해주세요.';
    else if (!validateNickname(nickname)) newErrors.nickname = '닉네임 형식이 올바르지 않습니다.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // --- 추가: 회원가입 전 중복 확인 체크 ---
    if (!isIdChecked) {
      alert('아이디 중복 확인을 먼저 완료해주세요.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password, email, nickname }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 오류: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        alert(`${result.data.nickname || loginId}님, 회원가입이 완료되었습니다!`);
        // 필드 초기화
        setLoginId('');
        setIsIdChecked(false);
        setPassword('');
        setConfirmPassword('');
        setEmail('');
        setNickname('');
        setErrors({});

        onNavigateToLogin(); //로그인 페이지로 이동
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
            
            {/* --- 아이디 입력창 + 중복 확인 버튼 --- */}
            <div className="relative flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <TextInput
                    label="아이디"
                    placeholder="사용할 아이디를 입력하세요"
                    value={loginId}
                    onChange={(e) => {
                      setLoginId(e.target.value);
                      setIsIdChecked(false); // 아이디 수정 시 중복 확인 리셋
                    }}
                    onBlur={(e) => handleBlur('loginId', e.target.value)}
                    autoComplete="username"
                    error={errors.loginId}
                  />
                </div>
                <button
                  type="button"
                  onClick={checkDuplicateId}
                  disabled={checkingId || !loginId}
                  className="h-14 mt-7 shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-white transition hover:bg-white/10 active:scale-95 disabled:opacity-50"
                >
                  중복 확인
                </button>
              </div>
              {isIdChecked && !errors.loginId && (
                <p className="ml-1 text-xs text-green-400">확인 완료된 아이디입니다.</p>
              )}
            </div>

            <TextInput
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={(e) => handleBlur('password', e.target.value)}
              autoComplete="new-password"
              error={errors.password}
            />

            {/* 비밀번호 확인 필드 (기존 스타일 유지) */}
            <TextInput
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
              autoComplete="new-password"
              error={errors.confirmPassword}
              className={`w-full rounded-xl border bg-slate-900/70 px-4 py-4 text-base text-white placeholder:text-slate-400 outline-none transition focus:bg-slate-900 focus:ring-2 ${
                confirmPassword === '' 
                  ? 'border-white/10 focus:border-cyan-300/70 focus:ring-cyan-300/20'
                  : confirmPassword === password
                  ? 'border-green-400/70 focus:border-green-300/70 focus:ring-green-300/20'
                  : 'border-red-400/70 focus:border-red-300/70 focus:ring-red-300/20'
              }`}
            />

            <TextInput
              label="이메일"
              type="email"
              placeholder="example@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => handleBlur('email', e.target.value)}
              autoComplete="email"
              error={errors.email}
            />

            <TextInput
              label="닉네임"
              placeholder="표시될 별명을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onBlur={(e) => handleBlur('nickname', e.target.value)}
              error={errors.nickname}
            />

            <PrimaryButton 
              type="submit" 
              disabled={loading || !isIdChecked} // 중복 확인 전에는 버튼 비활성화 권장
            >
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