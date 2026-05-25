const { getIO } = require('../config/socket');
const chatService = require('../services/chatService');

exports.sendMessage = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { userId, content } = req.body;

        // 필수 필드 확인
        if (!workspaceId || !userId || !content) {
            return res.status(400).json({
                success: false,
                message: '필수 입력값이 누락되었습니다.',
            });
        }

        // 메시지를 DB에 저장하고, 저장된 메시지 객체를 반환
        const savedMessage = await chatService.saveMessage(workspaceId, userId, content);

        // 소켓 서버 인스턴스 가져오기
        const io = getIO();

        // [방 안 멤버 타겟] 방 주파수로 채팅 내용을 전송
        io.to(`workspace_${workspaceId}`).emit('new_message', savedMessage);

        // [방 밖 멤버 타겟] 멤버별 현재 안읽음 개수를 계산해서 전송
        // 워크스페이스 멤버 ID 목록 조회
        const members = await chatService.getWorkspaceMemberIds(workspaceId);
        // 발신자 ID를 숫자로 변환
        const senderId = Number(userId);

        // 멤버별로 안읽음 개수를 계산해서 개인 룸으로 전송 (발신자 제외)
        await Promise.all(members.map(async (memberId) => {
            if (Number(memberId) !== senderId) {
                // 해당 멤버의 워크스페이스 안읽음 메시지 수 조회 (새 메세지 발생 후 기준)
                const unreadCount = await chatService.getUnreadMessageCount(workspaceId, memberId);

                // 개인 룸으로 안읽음 개수 업데이트 이벤트 전송
                io.to(`user_${memberId}`).emit('unread_update', {
                    workspaceId: workspaceId,
                    unreadCount,
                });
            }
        }));

        // REST API의 응답을 프론트에게 반환
        return res.status(201).json({
            success: true,
            message: "메시지 전송 완료",
            data: savedMessage
        });

    } catch (error) { // 새 메세지 처리 과정에서 발생한 에러 처리
        console.error('새 메세지 처리 오류:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
        });
    }
};