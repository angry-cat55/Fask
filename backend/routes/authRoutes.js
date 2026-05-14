const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 로그인 요청 API
// /api/auth/login 요청을 authController의 login 컨트롤러로 전달
router.post('/login', authController.login);

module.exports = router;
