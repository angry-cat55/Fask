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

// 워크스페이스 내의 채팅 내역 조회 비즈니스 로직
exports.getChatMessages = async (workspaceId, userId, cursor, limit, direction) => {

    // limit 정수로 변환
    if (limit) limit = Number(limit);

    // 워크스페이스 ID가 유효한지 확인
    const workspace = await workspaceModel.findWorkspaceById(workspaceId);
    if (!workspace) {
        const error = new Error('해당 워크스페이스를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 해당 유저가 워크스페이스의 멤버인지 확인
    const isMember = await workspaceModel.findWorkspaceMember({ workspaceId, userId });
    if (!isMember) {
        const error = new Error('조회 요청 유저가 해당 워크스페이스의 멤버가 아닙니다.');
        error.statusCode = 403;
        throw error;
    }

    // 채팅 메시지 조회
    let messages;
    let lastReadMessageId;

    // 1. cursor가 null인 경우 (워크스페이스에 입장할 때)
    // 유저가 마지막으로 읽은 메세지 ID를 기준으로,
    // 이전 메세지 최대 10개, 이후 메세지 최대 20개를 불러오도록 구현 (마지막 메세지 포함 최대 31개)
    if (!cursor) {
        ({ lastReadMessageId, messages } = await chatModel.getMessagesAroundLastRead({
            workspaceId,
            userId
        }));
    }

    // 2. cursor가 null이 아닌 경우 (방 안에서 추가로 메세지를 불러올 때)
    else {
        // 2-1. direction이 newer인 경우: cursor 이후의 메세지 limit개 불러오기
        if (direction === 'newer') {
            messages = await chatModel.getMessagesAfterCursor({
                workspaceId,
                userId,
                cursor,
                limit
            });
        }
        // 2-2. direction이 older인 경우: cursor 이전의 메세지 limit개 불러오기
        else {
            messages = await chatModel.getMessagesBeforeCursor({
                workspaceId,
                userId,
                cursor,
                limit
            });
        }
        lastReadMessageId = null;
    }

    return { lastReadMessageId, messages };
}