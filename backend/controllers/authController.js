// 클라이언트로부터 전달받은 로그인 정보 추출
exports.login = (req, res) => {
    const { loginId, password } = req.body;

    // 필수 필드가 모두 채워졌는지 확인
    if (!loginId || !password) {
        // 필드 누락 시 400 Bad Request 반환
        return res.status(400).json({
            success: false,
            message: '필드 중에 공백이 있는 경우가 있습니다.',
        });
    }

    // 전달받은 로그인 정보 로그로 출력 (비밀번호는 숨김 처리)
    console.log('전달받은 로그인 정보:', {
        loginId,
        password: password ? '[숨김]' : '',
    });

    /*
     * TODO: 실제 인증 로직 구현
     *  - 데이터베이스에서 사용자 조회
     *  - 해싱된 비밀번호 비교
     */

    // 로그인 성공 시 200 OK 응답과 함께 사용자 정보 전달 (현재는 하드코딩된 테스트 닉네임 데이터 반환)
    return res.status(200).json({
        success: true,
        data: {
            // 실제로는 데이터베이스에서 조회한 사용자 정보들을 반환해야 합니다.
            userId: 1,
            nickname: '테스트 유저',
            loginId: loginId,
            email: 'abc@test.com',
            createdAt: '2024-06-01T12:00:00Z',
        },
    });
};
