const pool = require('../config/db');

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