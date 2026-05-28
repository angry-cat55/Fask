const pool = require('../config/db');

// workspaces 테이블에 워크스페이스 생성
exports.createWorkspace = async ({ name, summary_period, auto_task_period }) => {
    const sql = `
        INSERT INTO workspaces
        (name, summary_period, auto_task_period)
        VALUES (?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
        name,
        summary_period,
        auto_task_period,
    ]);

    return {
        workspaceId: result.insertId,
        name,
    };
};

// workspace_members 테이블에 생성자 추가
exports.addWorkspaceMember = async ({ workspaceId, userId, role }) => {
    const sql = `
        INSERT INTO workspace_members
        (workspace_id, user_id, role)
        VALUES (?, ?, ?)
    `;

    await pool.query(sql, [
        workspaceId,
        userId,
        role,
    ]);
};

// workspaceId와 userId로 워크스페이스 멤버 조회
exports.findWorkspaceMember = async ({ workspaceId, userId }) => {
    const sql = `
        SELECT *
        FROM workspace_members
        WHERE workspace_id = ?
        AND user_id = ?
    `;

    const [rows] = await pool.query(sql, [
        workspaceId,
        userId,
    ]);

    return rows[0] || null;
};

// 워크스페이스 수정
exports.updateWorkspace = async ({ workspaceId, name, summary_period, auto_task_period }) => {
    const sql = `
        UPDATE workspaces
        SET name = ?,
            summary_period = ?,
            auto_task_period = ?
        WHERE workspace_id = ?
    `;

    await pool.query(sql, [
        name,
        summary_period,
        auto_task_period,
        workspaceId,
    ]);
};

// workspaceId로 워크스페이스 조회
exports.findWorkspaceById = async (workspaceId) => {
    // SQL 쿼리: workspaces 테이블에서 workspace_id에 해당하는 워크스페이스 정보 조회
    const sql = 'SELECT * FROM workspaces WHERE workspace_id = ?';

    // SQL 쿼리를 실행하여 workspaceId에 해당하는 워크스페이스 정보를 조회
    const [rows] = await pool.query(sql, [workspaceId]);

    // 조회된 워크스페이스 정보가 있으면 첫 번째 행을 반환하고, 없으면 null 반환
    return rows[0] || null;
};

// workspaceId로 워크스페이스 삭제
exports.deleteWorkspace = async (workspaceId) => {
    // SQL 쿼리: workspaces 테이블에서 workspace_id에 해당하는 워크스페이스 삭제
    const sql = 'DELETE FROM workspaces WHERE workspace_id = ?';

    // SQL 쿼리를 실행하여 workspaceId에 해당하는 워크스페이스를 삭제
    await pool.query(sql, [workspaceId]);
};

// workspaceId로 워크스페이스의 리더(LEADER) ID 조회
exports.findWorkspaceLeaderId = async (workspaceId) => {
    // SQL 쿼리: workspace_members 테이블에서 LEADER 역할을 하는 사용자 ID 조회
    const sql = `
        SELECT user_id
        FROM workspace_members
        WHERE workspace_id = ? AND role = 'LEADER'
        LIMIT 1
    `;

    // SQL 쿼리를 실행하여 workspaceId에 해당하는 리더 ID를 조회
    const [rows] = await pool.query(sql, [workspaceId]);

    // 조회된 리더 정보가 있으면 첫 번째 행의 user_id를 반환하고, 없으면 null 반환
    return rows[0]?.user_id || null;
};

// 유저가 참가한 워크스페이스 목록 조회
exports.findWorkspacesByUserId = async (userId) => {
    // SQL 쿼리: 워크스페이스, 방장 정보, 읽지 않은 메시지 수를 함께 조회
    const sql = `
        SELECT 
            w.workspace_id AS workspaceId,
            w.name,
            u.nickname AS masterNickname,
            COALESCE((
                SELECT COUNT(*)
                FROM chat_messages cm
                WHERE cm.workspace_id = w.workspace_id
                AND cm.message_id > COALESCE(wm_user.last_read_message_id, 0)
            ), 0) AS unreadCount
        FROM workspace_members wm_user
        JOIN workspaces w ON wm_user.workspace_id = w.workspace_id
        JOIN workspace_members wm_leader ON w.workspace_id = wm_leader.workspace_id
        JOIN users u ON wm_leader.user_id = u.user_id
        WHERE wm_user.user_id = ?
        AND wm_leader.role = 'LEADER'
    `;

    // SQL 쿼리를 실행하여 userId에 해당하는 워크스페이스 목록을 조회
    const [rows] = await pool.execute(sql, [userId]);

    // 조회된 워크스페이스 목록이 있으면 반환하고, 없으면 빈 배열 반환
    return rows && rows.length > 0 ? rows : [];
}

// 특정 워크스페이스에 해당 유저의 초대가 존재하는지 조회
exports.findInvitation = async ({ workspaceId, userId }) => {
    const sql = `
        SELECT *
        FROM invitations
        WHERE workspace_id = ?
        AND user_id = ?
    `;

    const [rows] = await pool.query(sql, [
        workspaceId,
        userId,
    ]);

    return rows[0] || null;
};

// 워크스페이스 멤버 목록 조회
exports.findWorkspaceMembers = async (workspaceId) => {
    const sql = `
        SELECT
            u.user_id AS userId,
            u.login_id AS loginId,
            u.nickname AS nickname,
            wm.role AS role
        FROM workspace_members wm
        JOIN users u
            ON wm.user_id = u.user_id
        WHERE wm.workspace_id = ?
        ORDER BY
            CASE
                WHEN wm.role = 'LEADER' THEN 0
                ELSE 1
            END,
            u.nickname ASC
    `;

    const [rows] = await pool.query(sql, [workspaceId]);

    return rows;
};

// 워크스페이스 초대 생성
exports.createInvitation = async ({ workspaceId, userId, status }) => {
    const sql = `
        INSERT INTO invitations
        (workspace_id, user_id, status)
        VALUES (?, ?, ?)
    `;

    await pool.query(sql, [
        workspaceId,
        userId,
        status,
    ]);
};      

// 초대 수신함 조회
exports.findInvitationsByUserId = async (userId) => {
    const sql = `
        SELECT
            w.workspace_id AS workspaceId,
            w.name AS workspaceName,
            u.nickname AS leaderNickname,
            i.created_at AS invitedAt
        FROM invitations i
        JOIN workspaces w
            ON i.workspace_id = w.workspace_id
        JOIN workspace_members wm
            ON w.workspace_id = wm.workspace_id
            AND wm.role = 'LEADER'
        JOIN users u
            ON wm.user_id = u.user_id
        WHERE i.user_id = ?
            AND i.status = 'PENDING'
        ORDER BY i.created_at DESC
    `;

    const [rows] = await pool.query(sql, [userId]);

    return rows;
};

// 워크스페이스 멤버 ID 목록 조회
exports.getWorkspaceMemberIds = async (workspaceId) => {
    const sql = `
        SELECT user_id
        FROM workspace_members
        WHERE workspace_id = ?
    `; 
    const [rows] = await pool.query(sql, [workspaceId]);

    return rows.map(row => row.user_id);
};

// 초대 상태 변경
exports.updateInvitationStatus = async ({ workspaceId, userId, status }) => {
    const sql = `
        UPDATE invitations
        SET status = ?
        WHERE workspace_id = ?
        AND user_id = ?
    `;

    await pool.query(sql, [
        status,
        workspaceId,
        userId,
    ]);
};

// workspace_members에서 특정 멤버 삭제
exports.deleteWorkspaceMember = async ({ workspaceId, userId }) => {
    const sql = `
        DELETE FROM workspace_members
        WHERE workspace_id = ?
        AND user_id = ?
    `;

    await pool.query(sql, [
        workspaceId,
        userId,
    ]);
};


// 워크스페이스 방장 권한 위임
exports.transferWorkspaceLeader = async ({ workspaceId, currentLeaderId, newLeaderId }) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 기존 LEADER를 MEMBER로 변경
        const demoteSql = `
            UPDATE workspace_members
            SET role = 'MEMBER'
            WHERE workspace_id = ?
            AND user_id = ?
        `;

        await connection.query(demoteSql, [
            workspaceId,
            currentLeaderId,
        ]);

        // 새 방장을 LEADER로 변경
        const promoteSql = `
            UPDATE workspace_members
            SET role = 'LEADER'
            WHERE workspace_id = ?
            AND user_id = ?
        `;

        await connection.query(promoteSql, [
            workspaceId,
            newLeaderId,
        ]);

        await connection.commit();

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};