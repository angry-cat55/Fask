const authModel = require('../models/authModel');

// 로그인 비즈니스 로직
exports.login = async (loginId, password) => {
    // 유저 정보 추출
    const userInfo = await authModel.findUserByLoginId(loginId);

    // 유저 정보가 없는 경우
    if (!userInfo)
        throw new Error('사용자를 찾을 수 없습니다.');
    
    // 비밀번호가 일치하지 않는 경우
    if (userInfo.password !== password)
        throw new Error('비밀번호가 일치하지 않습니다.');

    return userInfo;
};