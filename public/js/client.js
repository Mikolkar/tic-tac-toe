// tic-tac-toe game client
// socket.io client

const socket = io();

var view = "login";
var playerName = null;


socket.on('full', () => {
    console.log('full');
});

socket.on('winner', (data) => {
    console.log('game_over', data);
});

socket.on('update', (data) => {
    console.log('update', data);
});

function setView(view) {
    document.getElementsByClassName('login')[0].style.display = 'none';
    document.getElementsByClassName('lobby')[0].style.display = 'none';
    document.getElementsByClassName('game')[0].style.display = 'none';
    document.getElementsByClassName(view)[0].style.display = 'block';
    view = view;
}

setView('login');

document.getElementById('login-button').addEventListener('click', () => {
    playerName = document.getElementById('player-name').value;
    if (playerName && view == "login") {
        setView('lobby');
    }
});

Array.from(document.getElementsByClassName('room-button')).forEach((button) => {
    button.addEventListener('click', () => {
        if (view == "lobby") {
            let gameId = button.id;
            gameId = parseInt(gameId[gameId.length - 1]);
            socket.emit('join-room', {gameId: gameId, playerName: playerName});
            setView('game');
        }
    });
});
