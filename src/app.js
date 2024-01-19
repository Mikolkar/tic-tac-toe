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
for (let i = 0; i < 4; i++) {
    games.push(new Game());
}

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    socket.on('join_room', (data) => {
        let game = games[data.gameId];
        if (game.getGameState().players.length >= 2) {
            socket.emit('full');
            return;
        }
        game.addPlayer(socket.id);
        socket.join(data.gameId);       // add socket to room
        io.to(data.gameId).emit('update', game.getGameState());     // send update to all sockets in room
    });

    socket.on('move', (data) => {
        let game = games[data.gameId];
        game.makeMove(data.playerId, data.move);
        if (game.getGameState.winner !== null) {
            io.to(data.gameId).emit('winner', game.getGameState().winner);
            setTimeout(() => {
                game.reset();
                io.to(data.gameId).emit('update', game.getGameState());
            }, 5000);
        }
        io.to(data.gameId).emit('update', game.getGameState());
    });

    socket.on('disconnect', () => {
        let game = games.find((game) => {
            return game.getGameState().players.includes(socket.id);
        });
        if (game) {
            game.removePlayer(socket.id);
            io.to(game.getGameState().id).emit('update', game.getGameState());
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});
