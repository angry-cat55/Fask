const authModel = require('../models/authModel');

// 로그인 비즈니스 로직
exports.login = async (loginId, password) => {
    // 유저 정보 추출
    const userInfo = await authModel.findUserByLoginId(loginId);

    // 유저 정보가 없거나 비밀번호가 일치하지 않으면, 401 Unauthorized 에러 발생
    if (!userInfo || userInfo.password !== password) {
        return {
            isSuccess: false,
            message: '아이디 혹은 비밀번호를 확인해주세요.',
            statusCode: 401,
        }
    }

    // 로그인 성공 시 유저 정보 반환
    return {
        isSuccess: true,
        data: {
            userId: userInfo.userId,
            nickname: userInfo.nickname,
            loginId: userInfo.loginId,
            email: userInfo.email,
            createdAt: userInfo.createdAt,
        },
        statusCode: 200,
    };
};