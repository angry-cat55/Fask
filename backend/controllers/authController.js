const authService = require('../services/authService');

// 클라이언트로부터 전달받은 로그인 정보 추출
exports.login = async (req, res) => {
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

    try {
        // 로그인 비즈니스 로직을 수행하여 사용자 정보 조회
        const userInfo = await authService.login(loginId, password);

        // 사용자 정보가 없는 경우, 401 Unauthorized 반환
        if (!userInfo) {
            return res.status(401).json({
                success: false,
                message: '로그인에 실패하였습니다. 아이디 또는 비밀번호를 확인해주세요.',
            });
        }

        // 사용자 정보를 조회한 성공한 경우, 200 OK 응답과 함께 사용자 정보 반환
        return res.status(200).json({
            success: true,
            data: {
                userId: userInfo.userId,
                nickname: userInfo.nickname,
                loginId: userInfo.loginId,
                email: userInfo.email,
                createdAt: userInfo.createdAt,
            },
        });
    } catch (error) { // 로그인 과정에서 발생한 에러 처리
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 내부 오류가 발생하였습니다.',
        });
    }
};
