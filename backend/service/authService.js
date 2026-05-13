const authModel = require('../models/authModel');

// 로그인 비즈니스 로직
exports.login = async (loginId, password) => {
    // 유저 정보 추출
    const userInfo = await authModel.findUserByLoginId(loginId);

    // 유저 정보가 없는 경우, 401 Unauthorized 에러 발생
    if (!userInfo) {
        const error = new Error('사용자를 찾을 수 없습니다.');
        error.statusCode = 401;
        throw error;
    }

    // 비밀번호가 일치하지 않는 경우, 401 Unauthorized 에러 발생
    if (userInfo.password !== password) {
        const error = new Error('비밀번호가 일치하지 않습니다.');
        error.statusCode = 401;
        throw error;
    }

    return userInfo;
};