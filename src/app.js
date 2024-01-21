const express = require('express');
const app = express();
const socket = require('socket.io');
const Game = require('./Game.js');

const PORT = process.env.TTT_PORT || 3000;

app.use(express.static('public'));

const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

const io = socket(server);

var games = [
    new Game(1),
    new Game(2),
    new Game(3),
    new Game(4)
];

function getGame(gameId) {
    return games.find((game) => game.id === gameId);
}

function findGame(playerId) {
    return games.find((game) => game.players.some((player) => player.id === playerId));
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
            socket.emit('lobby:update', games);
        }
    });

    socket.on('player:logout', () => {
        socket.leave('lobby');
    });

    socket.on('room:join', (data) => {
        let game = getGame(data.gameId);
        if (game.addPlayer(socket.id, data.playerName)) {
            socket.leave('lobby');
            socket.join(data.gameId);
            socket.emit('room:joined');
            io.to(data.gameId).emit('room:update', game.getGameState());
            io.to('lobby').emit('lobby:update', games);
            console.log(`Player ${socket.id} has joined room ${data.gameId}`);
        } else {
            socket.emit('room:full');
        }
    });

    socket.on('room:move', (data) => {
        let game = findGame(socket.id);
        game.makeMove(socket.id, data.x, data.y);
        io.to(game.id).emit('room:update', game.getGameState());
    });

    socket.on('room:leave', () => {
        let game = findGame(socket.id);
        if (game) {
            game.removePlayer(socket.id);
            socket.leave(game.id);
            io.to(game.id).emit('room:update', game.getGameState());
            socket.join('lobby');
            io.to('lobby').emit('lobby:update', games);
            console.log(`Player ${socket.id} has left room ${game.id}`);
        }
    });

    socket.on('room:reset', () => {
        let game = findGame(socket.id);
        if (game) {
            game.reset();
            io.to(game.id).emit('room:update', game.getGameState());
        }
    });

    socket.on('disconnect', () => {
        let game = findGame(socket.id);
        if (game) {
            game.removePlayer(socket.id);
            socket.leave(game.id);
            socket.leave('lobby');
            io.to(game.id).emit('room:update', game.getGameState());
            io.to('lobby').emit('lobby:update', games);
            console.log(`Player ${socket.id} has left room ${game.id}`);
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});
