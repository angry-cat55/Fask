const workspaceService = require('../services/workspaceService');
const summaryService = require('../services/summaryService');

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

// 워크스페이스 멤버 초대 컨트롤러
exports.inviteMember = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { userId, invitedLoginId } = req.body;

        if (!workspaceId || !userId || !invitedLoginId) {
            return res.status(400).json({
                success: false,
                message: '필수 입력값이 누락되었습니다.',
            });
        }

        await workspaceService.inviteMember({
            workspaceId,
            userId,
            invitedLoginId,
        });

        return res.status(200).json({
            success: true,
            message: '멤버 초대 성공',
        });

    } catch (error) {
        console.error('멤버 초대 오류:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
        });
    }
};

// 초대 수신함 조회 컨트롤러
exports.getInvitationInbox = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId가 누락되었습니다.',
            });
        }

        const invitations = await workspaceService.getInvitationInbox(userId);

        return res.status(200).json({
            success: true,
            message: '초대 수신함 조회 성공',
            data: invitations,
        });

    } catch (error) {
        console.error('초대 수신함 조회 오류:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
        });
    }
};

// 초대 수락/거절 컨트롤러
exports.respondInvitation = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { userId, status } = req.body;

        if (!workspaceId || !userId || !status) {
            return res.status(400).json({
                success: false,
                message: '필수 입력값이 누락되었습니다.',
            });
        }

        const result = await workspaceService.respondInvitation({
            workspaceId,
            userId,
            status,
        });

        return res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error) {
        console.error('초대 응답 오류:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
        });
    }
};

// 워크스페이스 멤버 강퇴 컨트롤러
exports.kickMember = async (req, res) => {
    try {
        const { workspaceId, userId: targetUserId } = req.params;
        const { userId } = req.body; // 강퇴 요청자 ID

        if (!workspaceId || !targetUserId || !userId) {
            return res.status(400).json({
                success: false,
                message: '필수 입력값이 누락되었습니다.',
            });
        }

    const result =await workspaceService.kickMember({
            workspaceId,
            requestUserId: userId,
            targetUserId,
        });

    return res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error) {
        console.error('멤버 강퇴 오류:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
        });
    }
};

// 워크스페이스 방장 권한 위임 컨트롤러
exports.transferWorkspaceLeader = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { userId, newOwnerId } = req.body;

        if (!workspaceId || !userId || !newOwnerId) {
            return res.status(400).json({
                success: false,
                message: '필수 입력값이 누락되었습니다.',
            });
        }

        const result = await workspaceService.transferWorkspaceLeader({
            workspaceId,
            currentLeaderId: userId,
            newLeaderId: newOwnerId,
        });

        return res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error) {
        console.error('방장 권한 위임 오류:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
        });
    }
};

// 워크스페이스 멤버 목록 조회 컨트롤러
exports.getWorkspaceMembers = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { userId } = req.query;

        if (!workspaceId || !userId) {
            return res.status(400).json({
                success: false,
                message: '필수 입력값이 누락되었습니다.',
            });
        }

        const members = await workspaceService.getWorkspaceMembers({
            workspaceId,
            userId,
        });

        return res.status(200).json({
            success: true,
            message: '워크스페이스 멤버 목록 조회 성공',
            data: {
                count: members.length,
                members,
            },
        });

    } catch (error) {
        console.error('워크스페이스 멤버 목록 조회 오류:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
        });
    }
};

// 워크스페이스의 대화 내용 수동 요약 컨트롤러
exports.summarizeChatMessages = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { userId } = req.body;

        // 필수 입력값 확인
        if (!workspaceId || !userId) {
            return res.status(400).json({
                success: false,
                message: '필수 입력값이 누락되었습니다.',
            });
        }

        // 수동 요약 실행
        // 과정: summaryService -> aiService -> summaryModel, chatModel -> DB 저장 -> 결과 반환
        const result = await summaryService.executeWorkspaceSummary(workspaceId, userId);
        
        return res.status(result.statusCode).json({
            success: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        console.error('대화 내용 수동 요약 중 오류:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
        });
    }
};

// 워크스페이스의 대화 내용 요약 조회 컨트롤러
exports.getChatSummary = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { userId } = req.query;

        // 필수 입력값 확인
        if (!workspaceId || !userId) {
            return res.status(400).json({
                success: false,
                message: '필수 입력값이 누락되었습니다.',
            });
        }

        // 요약 조회 실행
        const result = await summaryService.getWorkspaceSummary(workspaceId, userId);

        return res.status(result.statusCode).json({
            success: true,
            message: result.message,
            data: result.data,
        });

    } catch (error) {
        console.error('대화 내용 요약 조회 중 오류:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
        });
    }
};

// 확인한 마지막 메세지 ID 갱신 컨트롤러
exports.updateLastReadMessage = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { userId, lastReadMessageId } = req.body;

        if (!workspaceId || !userId || !lastReadMessageId) {
            return res.status(400).json({
                success: false,
                message: '필수 입력값이 누락되었습니다.',
            });
        }

        const result = await workspaceService.updateLastReadMessage({
            workspaceId,
            userId,
            lastReadMessageId,
        });

        return res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error) {
        console.error('마지막 읽은 메세지 ID 갱신 오류:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
        });
    }
};