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