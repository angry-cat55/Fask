const kanbanModel = require('../models/kanbanModel');
const workspaceModel = require('../models/workspaceModel');

// 태스크 수동 생성 비즈니스 로직
exports.createManualTask = async ({
    workspaceId,
    userId,
    managerId,
    title,
    content,
    startTime,
    endTime,
    status,
}) => {
    // 1. status 값 검증
    const allowedStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];

    if (!allowedStatuses.includes(status)) {
        const error = new Error('status는 TODO, IN_PROGRESS, DONE 중 하나여야 합니다.');
        error.statusCode = 400;
        throw error;
    }

    // 2. 워크스페이스 존재 확인
    const workspace = await workspaceModel.findWorkspaceById(workspaceId);

    if (!workspace) {
        const error = new Error('해당 워크스페이스를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 3. 요청자가 해당 워크스페이스 멤버인지 확인
    const requestMember = await workspaceModel.findWorkspaceMember({
        workspaceId,
        userId,
    });

    if (!requestMember) {
        const error = new Error('해당 워크스페이스에 참여한 사용자가 아닙니다.');
        error.statusCode = 403;
        throw error;
    }

    // 4. 담당자가 해당 워크스페이스 멤버인지 확인
    const managerMember = await workspaceModel.findWorkspaceMember({
        workspaceId,
        userId: managerId,
    });

    if (!managerMember) {
        const error = new Error('담당자가 해당 워크스페이스 멤버가 아닙니다.');
        error.statusCode = 400;
        throw error;
    }

    // 5. 워크스페이스에 연결된 칸반 보드 조회
    let kanban = await kanbanModel.findKanbanByWorkspaceId(workspaceId);

    // 6. 칸반 보드가 없으면 생성
    if (!kanban) {
        kanban = await kanbanModel.createKanban(workspaceId);
    }

    // 7. 태스크 생성
    const task = await kanbanModel.createManualTask({
        kanbanId: kanban.kanban_id,
        managerId,
        title: title.trim(),
        content: content.trim(),
        startTime,
        endTime,
        status,
    });

    return task;
};