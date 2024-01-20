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

function leaveGame(playerId) {
    let game = findGame(playerId);
    if (game) {
        game.removePlayer(playerId);
        io.to(game.id).emit('update', game.getGameState());
        console.log(`Player ${playerId} has left room ${game.id}`);
    }
}


io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    socket.on('room:join', (data) => {
        let game = getGame(data.gameId);
        if (game.addPlayer(socket.id, data.playerName)) {
            socket.join(data.gameId);
            io.to(data.gameId).emit('update', game.getGameState());
            console.log(`Player ${data.playerName} has joined room ${data.gameId}`);
            socket.emit('room:joined', { gameId: data.gameId });
        } else {
            socket.emit('room:full');
        }
    });

    socket.on('room:move', (data) => {
        let game = getGame(data.gameId);
        game.makeMove(data.playerId, data.x, data.y);
        io.to(data.gameId).emit('update', game.getGameState());
    });

    socket.on('room:leave' => {
        leaveGame(socket.id);
    });

    socket.on('disconnect', () => {
        leaveGame(socket.id);
        console.log(`User disconnected: ${socket.id}`);
    });
});
