const chatModel = require('../models/chatModel');
const workspaceModel = require('../models/workspaceModel');

// 새 메세지 저장 비즈니스 로직
exports.saveMessage = async (workspaceId, userId, content) => {
    // 워크스페이스 ID가 유효한지 확인
    const workspace = await workspaceModel.findWorkspaceById(workspaceId);
    if (!workspace) {
        const error = new Error('해당 워크스페이스를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // messageId, workspaceId, userId, nickname, content, sendAt이 포함된 메세지 객체 반환
    return await chatModel.saveMessage(workspaceId, userId, content);
};

// 워크스페이스 멤버 ID 목록 조회 (방 밖 알림용) 비즈니스 로직
exports.getWorkspaceMemberIds = async (workspaceId) => {
    // 워크스페이스 ID가 유효한지 확인
    const workspace = await workspaceModel.findWorkspaceById(workspaceId);
    if (!workspace) {
        const error = new Error('해당 워크스페이스를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 해당 워크스페이스의 멤버 ID 목록을 반환
    const memberIds = await workspaceModel.getWorkspaceMemberIds(workspaceId);
    
    return memberIds;
};

// 특정 멤버의 워크스페이스 안읽음 메시지 수 조회 비즈니스 로직
exports.getUnreadMessageCount = async (workspaceId, userId) => {
    return await chatModel.getUnreadMessageCount({ workspaceId, userId });
};