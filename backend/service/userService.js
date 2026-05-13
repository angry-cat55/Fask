const userModel = require('../models/userModel');

exports.signup = async (userData) => {
    // TODO: 회원가입 비즈니스 로직 구현
    return userModel.createUser(userData);
};

exports.checkUsername = async (loginId) => {
    // TODO: 아이디 중복 확인 비즈니스 로직 구현
    return userModel.findUserByLoginId(loginId);
};
