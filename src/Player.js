module.exports = class Player {
    constructor(id) {
        this.id = id;
        this.name = "";
        this.symbol = null;
    }

    getSymbol() {
        if(this.symbol === null) {
            throw new Error('Player symbol not set');
        }
        return this.symbol;
    }

    setSymbol(symbol) {
        if(symbol === 'X' || symbol === 'O') {
            this.symbol = symbol;
        } else{
            throw new Error('Invalid symbol');
        }
    }
}