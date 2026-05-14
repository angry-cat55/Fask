const userModel = require('../models/userModel');

// 회원가입 비즈니스 로직
exports.signupUser = async ({ loginId, password, email, nickname }) => {
    // 아이디 중복 확인
    const existingUser = await userModel.findUserByLoginId(loginId);

    // 로그인 아이디가 이미 존재하면, 409 Conflict 에러 발생
    if (existingUser) {
        const error = new Error('이미 사용 중인 아이디입니다.');
        error.statusCode = 409;
        throw error;
    }

    // 회원가입 처리
    await userModel.createUser({
        loginId,
        password,
        email,
        nickname,
    });
};

// 아이디 중복 확인 비즈니스 로직
exports.checkUsername = async (loginId) => {
    const trimmedLoginId = loginId.trim();

    const existingUser = await userModel.findUserByLoginId(trimmedLoginId);
    // 로그인 아이디가 이미 존재하면 true, 그렇지 않으면 false 반환
    if (existingUser != null) return true;
    else return false;
};

// 아이디 찾기 비즈니스 로직
exports.findIdByEmail = async (email) => {
    // 이메일로 로그인 아이디 조회
    const loginId = await userModel.findLoginIdByEmail(email);

    // 조회된 로그인 아이디가 없으면, 404 Not Found 에러 발생
    if (!loginId) {
        return {
            isSuccess: false,
            message: '해당 이메일로 등록된 아이디를 찾을 수 없습니다.',
            statusCode: 404,
        }
    }

    // 조회된 로그인 아이디가 있으면, 200 OK 응답과 함께 결과 반환
    return {
        isSuccess: true,
        statusCode: 200,
        data: {
            loginId: loginId.loginId
        }
    };
};

// 비밀번호 재설정 가능 여부 확인 비즈니스 로직
exports.checkPassword = async ({ loginId, email }) => {
    // 로그인 아이디로 사용자 조회
    const user = await userModel.findUserByLoginId(loginId);

    // 사용자가 존재하지 않으면 false 반환
    if (!user) {
        return false;
    }

    // 이메일이 일치하는지 확인
    if (user.email !== email) {
        return false;
    }

    return true; // 로그인 아이디와 이메일이 유저 정보와 일치하면 true, 그렇지 않으면 false 반환
};

// 비밀번호 재설정 비즈니스 로직
exports.resetPassword = async ({ loginId, newPassword }) => {
    // 로그인 아이디로 사용자 조회
    const user = await userModel.findUserByLoginId(loginId);

    // 사용자가 존재하지 않으면, 404 Not Found 에러 발생
    if (!user) {
        return {
            isSuccess: false,
            message: '해당 아이디를 찾을 수 없습니다.',
            statusCode: 404,
        }
    }

    // 기존 비밀번호와 새 비밀번호가 같은 경우, 309 Conflict 에러 발생
    if (user.password === newPassword) {
        return {
            isSuccess: false,
            message: '기존 비밀번호와 일치합니다.',
            statusCode: 409,
        }
    }

    // 비밀번호 재설정
    await userModel.updatePasswordByLoginId({ loginId, newPassword });

    return {
        isSuccess: true,
        message: '비밀번호가 성공적으로 재설정되었습니다.',
        statusCode: 200,
    }
}