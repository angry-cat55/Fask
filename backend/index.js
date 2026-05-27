const express = require('express');
const cors = require('cors');
const http = require('http');
const { initSocket } = require('./config/socket');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// 라우트 파일들 불러오기
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const kanbanRoutes = require('./routes/kanbanRoutes');


app.use(cors());
app.use(express.json());

// URL 끝의 슬래시 유무와 관계없이 요청을 처리하도록 설정
app.set('strict routing', false);

// 소켓 서버 초기화 및 전역 등록
const io = initSocket(server);
app.set('io', io);

// URL 경로에 따라 라우트 파일 연결
app.use('/api/auth', authRoutes); // /api/auth 경로로 들어오는 요청은 authRoutes에서 처리
app.use('/api/users', userRoutes); // /api/users 경로로 들어오는 요청은 userRoutes에서 처리
app.use('/api/workspaces', workspaceRoutes); // /api/workspaces 경로로 들어오는 요청은 workspaceRoutes에서 처리
app.use('/api/workspaces', kanbanRoutes); // /api/workspaces 경로로 들어오는 요청 중 kanbanRoutes에서 처리할 수 있는 요청은 kanbanRoutes에서 처리
server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
