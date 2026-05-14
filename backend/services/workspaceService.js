const workspaceModel = require('../models/workspaceModel');

// 워크스페이스 삭제 비즈니스 로직
exports.deleteWorkspace = async (workspaceId) => {
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

    // 워크스페이스가 존재하면, 워크스페이스 삭제 수행
    await workspaceModel.deleteWorkspace(workspaceId);

    return {
        isSuccess: true,
        message: '워크스페이스가 성공적으로 삭제되었습니다.',
        statusCode: 200,
    };
};