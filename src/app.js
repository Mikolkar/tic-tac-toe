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

let games = [];
for (let id = 1; id < 5; id++) {
    games.push(new Game(id));
}

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    socket.on('join-room', (data) => {
        let game = games.find((game) => game.id === data.gameId);
        if (!game.addPlayer(socket.id, data.playerName)) {
            socket.emit('full');
            return;
        }
        socket.join(data.gameId);       // add socket to room
        io.to(data.gameId).emit('update', game.getGameState());     // send update to all sockets in room
        console.log(`Player ${data.playerName} joined room ${data.gameId}`);
    });

    socket.on('move', (data) => {
        let game = games.find((game) => game.id === data.gameId);
        game.makeMove(data.playerId, data.move);
        if (game.winner !== null) {
            io.to(data.gameId).emit('game_over', game.winner);
            setTimeout(() => {
                game.reset();
                io.to(data.gameId).emit('update', game.getGameState());
            }, 5000);
        }
        io.to(data.gameId).emit('update', game.getGameState());
    });

    socket.on('disconnect', () => {
        let game = games.find((game) => game.players.some((player) => player.id === socket.id));
        if (game) {
            game.removePlayer(socket.id);
            io.to(game.id).emit('update', game.getGameState());
            console.log(`Player ${socket.id} left room ${game.id}`);
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});
