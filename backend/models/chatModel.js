const pool = require('../config/db');

// 새 메세지 저장
exports.saveMessage = async (workspaceId, userId, content) => {
    const sql = `
        INSERT INTO chat_messages (workspace_id, user_id, content)
        VALUES (?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [workspaceId, userId, content]);
    const messageId = result.insertId;

    // messageId, workspaceId, userId, nickname, content, sendAt이 포함된 메세지 객체 반환
    const [rows] = await pool.execute(`
        SELECT m.message_id AS messageId, m.workspace_id AS workspaceId, m.user_id AS userId, u.nickname, m.content, m.send_at AS sendAt
        FROM chat_messages m
        JOIN users u ON m.user_id = u.user_id
        WHERE m.message_id = ?
    `, [messageId]);

    return rows[0];
};

// 특정 멤버의 워크스페이스 안읽음 메시지 수 조회
exports.getUnreadMessageCount = async ({ workspaceId, userId }) => {
    const sql = `
        SELECT COALESCE(COUNT(*), 0) AS unreadCount
        FROM chat_messages cm
        JOIN workspace_members wm
            ON wm.workspace_id = cm.workspace_id
           AND wm.user_id = ?
        WHERE cm.workspace_id = ?
          AND cm.message_id > COALESCE(wm.last_read_message_id, 0)
    `;

    const [rows] = await pool.query(sql, [userId, workspaceId]);
    return rows[0]?.unreadCount || 0;
};