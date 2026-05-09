exports.login = (req, res) => {
  const { loginId, password } = req.body;

  if (!loginId || !password) {
    return res.status(400).json({ success: false, message: 'loginId and password required' });
  }

  console.log('전달받은 로그인 정보:', { loginId, password: password ? '[숨김]' : '' });

  return res.json({
    success: true, message: '테스트 데이터가 들어와서, 테스트 닉네임을 전송합니다.', data: {
      nickname: "테스트 유저"
    }
  });
};