const workspaceService = require('../services/workspaceService');

// 워크스페이스 생성 컨트롤러
exports.createWorkspace = async (req, res) => {
    try {
        const { userId, name, summary_period, auto_task_period } = req.body;

        // 필수 필드 확인
        if (!userId || !name || !summary_period || !auto_task_period) {
            return res.status(400).json({
                success: false,
                message: '필수 입력값이 누락되었습니다.',
            });
        }

        // service로 데이터 전달
        const workspace = await workspaceService.createWorkspace({
            userId,
            name,
            summary_period,
            auto_task_period,
        });

        // 성공 응답
        return res.status(201).json({
            success: true,
            message: '워크스페이스 생성 성공',
            data: {
                workspaceId: workspace.workspaceId,
                name: workspace.name,
            },
        });

    } catch (error) {
        console.error('워크스페이스 생성 오류:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
        });
    }
};

// 워크스페이스 수정 컨트롤러
exports.updateWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { userId, name, summary_period, auto_task_period } = req.body;

        // 필수 필드 확인
        if (!workspaceId || !userId || !name || !summary_period || !auto_task_period) {
            return res.status(400).json({
                success: false,
                message: '필수 입력값이 누락되었습니다.',
            });
        }

        // service로 데이터 전달
        const updatedWorkspace = await workspaceService.updateWorkspace({
            workspaceId,
            userId,
            name,
            summary_period,
            auto_task_period,
        });

        return res.status(200).json({
            success: true,
            message: '워크스페이스 수정 성공',
            data: {
                workspaceId: updatedWorkspace.workspaceId,
                name: updatedWorkspace.name,
            },
        });

    } catch (error) {
        console.error('워크스페이스 수정 오류:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
        });
    }
};

// 유저의 참가한 워크스페이스 목록 조회 컨트롤러
exports.getWorkspaces = async (req, res) => {
    // 클라이언트로부터 전달받은 userId 추출
    const { userId } = req.query;

    // userId가 전달되었는지 확인
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: '쿼리 파라미터에 userId가 누락되었습니다.',
        });
    }

    try {
        // 유저의 참가한 워크스페이스 목록 조회 비즈니스 로직을 수행
        const result = await workspaceService.getWorkspaces(userId);

        // 워크스페이스 목록 조회 로직에 따른 응답과 함께 결과 반환
        return res.status(result.statusCode).json({
            success: result.isSuccess,
            data: result.data,
        });
    } catch (error) { // 워크스페이스 목록 조회 과정에서 발생한 에러 처리
        console.error('워크스페이스 목록 조회 오류:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 내부 오류가 발생하였습니다.',
        });
    }
};

// 워크스페이스 삭제 컨트롤러
exports.deleteWorkspace = async (req, res) => {
    try {
        // URL 경로에서 workspaceId 추출
        const { workspaceId } = req.params;

        // 쿼리 파라미터에서 userId 추출
        const { userId } = req.query;

        // workspaceId가 전달되었는지 확인
        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                message: '경로 파라미터에 workspaceId가 누락되었습니다.',
            });
        }

        // userId가 전달되었는지 확인
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: '쿼리 파라미터에 userId가 누락되었습니다.',
            });
        }

        // 워크스페이스 삭제 비즈니스 로직을 수행하여 워크스페이스 삭제
        const result = await workspaceService.deleteWorkspace(workspaceId, userId);

        // 워크스페이스 삭제 로직에 따른 응답과 함께 결과 반환
        return res.status(result.statusCode).json({
            success: result.isSuccess,
            message: result.message,
        });
    } catch (error) { // 워크스페이스 삭제 과정에서 발생한 에러 처리
        console.error('워크스페이스 삭제 오류:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
        });
    }
}