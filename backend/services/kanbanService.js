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

// 칸반 보드 조회 비즈니스 로직
exports.getKanbanTasks = async ({ workspaceId, userId }) => {
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

    // 3. 해당 워크스페이스의 칸반 보드 조회
    const kanban = await kanbanModel.findKanbanByWorkspaceId(workspaceId);

    if (!kanban) {
        const error = new Error('해당 워크스페이스의 칸반 보드를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 4. 칸반 보드에 속한 태스크 목록 조회
    const tasks = await kanbanModel.findTasksByKanbanId(kanban.kanban_id);

    return tasks;
};

// 태스크 수정 비즈니스 로직
exports.updateTask = async ({
    taskId,
    userId,
    kanbanId,
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

    // 2. 태스크 존재 확인
    const task = await kanbanModel.findTaskById(taskId);

    if (!task) {
        const error = new Error('해당 태스크를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 3. 요청한 kanbanId와 태스크의 kanban_id가 일치하는지 확인
    if (Number(task.kanban_id) !== Number(kanbanId)) {
        const error = new Error('태스크가 해당 칸반 보드에 속해있지 않습니다.');
        error.statusCode = 400;
        throw error;
    }

    // 4. 칸반 보드 존재 확인
    const kanban = await kanbanModel.findKanbanById(kanbanId);

    if (!kanban) {
        const error = new Error('해당 칸반 보드를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 5. 요청한 유저가 해당 워크스페이스 멤버인지 확인
    const member = await workspaceModel.findWorkspaceMember({
        workspaceId: kanban.workspace_id,
        userId,
    });

    if (!member) {
        const error = new Error('해당 워크스페이스에 참여한 사용자가 아닙니다.');
        error.statusCode = 403;
        throw error;
    }

    // 6. 제목 공백 검증
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (trimmedTitle === '') {
        const error = new Error('태스크 제목을 입력해주세요.');
        error.statusCode = 400;
        throw error;
    }

    // 7. 태스크 수정
    await kanbanModel.updateTask({
        taskId,
        title: trimmedTitle,
        content: trimmedContent,
        startTime,
        endTime,
        status,
    });

    return {
        message: '태스크 수정 성공',
    };
};

// 태스크 삭제 비즈니스 로직
exports.deleteTask = async ({ taskId, userId }) => {
    // 1. 태스크 존재 확인
    const task = await kanbanModel.findTaskById(taskId);

    if (!task) {
        const error = new Error('해당 태스크를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 2. 태스크가 속한 칸반 보드 조회
    const kanban = await kanbanModel.findKanbanById(task.kanban_id);

    if (!kanban) {
        const error = new Error('해당 칸반 보드를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 3. 요청한 유저가 해당 워크스페이스 멤버인지 확인
    const member = await workspaceModel.findWorkspaceMember({
        workspaceId: kanban.workspace_id,
        userId,
    });

    if (!member) {
        const error = new Error('해당 워크스페이스에 참여한 사용자가 아닙니다.');
        error.statusCode = 403;
        throw error;
    }

    // 4. 태스크 삭제
    await kanbanModel.deleteTaskById(taskId);
};