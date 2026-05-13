const userService = require('../services/userService');

exports.signup = (req, res) => {
    // 클라이언트로부터 전달받은 회원가입 정보 추출
    const { loginId, password, email, nickname } = req.body;

    // 필수 필드가 모두 채워졌는지 확인
    if (!loginId || !password || !email || !nickname) {
        // 하나라도 공백이 있는 경우 400 Bad Request 응답 반환
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

    /*
     * TODO: 실제 회원가입 로직 구현 (데이터베이스에 사용자 정보 저장 등)
     */

    // 회원가입 성공 시 201 Created 응답과 함께 생성된 사용자 ID를 반환
    return res.status(201).json({
        success: true,
        data: {
            userId: 1, // 실제로는 데이터베이스에서 생성된 고유 ID를 반환해야 합니다.
            nickname: nickname,
        },
    });
};

exports.checkUsername = (req, res) => {
    // 클라이언트로부터 전달받은 로그인 아이디 추출
    const { username } = req.query;
    const loginId = username; // 클라이언트에서 전달된 username을 loginId로 사용

    // 로그인 아이디가 전달되었는지 확인
    if (!loginId) {
        // 로그인 아이디가 없는 경우 400 Bad Request 응답 반환
        return res.status(400).json({
            success: false,
            message: '아이디 필드가 누락되었습니다.',
        });
    }

    // 전달받은 로그인 아이디 로그로 출력
    console.log('중복 확인할 로그인 아이디:', loginId);

    /*
     * TODO: 실제 로그인 아이디 중복 확인 로직 구현 (데이터베이스에서 해당 로그인 아이디를 가진 사용자가 있는지 확인)
     */

    // 로그인 아이디 중복 확인 성공 시 200 OK 응답과 함께 결과 반환
    return res.status(200).json({
        success: true,
        data: {
            isAvailable: true, // true: 사용 가능한 아이디일 때, false: 이미 존재하는 아이디일 때
        },
    });
};

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
        const loginId = await userService.findIdByEmail(email);

        // 아이디 찾기 성공 시 200 OK 응답과 함께 결과 반환
        return res.status(200).json({
            success: true,
            data: {
                loginId: loginId,
            },
        });
    } catch (error) { // 아이디 찾기 과정에서 발생한 에러 처리
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 내부 오류가 발생하였습니다.',
        });
    }
};

exports.checkPassword = (req, res) => {
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

    /*
     * TODO: 실제 비밀번호 찾기 확인 로직 구현
     * 1. 데이터베이스에서 loginId를 가진 사용자가 있는지 확인
     * 2. 해당 사용자의 이메일과 전달받은 email이 일치하는지 확인
     * 3. 일치하면 success: true 반환
     * 4. 일치하지 않으면 success: false 반환
     */

    // 임시 응답: DB 연결 전이므로 항상 성공 처리
    return res.status(200).json({
        success: true,
        message: '본인 확인이 완료되었습니다.',
    });

}; 4

exports.resetPassword = (req, res) => {
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
    /*
     * TODO: 실제 비밀번호 변경 로직 구현
     * 1. 데이터베이스에서 loginId를 가진 사용자가 있는지 확인
     * 2. 사용자가 존재하지 않으면 실패 응답 반환
     * 3. newPassword를 암호화
     * 4. 암호화된 비밀번호를 DB에 저장
     * 5. 성공 응답 반환
     */
    // 임시 응답: DB 연결 전이므로 항상 성공 처리
    return res.status(200).json({
        success: true,
        message: '비밀번호가 성공적으로 재설정되었습니다.',
    });
};
