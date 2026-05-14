const authService = require('../services/authService');

// 로그인 컨트롤러
exports.login = async (req, res) => {
    // 클라이언트로부터 전달받은 로그인 정보 추출
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
        const result = await authService.login(loginId, password);

        // 사용자 정보를 조회 로직에 따른 응답과 함께 결과 반환
        return res.status(result.statusCode).json({
            success: result.isSuccess,
            data: result.data,
            message: result.message,
        });
    } catch (error) { // 로그인 과정에서 발생한 에러 처리
        console.error('로그인 오류:', error);

        return res.status(500).json({
            success: false,
            message: '서버 내부 오류가 발생하였습니다.',
        });
    }
};
