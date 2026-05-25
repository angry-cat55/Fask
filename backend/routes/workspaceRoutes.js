const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const chatController = require('../controllers/chatController');

// 초대 수신함 조회
// GET /api/workspaces/inbox?userId=1
router.get('/inbox', workspaceController.getInvitationInbox);

//워크스페이스 생성 요청 API
// /api/workspaces 요청을 workspaceController의 createWorkspace 컨트롤러로 전달
router.post('/', workspaceController.createWorkspace);

// 워크스페이스 수정 요청 API
// /api/workspaces/{workspaceId} 요청을 workspaceController의 updateWorkspace 컨트롤러로 전달
router.patch('/:workspaceId', workspaceController.updateWorkspace);

// 유저의 참가한 워크스페이스 목록 조회 요청 API
// /api/workspaces?userId=<userId> 요청을 workspaceController의 getWorkspaces 컨트롤러로 전달
router.get('/', workspaceController.getWorkspaces);


// 워크스페이스 삭제 요청 API
// /api/workspaces/{workspaceId}?userId=<userId> 요청을 workspaceController의 deleteWorkspace 컨트롤러로 전달
router.delete('/:workspaceId', workspaceController.deleteWorkspace);

// 워크스페이스 멤버 초대 요청 API
// /api/workspaces/{workspaceId}/invitations 요청을 workspaceController의 inviteMembers 컨트롤러로 전달
router.post('/:workspaceId/invitations', workspaceController.inviteMember);

<<<<<<< HEAD
// 워크스페이스에서 채팅 메세지 전송 PAI
// /api/workspaces/{workspaceId}/messages 요청을 chatController의 sendMessage 컨트롤러로 전달
router.post('/:workspaceId/messages', chatController.sendMessage);

module.exports = router;
=======
// 멤버 강퇴 요청 API
// POST /api/workspaces/:workspaceId/members/:userId
router.post('/:workspaceId/members/:userId', workspaceController.kickMember);

// 워크스페이스 방장 권한 위임 API
// PATCH /api/workspaces/:workspaceId/owner
router.patch('/:workspaceId/owner', workspaceController.transferWorkspaceLeader);

module.exports = router;
>>>>>>> 707ebe4a6b41fb830ca94ebf1efd05d4b1ad8975
