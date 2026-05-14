const pool = require('../config/db');

// 로그인 아이디로 사용자 정보 조회
exports.findUserByLoginId = async (loginId) => {
    // SQL 쿼리: users 테이블에서 loginId에 해당하는 사용자 정보 조회
    const sql = 'SELECT * FROM users WHERE login_id = ?';

    // SQL 쿼리를 실행하여 로그인 아이디에 해당하는 사용자 정보를 조회
    const [rows] = await pool.query(sql, [loginId]);

    // 조회된 사용자 정보가 있으면 첫 번째 행을 반환하고, 없으면 null 반환
    return rows[0];
};

// 회원 데이터 생성
exports.createUser = async ({ loginId, password, email, nickname }) => {
    // SQL 쿼리: users 테이블에 새로운 사용자 데이터 삽입
    const sql = `INSERT INTO users (login_id, password, email, nickname) VALUES (?, ?, ?, ?)`;

    // SQL 쿼리를 실행하여 새로운 사용자 데이터를 삽입
    await pool.query(sql, [loginId, password, email, nickname]); //암호화 할꺼면 password 대신 hashedPassword
};

// 이메일로 로그인 아이디 조회
exports.findLoginIdByEmail = async (email) => {
    // SQL 쿼리: users 테이블에서 email에 해당하는 로그인 아이디 조회
    const sql = `
        SELECT login_id AS loginId
        FROM users
        WHERE email = ?
        LIMIT 1
    `;

    // SQL 쿼리를 실행하여 이메일에 해당하는 로그인 아이디를 조회
    const [rows] = await pool.execute(sql, [email]);

    // 조회된 로그인 아이디가 있으면 첫 번째 행을 반환하고, 없으면 null 반환
    return rows[0] || null;
};

// 비밀번호 재설정
exports.updatePasswordByLoginId = async ({ loginId, newPassword }) => {
    // SQL 쿼리: users 테이블에서 loginId에 해당하는 사용자의 비밀번호 업데이트
    const sql = `
        UPDATE users
        SET password = ?
        WHERE login_id = ?
    `;

    // SQL 쿼리를 실행하여 로그인 아이디에 해당하는 사용자의 비밀번호를 업데이트
    await pool.execute(sql, [newPassword, loginId]);
}

// userId로 사용자 정보 조회
exports.findUserById = async (userId) => {
    // SQL 쿼리: users 테이블에서 user_id에 해당하는 사용자 정보 조회
    const sql = 'SELECT * FROM users WHERE user_id = ?';

    // SQL 쿼리를 실행하여 userId에 해당하는 사용자 정보를 조회
    const [rows] = await pool.query(sql, [userId]);

    // 조회된 사용자 정보가 있으면 첫 번째 행을 반환하고, 없으면 null 반환
    return rows[0] || null;
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