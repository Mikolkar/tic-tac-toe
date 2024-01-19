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
for (let id = 0; id < 4; id++) {
    games.push(new Game(id));
}

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    socket.on('join_room', (data) => {
        let game = games[data.gameId];
        if (!game.addPlayer(socket.id, data.playerName)) {
            socket.emit('full');
            return;
        }
        socket.join(data.gameId);       // add socket to room
        io.to(data.gameId).emit('update', game.getGameState());     // send update to all sockets in room
        console.log(`Player ${data.playerName} joined room ${data.gameId}`);
    });

    socket.on('move', (data) => {
        let game = games[data.gameId];
        game.makeMove(data.playerId, data.move);
        if (game.getGameState.winner !== null) {
            io.to(data.gameId).emit('game_over', game.getGameState().winner);
            setTimeout(() => {
                game.reset();
                io.to(data.gameId).emit('update', game.getGameState());
            }, 5000);
        }
        io.to(data.gameId).emit('update', game.getGameState());
    });

    socket.on('disconnect', () => {
        let game = games.find((game) => game.hasPlayer(socket.id));
        if (game) {
            game.removePlayer(socket.id);
            io.to(game.getGameState().id).emit('update', game.getGameState());
            console.log(`Player ${socket.id} left room ${game.getGameState().id}`);
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});
