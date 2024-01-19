// tic-tac-toe game client
// socket.io client

const socket = io();

var view = "login";
var playerName = "";


socket.on('full', () => {
    console.log('full');
});

socket.on('winner', (data) => {
    console.log('game_over', data);
});

socket.on('update', (data) => {
    console.log('update', data);
});

// show only login div on start
document.getElementsByClassName('login')[0].style.display = 'block';
document.getElementsByClassName('lobby')[0].style.display = 'none';
document.getElementsByClassName('game')[0].style.display = 'none';

// login button
document.getElementsByClassName('login-form-button')[0].addEventListener('click', () => {
    playerName = document.getElementById('player-name').value;
    if (playerName != "" && view == "login") {
        document.getElementsByClassName('login')[0].style.display = 'none';
        document.getElementsByClassName('lobby')[0].style.display = 'block';
        view = "lobby";
    }
});

// document.getElementsByClassName('room-button').forEach((button) => {
//     button.addEventListener('click', () => {
//         if (view == "lobby") {
//             let gameId = button.id;
//             gameId = parseInt(gameId[gameId.length - 1]);
//             socket.emit('join_room', {gameId: gameId, playerName: playerName});
//             document.getElementsByClassName('lobby')[0].style.display = 'none';
//             document.getElementsByClassName('game')[0].style.display = 'block';
//             view = "game";
//         }
//     });
// });

Array.from(document.getElementsByClassName('room-button')).forEach((button) => {
    button.addEventListener('click', () => {
        if (view == "lobby") {
            let gameId = button.id;
            gameId = parseInt(gameId[gameId.length - 1]);
            socket.emit('join_room', {gameId: gameId, playerName: playerName});
            document.getElementsByClassName('lobby')[0].style.display = 'none';
            document.getElementsByClassName('game')[0].style.display = 'block';
            view = "game";
        }
    });
});
