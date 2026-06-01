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
        LEFT JOIN users u ON m.user_id = u.user_id
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

// 워크스페이스 내의 채팅 내역 조회 - 유저의 마지막으로 읽은 메세지 ID 기준, 이전 메세지 10개, 이후 메세지 20개 조회
exports.getMessagesAroundLastRead = async ({ workspaceId, userId }) => {
    // 기준: 이전 메시지 최대 10개, 이후 메시지 최대 20개
    const beforeLimit = 10;
    const afterLimit = 20;

    // 사용자의 last_read_message_id 조회
    const [memberRows] = await pool.query(
        `SELECT COALESCE(last_read_message_id, 0) AS lastRead FROM workspace_members WHERE workspace_id = ? AND user_id = ?`,
        [workspaceId, userId]
    );
    const lastRead = memberRows[0]?.lastRead || 0;

    // 이전 메시지 (<= lastRead) - 최신순으로 가져와 나중에 역순으로 정렬 (마지막으로 읽은 메시지 포함)
    const [beforeRows] = await pool.query(`
                        SELECT m.message_id AS messageId, COALESCE(u.nickname, '알 수 없음') AS nickname, m.content, m.send_at AS sendAt
                        FROM chat_messages m
                        LEFT JOIN users u ON m.user_id = u.user_id
            WHERE m.workspace_id = ?
              AND m.message_id <= ?
            ORDER BY m.send_at DESC
            LIMIT ?
        `, [workspaceId, lastRead, beforeLimit]);

    // 이후 메시지 (> lastRead) - 오래된 순으로 가져옴
    const [afterRows] = await pool.query(`
                        SELECT m.message_id AS messageId, COALESCE(u.nickname, '알 수 없음') AS nickname, m.content, m.send_at AS sendAt
                        FROM chat_messages m
                        LEFT JOIN users u ON m.user_id = u.user_id
            WHERE m.workspace_id = ?
              AND m.message_id > ?
            ORDER BY m.send_at ASC
            LIMIT ?
        `, [workspaceId, lastRead, afterLimit]);

    // 이전 메시지는 DESC로 왔으므로 오름차순으로 바꿔 결합
    const beforeChron = beforeRows.reverse();
    const combined = [...beforeChron, ...afterRows];

    // 사용자가 마지막으로 읽은 메시지 ID (<여기까지 읽음> 경계 표시용)
    // DB상 마지막으로 읽은 메세지 이후의 메시지가 있으면 경계 표시를 위해 `lastRead`를 반환하고,
    // 이후 메시지가 없으면 `null`을 반환한다.
    const lastReadMessageId = afterRows.length === 0 ? null : lastRead;

    return { lastReadMessageId, messages: combined };
};

// 워크스페이스 내의 채팅 내역 조회 - cursor 이후의 메세지 조회
exports.getMessagesAfterCursor = async ({ workspaceId, userId, cursor, limit }) => {
    const sql = `
            SELECT m.message_id AS messageId, COALESCE(u.nickname, '알 수 없음') AS nickname, m.content, m.send_at AS sendAt
            FROM chat_messages m
            LEFT JOIN users u ON m.user_id = u.user_id
            WHERE m.workspace_id = ?
                AND m.message_id > ?
            ORDER BY m.send_at ASC
            LIMIT ?
        `;

    const [rows] = await pool.query(sql, [workspaceId, cursor, limit]);
    return rows;
};

// 워크스페이스 내의 채팅 내역 조회 - cursor 이전의 메세지 조회
exports.getMessagesBeforeCursor = async ({ workspaceId, userId, cursor, limit }) => {
    const sql = `
            SELECT m.message_id AS messageId, COALESCE(u.nickname, '알 수 없음') AS nickname, m.content, m.send_at AS sendAt
            FROM chat_messages m
            LEFT JOIN users u ON m.user_id = u.user_id
            WHERE m.workspace_id = ?
                AND m.message_id < ?
            ORDER BY m.send_at ASC
            LIMIT ?
        `;

    const [rows] = await pool.query(sql, [workspaceId, cursor, limit]);
    return rows;
};

// 특정 워크스페이스의 마지막 요약 이후에 생성된 새 메시지 조회
exports.getNewMessagesAfterSummary = async (workspaceId) => {
    const sql = `
        SELECT m.message_id AS messageId, COALESCE(u.login_id, '알 수 없음') AS loginId, COALESCE(u.nickname, '알 수 없음') AS nickname, m.content, m.send_at AS sendAt
        FROM chat_messages m
        LEFT JOIN users u ON m.user_id = u.user_id
        WHERE m.workspace_id = ?
          AND m.message_id > COALESCE((SELECT MAX(end_message_id) FROM ai_summaries WHERE workspace_id = ?), 0)
        ORDER BY m.send_at ASC
    `;

    const [rows] = await pool.query(sql, [workspaceId, workspaceId]);
    return rows;
};