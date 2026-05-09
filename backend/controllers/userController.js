exports.signup = (req, res) => {
  // 클라이언트로부터 전달받은 회원가입 정보 추출
  const { loginId, password, email, nickname } = req.body;

  // 필수 필드가 모두 채워졌는지 확인
  if (!loginId || !password || !email || !nickname) {
    // 하나라도 공백이 있는 경우 400 Bad Request 응답 반환
    return res
    .status(400)
    .json({
      success: false,
      message: '필드 중에 공백이 있는 경우가 있습니다.'
    });
  }

  // 전달받은 회원가입 정보 로그로 출력 (비밀번호는 숨김 처리)
  console.log('전달받은 회원가입 정보:', { loginId, password: password ? '[숨김]' : '', email, nickname });

  /*
  * TODO: 실제 회원가입 로직 구현 (데이터베이스에 사용자 정보 저장 등)
  */

  // 회원가입 성공 시 201 Created 응답과 함께 생성된 사용자 ID를 반환
  return res
  .status(201)
  .json({
    success: true,
    data: {
      userId: 1, // 실제로는 데이터베이스에서 생성된 고유 ID를 반환해야 합니다.
      nickname: nickname
    }
  });
};