const authModel = require('../models/authModel');

// 로그인 비즈니스 로직
exports.login = async (loginId, password) => {
    // 유저 정보 추출
    const userInfo = await authModel.findUserByLoginId(loginId);

    // 유저 정보가 없거나 비밀번호가 일치하지 않으면, 401 Unauthorized 에러 발생
    if (!userInfo || userInfo.password !== password) {
        const error = new Error('아이디 또는 비밀번호를 확인해주세요.');
        error.statusCode = 401;
        throw error;
    }

    return userInfo;
};