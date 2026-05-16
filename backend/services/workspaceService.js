const workspaceModel = require('../models/workspaceModel');
const userModel = require('../models/userModel');

// 워크스페이스 생성 비즈니스 로직
exports.createWorkspace = async ({ userId, name, summary_period, auto_task_period }) => {
    // 1. 유저 존재 확인
    const user = await userModel.findUserById(userId);

    if (!user) {
        const error = new Error('존재하지 않는 사용자입니다.');
        error.statusCode = 404;
        throw error;
    }

    // 2. 워크스페이스 이름 공백 제거
    const trimmedName = name.trim();

    if (trimmedName === '') {
        const error = new Error('워크스페이스 이름을 입력해주세요.');
        error.statusCode = 400;
        throw error;
    }

    // 3. workspaces 테이블에 워크스페이스 생성
    const workspace = await workspaceModel.createWorkspace({
        name: trimmedName,
        summary_period,
        auto_task_period,
    });

    // 4. workspace_members 테이블에 생성자 추가
    await workspaceModel.addWorkspaceMember({
        workspaceId: workspace.workspaceId,
        userId,
        role: 'OWNER',
    });

    // 5. controller로 반환
    return workspace;
};

// 유저가 참가한 워크스페이스 목록 조회 비즈니스 로직
exports.getWorkspaces = async (userId) => {
    // userId가 존재하는지 확인
    const user = await userModel.findUserById(userId);

    // 사용자가 존재하지 않으면 404 Not Found 에러 발생
    if (!user) {
        const error = new Error('해당 사용자를 찾을 수 없습니다.');
        error.statusCode = 404;
        throw error;
    }

    // 유저가 참가한 워크스페이스 목록 조회
    const workspaces = await workspaceModel.findWorkspacesByUserId(userId);

    // workspaces가 null/undefined일 수 있으므로 안전하게 처리
    if (!workspaces || workspaces.length === 0) {
        return {
            isSuccess: true,
            statusCode: 200,
            data: {
                workspaces: [],
                count: 0,
            },
        };
    }

    return {
        isSuccess: true,
        statusCode: 200,
        data: {
            workspaces: workspaces,
            count: workspaces.length,
        },
    };
}

// 워크스페이스 삭제 비즈니스 로직
exports.deleteWorkspace = async (workspaceId, userId) => {
    // workspaceId로 워크스페이스 조회
    const workspace = await workspaceModel.findWorkspaceById(workspaceId);

    // 조회된 워크스페이스가 없으면, 404 Not Found 에러 발생
    if (!workspace) {
        return {
            isSuccess: false,
            message: '해당 워크스페이스를 찾을 수 없습니다.',
            statusCode: 404,
        }
    }

    // 워크스페이스의 리더 ID 조회
    const leaderId = await workspaceModel.findWorkspaceLeaderId(workspaceId);

    // 리더 ID가 없으면, 리더가 지정되지 않은 워크스페이스이므로 에러 반환
    if (!leaderId) {
        return {
            isSuccess: false,
            message: '이 워크스페이스에 할당된 리더가 없습니다.',
            statusCode: 400,
        }
    }

    // 요청 사용자(userId)와 리더 ID가 일치하는지 확인
    if (parseInt(userId) !== parseInt(leaderId)) {
        return {
            isSuccess: false,
            message: '워크스페이스를 삭제할 권한이 없습니다.',
            statusCode: 403,
        }
    }

    // 워크스페이스가 존재하고 사용자가 리더이면, 워크스페이스 삭제 수행
    await workspaceModel.deleteWorkspace(workspaceId);

    return {
        isSuccess: true,
        message: '워크스페이스가 성공적으로 삭제되었습니다.',
        statusCode: 200,
    };
};