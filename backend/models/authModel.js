const pool = require('../config/db');

// 로그인 아이디로 사용자 정보 조회
exports.findUserByLoginId = async (loginId) => {
    // SQL 쿼리: users 테이블에서 loginId에 해당하는 사용자 정보 조회
    const sql = `
        SELECT
            user_id AS userId,
            login_id AS loginId,
            password,
            email,
            nickname,
            created_at AS createdAt
        FROM users
        WHERE login_id = ?
        LIMIT 1
    `;

    // SQL 쿼리를 실행하여 로그인 아이디에 해당하는 사용자 정보를 조회
    const [rows] = await pool.execute(sql, [loginId]);

    // 조회된 사용자 정보가 있으면 첫 번째 행을 반환하고, 없으면 null 반환
    return rows[0] || null;
};