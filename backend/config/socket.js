const { Server } = require('socket.io');

let io;

/**
 * initSocket(server)
 * - HTTP 서버를 받아 Socket.IO 서버를 초기화합니다.
 */
const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    // 소켓 미들웨어: 연결될 때 프론트가 보낸 userId를 가로채서 확인
    io.use((socket, next) => {
        // 프론트엔드에서 소켓 연결 시 넘겨주는 userId 추출
        const userId = socket.handshake.auth.userId || socket.handshake.query.userId;
        
        if (!userId) {
            return next(new Error('인증 에러: userId가 제공되지 않았습니다.'));
        }
        
        socket.userId = userId; // 소켓 객체에 userId를 박아둠
        next();
    });

    // 연결 핸들러
    io.on('connection', (socket) => {
        console.log(`소켓 연결 성공. 디바이스 ID: ${socket.id}, 유저 ID: ${socket.userId}`);

        // 소켓 연결 즉시 자신의 개인 룸에 자동 입장
        const personalRoom = `user_${socket.userId}`;
        socket.join(personalRoom);
        console.log(`유저 [${socket.userId}] 개인 룸(${personalRoom}) 활성화 완료`);

        // 워크스페이스 방 입장 (방 안에 들어왔을 때 실시간 톡 수신용)
        socket.on('join_workspace', (data) => {
            const { workspaceId } = data || {};
            const roomName = `workspace_${workspaceId}`;

            socket.join(roomName);
            socket.emit('join_workspace_success', { roomName, workspaceId, userId: socket.userId });
            console.log(`유저 [${socket.userId}]가 방 [${roomName}]에 입장했습니다.`);
        });

        // 워크스페이스 방 퇴장
        socket.on('leave_workspace', (data) => {
            const { workspaceId } = data || {};
            const roomName = `workspace_${workspaceId}`;

            socket.leave(roomName);
            socket.emit('leave_workspace_success', { roomName, workspaceId, userId: socket.userId });
            console.log(`유저 [${socket.userId}]가 방 [${roomName}]에서 퇴장했습니다.`);
        });

        // 연결 해제
        socket.on('disconnect', () => {
            console.log(`소켓 연결 끊김: 디바이스 ID: ${socket.id}, 유저 ID: ${socket.userId}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('소켓 서버가 초기화되지 않았습니다.');
    return io;
};

module.exports = { initSocket, getIO };