const socketIo = require('socket.io');

let io;

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: [
                process.env.CLIENT_URL || "http://localhost:3000",
                process.env.ADMIN_URL || "http://localhost:3001",
                'https://games-fe.vercel.app',
                'https://games-admin.vercel.app'
            ],
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket']
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join-room', (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
            socket.to(roomId).emit('player-joined', { userId: socket.id });
        });

        socket.on('start-playing', ({ gameId, userId }) => {
            // Broadcast to friends logic would go here
            // For demo, just emit back a mock update
            io.emit('friends-activity-update', [
                { username: 'Rahul', game: 'Subway Surfers' },
                { username: 'Priya', game: 'Temple Run' }
            ]);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initSocket, getIo };
