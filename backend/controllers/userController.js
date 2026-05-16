const userService = require('../services/userService');

// 회원가입 컨트롤러
exports.signup = async (req, res) => {
    try {
        // 클라이언트로부터 전달받은 회원가입 정보 추출
        const { loginId, password, email, nickname } = req.body;

        // 필수 필드가 모두 전달되었는지 확인
        if (!loginId || !password || !email || !nickname) {
            return res.status(400).json({
                success: false,
                message: '필드 중에 공백이 있는 경우가 있습니다.',
            });
        }

        // 전달받은 회원가입 정보 로그로 출력 (비밀번호는 숨김 처리)
        console.log('전달받은 회원가입 정보:', {
            loginId,
            password: password ? '[숨김]' : '',
            email,
            nickname,
        });

        // 회원가입 비즈니스 로직을 수행
        await userService.signupUser({
            loginId,
            password,
            email,
            nickname,
        });

        // 회원가입 성공 응답 반환
        return res.status(201).json({
            success: true,
            data: {
                nickname: nickname,
            }
        });

    } catch (error) { // 회원가입 과정에서 발생한 에러 처리
        console.error('회원가입 오류: ', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
        });
    }
};

// 아이디 중복 확인 컨트롤러
exports.checkUsername = async (req, res) => {
    try {
        // 클라이언트에서 ?username=test123 으로 보낸 값
        const { username } = req.query;
        const loginId = username;

        // 로그인 아이디가 전달되었는지 확인
        if (!loginId || loginId.trim() === '') {
            return res.status(400).json({
                success: false,
                message: '아이디 필드가 누락되었습니다.',
            });
        }

        console.log('중복 확인할 로그인 아이디:', loginId);

        // service로 중복 확인 요청
        const isDuplicated = await userService.checkUsername(loginId);

        // 중복 확인 결과에 따라 응답 반환
        return res.status(200).json({
            success: true,
            data: {
                isDuplicated, // true: 아이디가 이미 존재하여 중복, false: 아이디가 존재하지 않아 사용 가능
            },
        });
    } catch (error) { // 아이디 중복 확인 과정에서 발생한 에러 처리
        console.error('로그인 아이디 중복 확인 오류:', error);

        // 서버 오류 응답 반환
        return res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.',
        });
    }
};

// 아이디 찾기 컨트롤러
exports.findId = async (req, res) => {
    // 클라이언트로부터 전달받은 이메일 추출
    const { email } = req.body;

    // 이메일이 전달되었는지 확인
    if (!email) {
        // 이메일이 없는 경우 400 Bad Request 응답 반환
        return res.status(400).json({
            success: false,
            message: '이메일 필드가 누락되었습니다.',
        });
    }

    // 전달받은 이메일 로그로 출력
    console.log('아이디 찾기용 이메일:', email);

    try {
        // 아이디 찾기 비즈니스 로직을 수행하여 로그인 아이디 조회
        const result = await userService.findIdByEmail(email);

        // 아이디 찾기 로직에 따른 응답과 함께 결과 반환
        return res.status(result.statusCode).json({
            success: result.isSuccess,
            data: {
                loginId: result.data.loginId,
            },
            message: result.message,
        });
    } catch (error) { // 아이디 찾기 과정에서 발생한 에러 처리
        console.error('아이디 찾기 오류:', error);

        return res.status(500).json({
            success: false,
            message: '서버 내부 오류가 발생하였습니다.',
        });
    }
};

// 아이디와 이메일을 받아 유저 정보가 일치하여 비밀번호를 변경 가능한지 확인하는 컨트롤러
exports.checkPassword = async (req, res) => {
    // 클라이언트로부터 전달받은 로그인 아이디와 이메일 추출
    const { loginId, email } = req.body;

    // 로그인 아이디가 전달되었는지 확인
    if (!loginId) {
        return res.status(400).json({
            success: false,
            message: '아이디 필드가 누락되었습니다.',
        });
    }

    // 이메일이 전달되었는지 확인
    if (!email) {
        return res.status(400).json({
            success: false,
            message: '이메일 필드가 누락되었습니다.',
        });
    }

    // 전달받은 값 로그로 출력
    console.log('비밀번호 찾기 요청 로그인 아이디:', loginId);
    console.log('비밀번호 찾기 요청 이메일:', email);

    try {
        // 비밀번호 확인 비즈니스 로직을 수행하여 결과 조회
        const isCorrect = await userService.checkPassword({ loginId, email });

        // 비밀번호 확인 성공 시 200 OK 응답과 함께 결과 반환
        return res.status(200).json({
            success: true,
            data: {
                isCorrect: isCorrect, // true: 아이디와 이메일이 올바르게 입력되어 비밀번호 재설정 가능, false: 일치하지 않음
            },
        });
    } catch (error) { // 비밀번호 확인 과정에서 발생한 에러 처리
        console.error('비밀번호 재설정 가능 여부 확인 오류:', error);

        return res.status(500).json({
            success: false,
            message: '서버 내부 오류가 발생하였습니다.',
        });
    }
};

// 비밀번호 재설정 컨트롤러
exports.resetPassword = async (req, res) => {
    // 클라이언트로부터 전달받은 로그인 아이디와 새 비밀번호 추출
    const { loginId, newPassword } = req.body;

    // 로그인 아이디가 전달되었는지 확인
    if (!loginId) {
        return res.status(400).json({
            success: false,
            message: '아이디 필드가 누락되었습니다.',
        });
    }

    // 새 비밀번호가 전달되었는지 확인
    if (!newPassword) {
        return res.status(400).json({
            success: false,
            message: '새 비밀번호 필드가 누락되었습니다.',
        });
    }

    // 전달받은 값 로그로 출력 (새 비밀번호는 숨김 처리)
    console.log('비밀번호 재설정 요청 로그인 아이디:', loginId);
    console.log('비밀번호 재설정 요청 새 비밀번호:', '[숨김]');

    try {
        // 비밀번호 재설정 비즈니스 로직을 수행하여 비밀번호 변경
        const result = await userService.resetPassword({ loginId, newPassword });

        // 비밀번호 재설정 로직에 따른 응답과 함께 결과 반환
        return res.status(result.statusCode).json({
            success: result.isSuccess,
            message: result.message,
        });
    } catch (error) { // 비밀번호 재설정 과정에서 발생한 에러 처리
        console.error('비밀번호 재설정 오류:', error);

        return res.status(500).json({
            success: false,
            message: '서버 내부 오류가 발생하였습니다.',
        });
    }
};
