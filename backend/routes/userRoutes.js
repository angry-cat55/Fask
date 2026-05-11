const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 회원가입 요청 API
// /api/users 요청을 userController의 signup 컨트롤러로 전달
router.post('/', userController.signup);

// 닉네임 중복 확인 요청 API
// /api/users/check-username 요청을 userController의 checkUsername 컨트롤러로 전달
router.get('/check-username', userController.checkUsername);

module.exports = router;
