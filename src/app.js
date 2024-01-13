// Create tic-tac-toe game with node.js and socket.io
// Server side code for the game and controlling the game

// Require the packages
// Express is used for the server
// Socket.io is used for the communication between the server and the client
const express = require('express');
const app = express();
const socket = require('socket.io');
const Game = require(__dirname + '/Game.js');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use(express.static('../public'));

const io = socket(server);

// Create a new game
const game = new Game();

// Listen for a connection
io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Listen for a new player
    socket.on('newPlayer', () => {
        // Add the new player to the game
        game.addPlayer(socket.id);
        // Emit the game state to the client
        io.emit('gameState', game);
    });

    // Listen for a player move
    socket.on('move', (data) => {
        // Update the game state
        game.update(data);
        // Emit the game state to the client
        io.emit('gameState', game);
    });

    // Listen for a player disconnect
    socket.on('disconnect', () => {
        // Remove the player from the game
        game.removePlayer(socket.id);
        // Emit the game state to the client
        io.emit('gameState', game);
    });
});

