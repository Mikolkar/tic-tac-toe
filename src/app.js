const express = require('express');
const app = express();
const socket = require('socket.io');
const Room = require('./Room.js');

const PORT = process.env.TTT_PORT || 3000;

app.use(express.static('public'));

const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

const io = socket(server);

var rooms = [
    new Room(1),
    new Room(2),
    new Room(3),
    new Room(4)
];

function getRoom(roomId) {
    return rooms.find((room) => room.id === roomId);
}

function findRoom(playerId) {
    return rooms.find((room) => room.players.some((player) => player.id === playerId));
}

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    socket.on('player:login', (data) => {
        if (data.playerName.trim()) {
            if (data.playerName.trim().length > 20) {
                socket.emit('player:login:failed', { message: 'Error: Max name length is 20.' });
                return;
            }
            socket.emit('player:login:success', { playerName: data.playerName.trim() });
            socket.join('lobby');
            socket.emit('lobby:update', rooms);
        }
    });

    socket.on('player:logout', () => {
        socket.leave('lobby');
    });

    socket.on('room:join', (data) => {
        let room = getRoom(data.roomId);
        if (room.addPlayer(socket.id, data.playerName)) {
            socket.leave('lobby');
            socket.join(data.roomId);
            socket.emit('room:joined');
            io.to(data.roomId).emit('room:update', room.getRoomState());
            io.to('lobby').emit('lobby:update', rooms);
            console.log(`Player ${socket.id} has joined room ${data.roomId}`);
        } else {
            socket.emit('room:full');
        }
    });

    socket.on('room:move', (data) => {
        let room = findRoom(socket.id);
        room.makeMove(socket.id, data.x, data.y);
        io.to(room.id).emit('room:update', room.getRoomState());
    });

    socket.on('room:leave', () => {
        let room = findRoom(socket.id);
        if (room) {
            room.removePlayer(socket.id);
            socket.leave(room.id);
            io.to(room.id).emit('room:update', room.getRoomState());
            socket.join('lobby');
            io.to('lobby').emit('lobby:update', rooms);
            console.log(`Player ${socket.id} has left room ${room.id}`);
        }
    });

    socket.on('room:reset', () => {
        let room = findRoom(socket.id);
        if (room) {
            room.reset();
            io.to(room.id).emit('room:update', room.getRoomState());
        }
    });

    socket.on('disconnect', () => {
        let room = findRoom(socket.id);
        if (room) {
            room.removePlayer(socket.id);
            socket.leave(room.id);
            socket.leave('lobby');
            io.to(room.id).emit('room:update', room.getRoomState());
            io.to('lobby').emit('lobby:update', rooms);
            console.log(`Player ${socket.id} has left room ${room.id}`);
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});
