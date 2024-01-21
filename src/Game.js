module.exports = class Game {
    constructor(id) {
        this.id = id;
        this.board = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
        this.players = [];
        this.currentPlayer = null;
        this.winner = null;
        this.draw = false;
    }

    getGameState() {
        return {
            id: this.id,
            board: this.board,
            players: this.players,
            currentPlayer: this.currentPlayer,
            winner: this.winner,
            draw: this.draw,
        };
    }

    addPlayer(playerId, playerName) {
        if (this.players.length < 2) {
            this.players.push({
                id: playerId,
                name: playerName
            });
            if (this.players.length === 2) {
                this.currentPlayer = this.players[0];
            }
            return true;
        }
        return false;
    }

    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
        this.reset();
    }

    makeMove(playerId, x, y) {
        if (this.currentPlayer !== null) {
            if (this.currentPlayer.id === playerId && this.board[x][y] === null && this.winner === null) {
                this.board[x][y] = playerId === this.players[0].id ? 'X' : 'O';
                this.currentPlayer = this.players.find(p => p.id !== playerId);
                this.checkWinner();
            }
        }
    }

    checkWinner() {
        let winner = null;

        //check rows
        this.board.forEach(row => {
            if (row.every(x => x === row[0])) {
                winner = row[0];
            }
        });

        //check columns
        for (let i = 0; i < 3; i++) {
            if (
                this.board[0][i] !== null &&
                this.board[0][i] === this.board[1][i] &&
                this.board[0][i] === this.board[2][i]
            ) {
                winner = this.board[0][i];
            }
        }

        //check diagonals
        if ((
            this.board[0][0] !== null &&
            this.board[0][0] === this.board[1][1] &&
            this.board[0][0] === this.board[2][2]
        ) || (
            this.board[0][2] !== null &&
            this.board[0][2] === this.board[1][1] &&
            this.board[0][2] === this.board[2][0]
        )) {
            winner = this.board[1][1];
        }

        if (winner !== null) {
            this.winner = winner === 'X' ? this.players[0] : this.players[1];
        }

        if (this.board.every(row => row.every(cell => cell !== null))) {
            this.draw = true;
        }
    }

    reset() {
        this.board = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
        this.currentPlayer = null;
        this.winner = null;
    }
}

