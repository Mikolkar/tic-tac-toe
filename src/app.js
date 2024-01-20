const express = require('express');
const app = express();
const socket = require('socket.io');
const Game = require('./Game.js');
const Player = require('./Player.js');

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
    let player = new Player(socket.id);
    console.log(`New connection: ${player.id}`);

    socket.on('player:login', (data) => {
        player.name = data.playerName;
        socket.join('lobby');
        socket.emit('lobby:update', games);
    });

    socket.on('room:join', (data) => {
        let game = getGame(data.gameId);
        if (game.addPlayer(player)) {
            socket.leave('lobby');
            socket.join(data.gameId);
            socket.emit('room:joined', { gameId: data.gameId });
            io.to(data.gameId).emit('room:update', game.getGameState());
            io.to('lobby').emit('lobby:update', games);
            console.log(`Player ${player.id} has joined room ${data.gameId}`);
        } else {
            socket.emit('room:full');
        }
    });

    socket.on('room:move', (data) => {
        let game = getGame(data.gameId);
        game.makeMove(data.player, data.x, data.y);
        io.to(data.gameId).emit('room:update', game.getGameState());
    });

    socket.on('room:leave', () => {
        let game = findGame(player.id);
        if (game) {
            game.removePlayer(player.id);
            socket.leave(game.id);
            io.to(game.id).emit('room:update', game.getGameState());
            socket.join('lobby');
            io.to('lobby').emit('lobby:update', games);
            console.log(`Player ${player.id} has left room ${game.id}`);
        }
        else{
            console.log(`Player ${player.id} is not in a room`);
        }
    });

    socket.on('disconnect', () => {
        let game = findGame(player.id);
        if (game) {
            game.removePlayer(player.id);
            socket.leave(game.id);
            socket.leave('lobby');
            io.to(game.id).emit('room:update', game.getGameState());
            console.log(`Player ${player.id} has left room ${game.id}`);
            io.to('lobby').emit('lobby:update', games);
        }
        console.log(`User disconnected: ${player.id}`);
    });
});
