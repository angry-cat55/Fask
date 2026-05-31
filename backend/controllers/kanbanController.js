const kanbanService = require('../services/kanbanService');


// 태스크 수동 생성 컨트롤러
exports.createManualTask = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const {
            userId,
            managerId,
            title,
            content,
            startTime,
            endTime,
            status,
        } = req.body;

        if (
            !workspaceId ||
            !userId ||
            !managerId ||
            !title ||
            !content ||
            !startTime ||
            !endTime ||
            !status
        ) {
            return res.status(400).json({
                success: false,
                message: '필수 입력값이 누락되었습니다.',
            });
        }

        const task = await kanbanService.createManualTask({
            workspaceId,
            userId,
            managerId,
            title,
            content,
            startTime,
            endTime,
            status,
        });

        return res.status(201).json({
            success: true,
            message: '태스크 생성 성공',
            data: {
                taskId: task.taskId,
                title: task.title,
            },
        });

    } catch (error) {
        console.error('태스크 수동 생성 오류:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
        });
    }
};



// 태스크 수정 컨트롤러
exports.updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const {
            userId,
            kanbanId,
            title,
            content,
            startTime,
            endTime,
            status,
        } = req.body;

        if (
            !taskId ||
            !userId ||
            !kanbanId ||
            !title ||
            !content ||
            !startTime ||
            !endTime ||
            !status
        ) {
            return res.status(400).json({
                success: false,
                message: '필수 입력값이 누락되었습니다.',
            });
        }

        const result = await kanbanService.updateTask({
            taskId,
            userId,
            kanbanId,
            title,
            content,
            startTime,
            endTime,
            status,
        });

        return res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error) {
        console.error('태스크 수정 오류:', error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
        });
    }
};