const pool = require('../config/db');

// 워크스페이스의 최신 요약 조회
exports.getLatestSummary = async (workspaceId) => {
    const sql = `
        SELECT summary_id AS summaryId, workspace_id AS workspaceId, summary_content AS summaryContent, start_message_id AS startMessageId, end_message_id AS endMessageId, created_at AS createdAt
        FROM ai_summaries
        WHERE workspace_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    `;

    const [rows] = await pool.query(sql, [workspaceId]);
    return rows[0];
};

// 워크스페이스에 새 요약 저장
exports.saveSummary = async ({ workspaceId, summaryContent, startMessageId, endMessageId }) => {
    const createdAt = new Date();

    const sql = `
        INSERT INTO ai_summaries (workspace_id, summary_content, start_message_id, end_message_id, created_at)
        VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [workspaceId, summaryContent, startMessageId, endMessageId, createdAt]);
    const summaryId = result.insertId;

    return { summaryId, workspaceId, summaryContent, startMessageId, endMessageId, createdAt };
};