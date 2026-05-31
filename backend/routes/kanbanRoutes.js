const express = require('express');
const router = express.Router();
const kanbanController = require('../controllers/kanbanController');



// 태스크 수동 생성 API
// POST /api/workspaces/:workspaceId/tasks
router.post('/:workspaceId/tasks', kanbanController.createManualTask);

// 칸반 보드 조회 API
// GET /api/workspaces/:workspaceId/kanban?userId=1
router.get('/:workspaceId/kanban', kanbanController.getKanbanTasks);

// 태스크 수정 API
// PATCH /api/tasks/:taskId
router.patch('/:taskId', kanbanController.updateTask);

// 태스크 삭제 API
// DELETE /api/tasks/:taskId
router.delete('/:taskId', kanbanController.deleteTask);

module.exports = router;