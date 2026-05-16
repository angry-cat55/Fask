const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');

// 유저의 참가한 워크스페이스 목록 조회 요청 API
// /api/workspaces?userId=<userId> 요청을 workspaceController의 getWorkspaces 컨트롤러로 전달
router.get('/', workspaceController.getWorkspaces);

// 워크스페이스 삭제 요청 API
// /api/workspaces/{workspaceId}?userId=<userId> 요청을 workspaceController의 deleteWorkspace 컨트롤러로 전달
router.delete('/:workspaceId', workspaceController.deleteWorkspace);

module.exports = router;