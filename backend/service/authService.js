const authModel = require('../models/authModel');

exports.login = async (loginId, password) => {
    // TODO: 로그인 비즈니스 로직 구현
    return authModel.findUserByLoginId(loginId);
};