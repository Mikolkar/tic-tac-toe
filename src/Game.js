//tic tac toe game class

class Game {
    constructor() {
        this.board = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
        this.players = [];
        this.currentPlayer = null;
        this.winner = null;
    }

    getGameState() {
        return {
            board: this.board,
            players: this.players,
            currentPlayer: this.currentPlayer,
            winner: this.winner
        };
    }

    addPlayer(player) {
        this.players.push(player);
        if (this.players.length === 2) {
            this.currentPlayer = this.players[0];
        }
    }

    removePlayer(player) {
        this.players = this.players.filter(p => p !== player);
        this.reset();
    }

    makeMove(player, x, y) {
        if (this.currentPlayer === player && this.board[x][y] === null) {
            this.board[x][y] = player;
            this.checkWinner();
            this.currentPlayer = this.players.find(p => p !== player);
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
            this.winner = winner;
        }
    }

    reset() {
        this.board = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
        this.currentPlayer = this.players[0];
        this.winner = null;
    }
}

module.exports = Game;
