export class Game {
    constructor() {
        this.players = [];
        this.board = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];
        this.turn = 'X';
        this.winner = null;
    }

    addPlayer(id) {
        this.players.push(id);
    }

    removePlayer(id) {
        this.players = this.players.filter(player => player !== id);
    }

    update(data) {
        const { row, col } = data;
        if (this.board[row][col] === '') {
            this.board[row][col] = this.turn;
            this.checkWinner();
            this.changeTurn();
        }
    }

    changeTurn() {
        this.turn = this.turn === 'X' ? 'O' : 'X';
    }

    checkWinner() {
        const board = this.board;
        const rows = board.length;
        const cols = board[0].length;
        
        let winner = null;

        // Check rows
        for (let i = 0; i < rows; i++) {
            if (board[i][0] !== '' && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
                winner = board[i][0];
            }
        }

        // Check cols
        for (let i = 0; i < cols; i++) {
            if (board[0][i] !== '' && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
                winner = board[0][i];
            }
        }

        // Check diagonals
        if (board[0][0] !== '' && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
            winner = board[0][0];
        } else if (board[0][2] !== '' && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
            winner = board[0][2];
        }

        // Check if it's draw
        let draw = true;
        for (let i = 0; i < rows; i++) {
            if (board[i].includes('')) {
                draw = false;
            }
        }

        // Update winner
        if (winner !== null) {
            this.winner = winner;
        } else if (draw) {
            this.winner = 'draw';
        }
    }

    reset() {
        this.board = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];
        this.turn = 'X';
        this.winner = null;
    }
}
