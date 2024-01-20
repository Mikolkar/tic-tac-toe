const socket = io();

var playerName = sessionStorage.getItem('playerName');
var gameId;

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
            <h2 class="lobby-title">Lobby</h2>
            <div class="lobby-list">
                <div class="room-1">
                    <div class="room-name">Room 1</div>
                    <div class="room-players"></div>
                    <button class="room-button" id="1">Join</button>
                </div>
                <div class="room-2">
                    <div class="room-name">Room 2</div>
                    <div class="room-players"></div>
                    <button class="room-button" id="2">Join</button>
                </div>
                <div class="room-3">
                    <div class="room-name">Room 3</div>
                    <div class="room-players"></div>
                    <button class="room-button" id="3">Join</button>
                </div>
                <div class="room-4">
                    <div class="room-name">Room 4</div>
                    <div class="room-players"></div>
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
                <div class="game-status-message"></div>
                <button class="game-status-button" id="restart-button">Restart</button>
                <button class="game-status-button" id="leave-button">Leave</button>
            </div>
        </div>`
};

function isView(viewName) {
    return document.querySelector('#content').innerHTML === contents[viewName];
}

function setView(viewName) {
    document.querySelector('#content').innerHTML = contents[viewName];
}


document.addEventListener('keypress', (event) => {
    if (event.target.matches('#player-name')) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('login-button').click();
        }
    }
});

document.addEventListener('click', (event) => {
    if (event.target.matches('#login-button')) {
        if (isView('login')) {
            playerName = document.getElementById('player-name').value;
            sessionStorage.setItem('playerName', playerName);
            setView('lobby');
        }
    }
});

document.addEventListener('click', (event) => {
    if (event.target.matches('.room-button')) {
        if (isView('lobby')) {
            socket.emit('room:join', {gameId: parseInt(event.target.id), playerName: playerName});
        }
    }
});

document.addEventListener('click', (event) => {
    if (event.target.matches('#leave-button')) {
        if (isView('game')) {
            socket.emit('room:leave');
            setView('lobby');
        }
    }
});


socket.on('room:full', () => {
    console.log('full');
});

socket.on('room:joined', (data) => {
    console.log('joined', data);
    gameId = data.gameId;
    setView('game');
});

socket.on('update', (data) => {
    console.log('update', data);
});


if (playerName) {
    setView('lobby');
} else {
    setView('login');
}
