import React, { useState } from "react";
import "./Login.css"; // 스타일 파일 연결

const Login = () => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // API 명세서 규격: POST /api/auth/login 
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });

      const result = await response.json();

      if (result.success) {
        // 응답 데이터에서 nickname 추출 
        alert(`${result.data.nickname}님 환영합니다!`);
      } else {
        alert(result.message || "로그인 실패");
      }
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
    }
  };

  return (
    <div className="login-full-container">
      <div className="login-card-box">
        {/* 스케치의 큰 로고 이미지 느낌 구현 */}
        <h1 className="fask-main-logo">Fask</h1>
        
        <form className="login-form-fields" onSubmit={handleLogin}>
          <input
            type="text"
            className="fask-input-field"
            placeholder="아이디"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
          />
          <input
            type="password"
            className="fask-input-field"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {/* 스케치에 있던 아이디 저장 체크박스 */}
          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" /> 아이디 저장
            </label>
          </div>

          <button type="submit" className="fask-login-button">로그인</button>
        </form>

        <div className="login-sub-links">
          <span>아이디 찾기</span>
          <span className="bar">|</span>
          <span className="signup-link">회원가입</span>
        </div>
      </div>
    </div>
  );
};

export default Login;