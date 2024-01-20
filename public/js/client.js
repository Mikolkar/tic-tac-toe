const socket = io();

var playerName = sessionStorage.getItem('playerName');
var view;

var contents = {
    'login': `
        <div class="login">
            <div class="login-form">
                <h2 class="login-form-title">Enter your name</h2>
                <input class="login-form-input" type="text" id="player-name" placeholder="Name">
                <button class="login-form-button" id="login-button">Login</button>
            </div>
        </div>`,
    'lobby': `
        <div class="lobby">
            <h2 class="welcome-title">Welcome, %playerName%</h2>
            <h2 class="lobby-title">Lobby</h2>
            <div class="lobby-list">
                <div class="room-1">
                    <div class="room-name">Room 1</div>
                    <div class="room-players" id="players-1"></div>
                    <button class="room-button" id="1">Join</button>
                </div>
                <div class="room-2">
                    <div class="room-name">Room 2</div>
                    <div class="room-players" id="players-2"></div>
                    <button class="room-button" id="2">Join</button>
                </div>
                <div class="room-3">
                    <div class="room-name">Room 3</div>
                    <div class="room-players" id="players-3"></div>
                    <button class="room-button" id="3">Join</button>
                </div>
                <div class="room-4">
                    <div class="room-name">Room 4</div>
                    <div class="room-players" id="players-4"></div>
                    <button class="room-button" id="4">Join</button>
                </div>
            </div>
        </div>`,
    'game': `
        <div class="game">
            <div class="game-board">
                <div class="game-board-row">
                    <div class="game-board-cell" data-cell="0"></div>
                    <div class="game-board-cell" data-cell="1"></div>
                    <div class="game-board-cell" data-cell="2"></div>
                </div>
                <div class="game-board-row">
                    <div class="game-board-cell" data-cell="3"></div>
                    <div class="game-board-cell" data-cell="4"></div>
                    <div class="game-board-cell" data-cell="5"></div>
                </div>
                <div class="game-board-row">
                    <div class="game-board-cell" data-cell="6"></div>
                    <div class="game-board-cell" data-cell="7"></div>
                    <div class="game-board-cell" data-cell="8"></div>
                </div>
            </div>
            <div class="game-status">
                <div class="game-status-title">Game Status</div>
                <div class="game-status-player"></div>
                <button class="game-status-button" id="leave-button">Leave</button>
                <button class="game-status-button" id="restart-button">Restart</button>
            </div>
            <div class="game-turn">
                <div class="game-turn-title"></div>
            </div>
        </div>`
};

function setView(viewName) {
    document.querySelector('.content').innerHTML = contents[viewName];
    view = viewName;
    if (viewName === 'lobby') {
        document.querySelector('.welcome-title').innerHTML = document.querySelector('.welcome-title').innerHTML.replace('%playerName%', playerName);
    }
}


document.addEventListener('keypress', (event) => {
    if (event.target.matches('#player-name') && view === 'login') {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('login-button').click();
        }
    }
});

document.addEventListener('click', (event) => {
    if (event.target.matches('#login-button')) {
        if (view === 'login') {
            playerName = document.querySelector('#player-name').value;
            sessionStorage.setItem('playerName', playerName);
            socket.emit('player:login', {playerName: playerName});
            setView('lobby');
        }
    }
});

document.addEventListener('click', (event) => {
    if (event.target.matches('.room-button')) {
        if (view === 'lobby') {
            socket.emit('room:join', {gameId: parseInt(event.target.id), playerName: playerName});
        }
    }
});

document.addEventListener('click', (event) => {
    if (event.target.matches('#leave-button')) {
        if (view === 'game') {
            socket.emit('room:leave');
            setView('lobby');
        }
    }
});


socket.on('lobby:update', (data) => {
    console.log('lobby:update', data);
    if (view === 'lobby') {
        for (let i = 1; i <= 4; i++) {
            document.querySelector('#players-' + i).innerHTML = '';
            if (data[i - 1].players.length > 0) {
                for (let j = 0; j < data[i - 1].players.length; j++) {
                    document.querySelector('#players-' + i).innerHTML += '<div class="room-player">' + data[i - 1].players[j].name + '</div>';
                }
            } else {
                document.querySelector('#players-' + i).innerHTML = '<div class="room-player">Empty</div>';
            }
        }
    }
});

socket.on('room:full', () => {
    console.log('room:full');
});

socket.on('room:joined', (data) => {
    console.log('room:joined', data);
    if (view === 'lobby') {
        setView('game');
    }
});

socket.on('room:update', (data) => {
    console.log('room:update', data);
    if (view === 'game') {
        if (data.players.length === 1) {
            document.querySelector('.game-status-player').innerHTML = 'Waiting for player...';
        }
        if (data.players.length === 2) {
            document.querySelector('.game-status-player').innerHTML = `Playing with ${data.players[0].name === playerName ? data.players[1].name : data.players[0].name}`;
        }
    }
});


if (playerName) {
    setView('lobby');
    socket.emit('player:login', {playerName: playerName});
} else {
    setView('login');
}
