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
            <div class="lobby-title">
                <h2 class="welcome-title"></h2>
                <div class="change-name">
                    <button class="change-name-button" id="change-name-button">Change name</button>
                </div>
            </div>
            <div class="lobby-list">
                <div class="room">
                    <div class="room-name">Room 1</div>
                    <div class="room-players" id="players-1"></div>
                    <button class="room-button" id="1">Join</button>
                </div>
                <div class="room">
                    <div class="room-name">Room 2</div>
                    <div class="room-players" id="players-2"></div>
                    <button class="room-button" id="2">Join</button>
                </div>
                <div class="room">
                    <div class="room-name">Room 3</div>
                    <div class="room-players" id="players-3"></div>
                    <button class="room-button" id="3">Join</button>
                </div>
                <div class="room">
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
                        <div class="game-board-cell no-border-top no-border-left" data-cell="0,0"></div>
                        <div class="game-board-cell no-border-top" data-cell="0,1"></div>
                        <div class="game-board-cell no-border-top no-border-right" data-cell="0,2"></div>
                    </div>
                    <div class="game-board-row">
                        <div class="game-board-cell no-border-left" data-cell="1,0"></div>
                        <div class="game-board-cell" data-cell="1,1"></div>
                        <div class="game-board-cell no-border-right" data-cell="1,2"></div>
                    </div>
                    <div class="game-board-row">
                        <div class="game-board-cell no-border-bottom no-border-left" data-cell="2,0"></div>
                        <div class="game-board-cell no-border-bottom" data-cell="2,1"></div>
                        <div class="game-board-cell no-border-bottom no-border-right" data-cell="2,2"></div>
                    </div>
                </div>
                <div class="game-status">
                    <div class="score-board-list"> <ul class="score-board-list"></ul> </div>
                    <div class="game-status-player"></div>
                    <div class="game-status-turn"></div>
                    <button class="game-status-button" id="leave-button">Leave</button>
                    <button class="game-status-button hide-element" id="restart-button">Play again</button>
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

function updateScoreBoard(score, players) {
    if (view === 'game') {
        document.querySelector('.score-board-list').style.listStyleType = 'none';
        // console.log("rounds",score.rounds);
        // console.log("players",players);
        if(players.length === 2){
            if(score.rounds % 2 === 0) {
                document.querySelector('.score-board-list').innerHTML = `
                <li class="score-board-item">${players[0].name}: ${score.O}</li>
                <li class="score-board-item">Draw: ${score.draw}</li>
                <li class="score-board-item">${players[1].name}: ${score.X}</li>
            `;
            } else {
                document.querySelector('.score-board-list').innerHTML = `
                <li class="score-board-item">${players[1].name}: ${score.X}</li>
                <li class="score-board-item">Draw: ${score.draw}</li>
                <li class="score-board-item">${players[0].name}: ${score.O}</li>
            `;
            }
        } else {
            document.querySelector('.score-board-list').innerHTML = `
            <li class="score-board-item"></li>
            <li class="score-board-item"></li>
            <li class="score-board-item"></li>
        `;
        }
    }
}

function checkWinningCells(board) {
    // check rows
    for (let i = 0; i < board.length; i++) {
        if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
            return [[i, 0], [i, 1], [i, 2]];
        }
    }

    // check columns
    for (let i = 0; i < board[0].length; i++) {
        if (board[0][i] && board[0][i] === board[1][i] && board[0][i] === board[2][i]) {
            return [[0, i], [1, i], [2, i]];
        }
    }

    // check diagonals
    if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
        return [[0, 0], [1, 1], [2, 2]];
    } else if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
        return [[0, 2], [1, 1], [2, 0]];
    }

    return null;
}

function drawBoard(board) {
    if (view === 'game') {
        let winningCells = checkWinningCells(board);
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                document.querySelector(`[data-cell="${i},${j}"]`).classList.remove('winning-cell');
                document.querySelector(`[data-cell="${i},${j}"]`).innerHTML = board[i][j]; 
                if (winningCells) {
                    for (let k = 0; k < winningCells.length; k++) {
                        if (winningCells[k][0] === i && winningCells[k][1] === j) {
                            document.querySelector(`[data-cell="${i},${j}"]`).classList.add('winning-cell');
                        }
                    }
                }
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
        updateScoreBoard(data.score, data.players);
        document.querySelector('#restart-button').classList.add('hide-element');
        drawBoard(data.board, data.winningCells);
        if (data.players.length === 1) {
            document.querySelector('.game-status-player').innerHTML = 'Waiting for player...';
            document.querySelector('.game-status-turn').innerHTML = '';
        }
        if (data.players.length === 2) {
            document.querySelector('.game-status-player').innerHTML = `Playing with ${data.players[0].name === playerName ? data.players[1].name : data.players[0].name}`;
            if (data.winner) {
                if (data.winner.id  === 'draw') {
                    document.querySelector('.game-status-turn').innerHTML = 'Draw!';
                } else if (data.winner.id === socket.id) {
                    document.querySelector('.game-status-turn').innerHTML = 'You win!';
                } else {
                    document.querySelector('.game-status-turn').innerHTML = 'You lose!';
                }
                
                document.querySelector('#restart-button').classList.remove('hide-element');
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
