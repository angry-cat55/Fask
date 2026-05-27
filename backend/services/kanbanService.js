const kanbanModel = require('../models/kanbanModel');
const workspaceModel = require('../models/workspaceModel');

// 태스크 수동 생성 비즈니스 로직
exports.createManualTask = async ({ workspaceId, userId }) => {
    // 1. 워크스페이스 존재 확인
    const workspace = await workspaceModel.findWorkspaceById(workspaceId);

    if (!workspace) {
        const error = new Error('해당 워크스페이스를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 2. 요청한 유저가 해당 워크스페이스 멤버인지 확인
    const member = await workspaceModel.findWorkspaceMember({
        workspaceId,
        userId,
    });

    if (!member) {
        const error = new Error('해당 워크스페이스에 참여한 사용자가 아닙니다.');
        error.statusCode = 403;
        throw error;
    }

    // 3. 워크스페이스에 연결된 칸반 보드 조회
    let kanban = await kanbanModel.findKanbanByWorkspaceId(workspaceId);

    // 4. 칸반 보드가 없으면 생성
    if (!kanban) {
        kanban = await kanbanModel.createKanban(workspaceId);
    }

    // 5. 태스크 생성
    await kanbanModel.createManualTask({
        kanbanId: kanban.kanban_id,
        managerId: userId,
    });

    return {
        message: '태스크 수동 생성 성공',
    };

};