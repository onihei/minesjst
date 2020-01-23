import Square from "./square.js";
import ArrayUtils from "./array-utils.js";
import View from "./view.js";
import MersenneTwister from "./mersenne-twister.js";
import Repository from "./repository.js";

let levels = [];

function addLevel(timeSeconds, width, height, mines, seed, shields) {
    levels.push({
        time: timeSeconds * 1000,
        width: width,
        height: height,
        mines: mines,
        seed: seed,
        shields: shields
    });
}

addLevel(180, 9, 9, 2, 0, 2);
addLevel(180, 9, 9, 10, 1, 2);
addLevel(180, 9, 9, 12, -1, 3);
addLevel(180, 9, 9, 14, -1, 2);
addLevel(180, 9, 9, 10, 1, 0);

addLevel(180, 16, 16, 15, 4, 2);
addLevel(180, 16, 16, 25, 5, 2);
addLevel(180, 16, 16, 32, 6, 2);
addLevel(180, 16, 16, 32, 8, 2);
addLevel(180, 16, 16, 25, 7, 0);

addLevel(600, 30, 16, 40, 13, 5);
addLevel(600, 30, 16, 60, 14, 5);
addLevel(600, 30, 16, 80, 15, 5);
addLevel(600, 30, 16, 99, 16, 5);
addLevel(600, 30, 16, 60, 17, 2);

addLevel(180, 9, 9, 16, -1, 1);
addLevel(180, 12, 12, 20, -1, 1);
addLevel(180, 16, 16, 25, -1, 1);
addLevel(180, 25, 16, 30, -1, 1);
addLevel(500, 30, 16, 60, -1, 2);

addLevel(180, 9, 9, 2, 0, 2);

export default class Level {

    constructor(level) {
        this.level = level;

        this.time = null;
        this.width = null;
        this.height = null;
        this.mines = null;
        this.seed = null;
        this.shields = null;

        Object.assign(this, levels[level]);

        this.squares = [];
        this.started = false;
        if (this.seed < 0) {
            this.seed = new Date().getTime();
        }
        this.initSquares();
    }

    initSquares() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let square = new Square(x, y);
                this.squares.push(square);
            }
        }
    }

    start(firstSquare) {
        this.started = true;
        MersenneTwister.seed(this.seed);

        let filtered = this.squares.filter(square => square.x !== firstSquare.x && square.y !== firstSquare.y);
        let shuffled = ArrayUtils.shuffleArray(filtered);
        let mines = this.mines;
        for (let i = 0; i < mines; i++) {
            shuffled[i].mine = true;
        }
        this.squares.forEach((square) => {
            if (square.mine) {
                this.surroundSquares(square).forEach(s => s.hint++);
            }
        });
    }

    surroundSquares(square) {
        let x = square.x;
        let y = square.y;
        let squares = [
            this.squareAt(x - 1, y - 1),
            this.squareAt(x - 0, y - 1),
            this.squareAt(x + 1, y - 1),
            this.squareAt(x - 1, y - 0),
            this.squareAt(x + 1, y - 0),
            this.squareAt(x - 1, y + 1),
            this.squareAt(x - 0, y + 1),
            this.squareAt(x + 1, y + 1),
        ];
        return squares.filter(square => square != null);
    }

    squareAt(x, y) {
        if (!View.ptInRect(x, y, 0, 0, this.width, this.height)) {
            return null;
        }
        return this.squares[y * this.width + x];
    }

    isFinished() {
        return this.isFailure() || this.isSuccess();
    }

    isFailure() {
        return this.shields < 0;
    }

    isSuccess() {
        if (this.isFailure()) {
            return;
        }
        return this.squares.filter((square) => !square.revealed || square.revealed && square.mine).length === this.mines;
    }

    isLastLevel() {
        return this.level === levels.length - 1;
    }

    damage() {
        this.shields--;
    }

    reveal(square) {
        this._reveal(square);
        if (square.mine) {
            this.damage();
        }
        if (this.isFailure()) {
            this.revealAll();
        } else if (this.isSuccess()) {
            this.revealAll();
        }
    }

    _reveal(square) {
        if (square.flag) {
            return;
        }
        if (square.revealed) {
            return;
        }
        square.revealed = true;
        if (square.mine) {
            return;
        }
        if (square.hint === 0) {
            this.surroundSquares(square).forEach(s => this._reveal(s));
        }
    }

    revealAll() {
        if (this.isSuccess()) {
            this.squares.filter(square => !square.revealed).forEach((square) => {
                square.flag = true;
            });
        } else {
            this.squares.forEach((square) => {
                square.revealed = true;
            });
        }
    }

    recordStartStep(square) {
        Repository.setStartStep(square, this.seed);
    }

    recordStep(square) {
        Repository.addStep(square);
    }

    recordTimer(timeRemaining) {
        Repository.setTimeRemaining(timeRemaining);
    }

    restore() {
        this.seed = Repository.getSeed();
        let startStep = Repository.getStartStep();
        if (startStep) {
            this.time = Repository.getTimeRemaining();
            this.start(this.squareAt(...startStep));
            Repository.getSteps().forEach(step => {
                this.reveal(this.squareAt(...step));
            });
        }
    }
}
