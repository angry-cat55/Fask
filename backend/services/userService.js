const userModel = require('../models/userModel');

exports.signup = async (userData) => {
    // TODO: 회원가입 비즈니스 로직 구현
    return userModel.createUser(userData);
};

exports.checkUsername = async (loginId) => {
    // TODO: 아이디 중복 확인 비즈니스 로직 구현
    return userModel.findUserByLoginId(loginId);
};

// 아이디 찾기 비즈니스 로직
exports.findIdByEmail = async (email) => {
    // 이메일로 로그인 아이디 조회
    const loginId = await userModel.findLoginIdByEmail(email);

    // 조회된 로그인 아이디가 없으면, 404 Not Found 에러 발생
    if (!loginId) {
        const error = new Error('해당 이메일로 등록된 아이디를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    return loginId.loginId;
};