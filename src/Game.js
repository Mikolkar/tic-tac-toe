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
        this.score = {
            O: 0,
            X: 0,
            draw: 0,
            rounds: 0
        };
    }

    getGameState() {
        return {
            id: this.id,
            board: this.board,
            players: this.players,
            currentPlayer: this.currentPlayer,
            winner: this.winner,
            score: this.score
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
                this.board[x][y] = playerId === this.players[0].id ? 'O' : 'X';
                this.currentPlayer = this.players.find(p => p.id !== playerId);
                this.checkWinner();

                if(this.winner !== null) {
                    if(this.winner.id === 'draw') {
                        this.score.draw++;
                    } else {
                        this.winner === this.players[0] ? this.score.O++ : this.score.X++;
                    }
                }
            }
        }
    }

    checkWinner() {
        let winner = null;

        //check rows
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i][0] && this.board[i][0] === this.board[i][1] && this.board[i][0] === this.board[i][2]) {
                winner = this.board[i][0];
            }
        }

        //check columns
        for (let i = 0; i < this.board[0].length; i++) {
            if (this.board[0][i] && this.board[0][i] === this.board[1][i] && this.board[0][i] === this.board[2][i]) {
                winner = this.board[0][i];
            }
        }

        //check diagonals
        if (this.board[0][0] && this.board[0][0] === this.board[1][1] && this.board[0][0] === this.board[2][2]) {
            winner = this.board[1][1];
        } else if (this.board[0][2] && this.board[0][2] === this.board[1][1] && this.board[0][2] === this.board[2][0]) {
            winner = this.board[1][1];
        }

        if (winner !== null) {
            this.winner = winner === 'O' ? this.players[0] : this.players[1];
        }

        if (this.board.every(row => row.every(x => x !== null)) && this.winner === null) {
            this.winner = {id: 'draw', name: 'Draw'};
        }
    }

    reset() {
        this.board = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
        this.players.length === 2 ?
            this.score = {
                O: this.score.X,
                X: this.score.O,
                draw: this.score.draw,
                rounds: this.score.rounds + 1
            } : this.score = {
                O: 0,
                X: 0,
                draw: 0,
                rounds: 0
            };
        this.players = this.players.length === 2 ? this.players.reverse() : this.players;
        this.currentPlayer = this.players.length === 2 ? this.players[0] : null;
        this.winner = null;
    }
}

