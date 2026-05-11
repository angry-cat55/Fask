const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// /api/users 요청을 userController의 signup 컨트롤러로 전달
router.post('/', userController.signup);

module.exports = router;
