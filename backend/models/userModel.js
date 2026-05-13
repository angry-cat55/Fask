const pool = require('../config/db');

exports.createUser = async (userData) => {
    // TODO: 회원 정보 저장 SQL 작성
    return null;
};

exports.findUserByLoginId = async (loginId) => {
    // TODO: loginId 중복 확인용 조회 SQL 작성
    return null;
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
