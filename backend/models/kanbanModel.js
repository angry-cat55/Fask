const pool = require('../config/db');

// workspaceId로 칸반 보드 조회
exports.findKanbanByWorkspaceId = async (workspaceId) => {
    const sql = `
        SELECT *
        FROM kanbans
        WHERE workspace_id = ?
    `;

    const [rows] = await pool.query(sql, [workspaceId]);

    return rows[0] || null;
};

// 칸반 보드 생성
exports.createKanban = async (workspaceId) => {
    const sql = `
        INSERT INTO kanbans
        (workspace_id)
        VALUES (?)
    `;

    const [result] = await pool.query(sql, [workspaceId]);

    return {
        kanban_id: result.insertId,
        workspace_id: Number(workspaceId),
    };
};

// 태스크 수동 생성
exports.createManualTask = async ({
    kanbanId,
    managerId,
    title,
    content,
    startTime,
    endTime,
    status,
}) => {
    const sql = `
        INSERT INTO kanban_tasks
        (
            kanban_id,
            manager_id,
            title,
            content,
            start_time,
            end_time,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
        kanbanId,
        managerId,
        title,
        content,
        startTime,
        endTime,
        status,
    ]);

    return {
        taskId: result.insertId,
        title,
    };
};