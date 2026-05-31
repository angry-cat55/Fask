const express = require('express');
const router = express.Router();
const kanbanController = require('../controllers/kanbanController');



// 태스크 수동 생성 API
// POST /api/workspaces/:workspaceId/tasks
router.post('/:workspaceId/tasks', kanbanController.createManualTask);

// 태스크 수정 API
// PATCH /api/tasks/:taskId
router.patch('/:taskId', kanbanController.updateTask);

module.exports = router;