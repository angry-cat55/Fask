const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');

// 워크스페이스 삭제 요청 API
// /api/workspaces/{workspaceId}?userId=<userId> 요청을 workspaceController의 deleteWorkspace 컨트롤러로 전달
router.delete('/:workspaceId', workspaceController.deleteWorkspace);

module.exports = router;