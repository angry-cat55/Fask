const workspaceModel = require('../models/workspaceModel');

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