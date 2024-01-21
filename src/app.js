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

function resetGame(game) {
    if (game && game.board) {
        for (let i = 0; i < game.board.length; i++) {
            for (let j = 0; j < game.board[i].length; j++) {
                game.board[i][j] = null;
            }
        }
        game.winner = null;
        game.draw = false;
        game.currentPlayer === game.players[0] ? game.currentPlayer = game.players[1] : game.currentPlayer = game.players[0];
    } else {
        console.error('Game not found or game board is not defined');
    }
}

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    socket.on('player:login', (data) => {
        socket.join('lobby');
        socket.emit('lobby:update', games);
    });

    socket.on('room:join', (data) => {
        let game = getGame(data.gameId);
        if (game.addPlayer(socket.id, data.playerName)) {
            socket.leave('lobby');
            socket.join(data.gameId);
            socket.emit('room:joined', { gameId: data.gameId });
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
        // console.log(game.getGameState());
    });

    socket.on('room:leave', () => {
        let game = findGame(socket.id);
        if (game) {
            game.removePlayer(socket.id);
            socket.leave(game.id);
            io.to(game.id).emit('room:update', game.getGameState());
            socket.join('lobby');
            io.to('lobby').emit('lobby:update', games);
        }
    });

    socket.on('room:restart', () => {
        let game = findGame(socket.id);
        if (game) {
            resetGame(game);
            console.log("reset");
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
            console.log(`Player ${socket.id} has left room ${game.id}`);
            io.to('lobby').emit('lobby:update', games);
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});
