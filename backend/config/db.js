// mysql2의 Promise 버전 import
const mysql = require('mysql2/promise');

// dotenv: .env 파일의 환경 변수를 process.env로 로드하는 라이브러리
require('dotenv').config();

// MySQL 연결 풀 생성
// 풀: 여러 연결을 미리 만들어두고 재사용하는 방식 (성능 최적화)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // 연결 사용 가능할 때까지 대기 여부
  waitForConnections: true,
  // 동시에 사용할 수 있는 최대 연결 개수
  connectionLimit: 10,
  // 대기 중인 연결 요청의 최대 개수 (0: 무제한)
  queueLimit: 0,
  // 연결을 계속 유지하는 옵션 (서버가 우리를 끊으면 자동 재연결)
  enableKeepAlive: true,
  // keepAlive 시작 시간 (0 = 즉시)
  keepAliveInitialDelayMs: 0,
  // SSL 사용 여부 (Aiven은 보안을 위해 SSL 필수)
  // DB_SSL이 'true'이면 Amazon SSL 프로토콜 사용
  ssl: process.env.DB_SSL === 'true'
  ? {
      rejectUnauthorized: false
    }
  : false,
});

// 다른 파일에서 pool을 import해서 사용할 수 있도록 export
module.exports = pool;
