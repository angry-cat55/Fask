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

// 워크스페이스에서 채팅 메세지 전송 PAI
// /api/workspaces/{workspaceId}/messages 요청을 chatController의 sendMessage 컨트롤러로 전달
router.post('/:workspaceId/messages', chatController.sendMessage);

// 멤버 강퇴 요청 API
// POST /api/workspaces/:workspaceId/members/:userId
router.post('/:workspaceId/members/:userId', workspaceController.kickMember);

// 초대 수락/거절 API
// PATCH /api/workspaces/:workspaceId/invitations
router.patch('/:workspaceId/invitations', workspaceController.respondInvitation);

// 워크스페이스 방장 권한 위임 API
// PATCH /api/workspaces/:workspaceId/owner
router.patch('/:workspaceId/owner', workspaceController.transferWorkspaceLeader);

// 워크스페이스 내의 채팅 내역 조회 API
// GET /api/workspaces/:workspaceId/messages?userId=<userId>&cursor=<cursor>&limit=<limit>&direction=<direction>
/*
 * cursor: 불러올 메세지들의 기준이 되는 메세지 ID
 * - 워크스페이스에 입장할 때는 null (마지막으로 읽은 메세지 ID를 기준으로 하기 때문에)
 * limit: 한번에 불러올 메세지 수 (기본값: 30)
 * direction: 불러올 메세지의 방향 (newer: cursor 이후의 메세지, older: cursor 이전의 메세지, 기본값: newer)
 */
router.get('/:workspaceId/messages', chatController.getChatMessages);

// 워크스페이스 멤버 목록 조회 API
// GET /api/workspaces/:workspaceId/members?userId=1
router.get('/:workspaceId/members', workspaceController.getWorkspaceMembers);

// 워크스페이스의 대화 내용 수동 요약 API
// POST /api/workspaces/:workspaceId/messages/summary
router.post('/:workspaceId/messages/summary', workspaceController.summarizeChatMessages);

// 확인한 마지막 메세지 ID 갱신 API
// PATCH /api/workspaces/:workspaceId/read
router.patch('/:workspaceId/read', workspaceController.updateLastReadMessage);

module.exports = router;