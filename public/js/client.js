const socket = io();

var playerName = sessionStorage.getItem('playerName');
var view;

var contents = {
    'login': `
        <div class="login">
            <div class="login-form">
                <input class="login-form-input" type="text" id="player-name" placeholder="Enter your name" autofocus>
                <button class="login-form-button" id="login-button">→</button>
            </div>
            <div class="login-message"></div>
        </div>`,
    'lobby': `
        <div class="lobby">
            <h2 class="welcome-title"></h2>
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
                <div class="change-name">
                    <button class="change-name-button" id="change-name-button">Change name</button>
                </div>
            </div>
        </div>`,
        'game': `
            <div class="game">
                <div class="game-board">
                    <div class="game-board-row">
                        <div class="game-board-cell" data-cell="0,0"></div>
                        <div class="game-board-cell" data-cell="0,1"></div>
                        <div class="game-board-cell" data-cell="0,2"></div>
                    </div>
                    <div class="game-board-row">
                        <div class="game-board-cell" data-cell="1,0"></div>
                        <div class="game-board-cell" data-cell="1,1"></div>
                        <div class="game-board-cell" data-cell="1,2"></div>
                    </div>
                    <div class="game-board-row">
                        <div class="game-board-cell" data-cell="2,0"></div>
                        <div class="game-board-cell" data-cell="2,1"></div>
                        <div class="game-board-cell" data-cell="2,2"></div>
                    </div>
                </div>
                <div class="game-status">
                    <div class="game-status-player"></div>
                    <div class="game-status-turn"></div>
                    <button class="game-status-button" id="leave-button">Leave</button>
                    <button class="game-status-button" id="restart-button">Play again</button>
                </div>
            </div>`
};

function setView(viewName) {
    document.querySelector('.content').innerHTML = contents[viewName];
    view = viewName;
    if (viewName === 'lobby') {
        document.querySelector('.welcome-title').innerHTML = `Welcome, ${playerName}`;
    }
}

function updateLobby(rooms) {
    if (view === 'lobby') {
        for (let i = 1; i <= 4; i++) {
            document.querySelector('#players-' + i).innerHTML = '';
            if (rooms[i - 1].players.length > 0) {
                for (let j = 0; j < rooms[i - 1].players.length; j++) {
                    document.querySelector('#players-' + i).innerHTML += '<div class="room-player">' + rooms[i - 1].players[j].name + '</div>';
                }
            } else {
                document.querySelector('#players-' + i).innerHTML = '<div class="room-player">Empty</div>';
            }
        }
    }
}

function drawBoard(board) {
    if (view === 'game') {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                document.querySelector(`[data-cell="${i},${j}"]`).innerHTML = board[i][j]; 
            }
        }
    }
}


// Event listeners
document.addEventListener('keydown', (event) => {
    if (event.target.matches('#player-name') && view === 'login') {
        document.querySelector('.login-message').innerHTML = '';
        if (event.key === 'Enter') {
            event.preventDefault();
            document.querySelector('#login-button').click();
        }
    }
});

document.addEventListener('click', (event) => {
    if (view === 'login') {
        if (event.target.matches('#login-button')) {
            playerName = document.querySelector('#player-name').value.trim();
            if (playerName) {
                socket.emit('player:login', {playerName: playerName});
            }
        }
    } else if (view === 'lobby') {
        if (event.target.matches('.room-button')) {
            socket.emit('room:join', {gameId: parseInt(event.target.id), playerName: playerName});
        } else if (event.target.matches('#change-name-button')) {
            socket.emit('player:logout');
            sessionStorage.removeItem('playerName');
            setView('login');
            document.querySelector('#player-name').focus();
        }
    } else if (view === 'game') {
        if (event.target.matches('#leave-button')) {
            socket.emit('room:leave');
            setView('lobby');
        } else if (event.target.matches('#restart-button')) {
            socket.emit('room:reset');
        } else if (event.target.matches('.game-board-cell')) {
            cells = event.target.dataset.cell.split(',');
            socket.emit('room:move', {x: parseInt(cells[0]), y: parseInt(cells[1])});
        }
    }
});


// Socket listeners
socket.on('player:login:success', (data) => {
    console.log('player:login:success');
    if (view === 'login') {
        sessionStorage.setItem('playerName', data.playerName);
        setView('lobby');
    }
});

socket.on('player:login:failed', (data) => {
    console.log('player:login:failed');
    if (view === 'login') {
        document.querySelector('.login-message').innerHTML = data.message;
        setTimeout(() => {
            if (view === 'login') {
                document.querySelector('.login-message').innerHTML = '';
            }
        }, 5000);
    }
});

socket.on('lobby:update', (rooms) => {
    console.log('lobby:update', rooms);
    updateLobby(rooms);
});

socket.on('room:full', () => {
    console.log('room:full');
});

socket.on('room:joined', () => {
    console.log('room:joined');
    if (view === 'lobby') {
        setView('game');
    }
});

socket.on('room:update', (data) => {
    console.log('room:update', data);
    if (view === 'game') {
        drawBoard(data.board);
        document.querySelector('#restart-button').style.display = 'none';
        if (data.players.length === 1) {
            document.querySelector('.game-status-player').innerHTML = 'Waiting for player...';
            document.querySelector('.game-status-turn').innerHTML = '';
        }
        if (data.players.length === 2) {
            document.querySelector('.game-status-player').innerHTML = `Playing with ${data.players[0].name === playerName ? data.players[1].name : data.players[0].name}`;
            if (data.winner) {
                document.querySelector('#restart-button').style.display = 'block';
                if (data.winner === 'draw') {
                    document.querySelector('.game-status-turn').innerHTML = 'Draw!';
                } else if (data.winner.id === socket.id) {
                    document.querySelector('.game-status-turn').innerHTML = 'You win!';
                } else {
                    document.querySelector('.game-status-turn').innerHTML = 'You lose!';
                }
            } else {
                if (data.currentPlayer.id === socket.id) {
                    document.querySelector('.game-status-turn').innerHTML = 'Your turn';
                } else {
                    document.querySelector('.game-status-turn').innerHTML = `${data.currentPlayer.name}'s turn`;
                }
            }
        }
    }
});

socket.on('disconnect', () => {
    console.log('disconnect');
    location.reload();
});


// Initialization
if (playerName) {
    setView('lobby');
    socket.emit('player:login', {playerName: playerName});
} else {
    setView('login');
}
