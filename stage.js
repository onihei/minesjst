import Scene from './scene.js'
import Assets from './assets.js'
import View from './view.js'
import Engine from './engine.js'
import Header from "./header.js";
import Level from "./level.js";
import Audio from './audio.js'
import LevelProgress from "./level-progress.js";
import Repository from "./repository.js";
import Success from "./success.js";
import Ending from "./ending.js";
import Scroller from "./scroller.js";
import LevelScreen from "./level-screen.js";
import Emf from "./emf.js";

const TILE_SIZE = 66;
const TILE_GAP = 2;
const HEADER_HEIGHT = 50;

let images = {};

export default class Stage extends Scene {

    constructor(levelNumber = 0, resume = false) {
        super();
        this.level = new Level(levelNumber);
        if (resume) {
            this.level.restore();
        }
    }

    async init() {
        super.init();
        await Promise.all(
            [
                Assets.loadImage('./drawable/1.png'),
                Assets.loadImage('./drawable/2.png'),
                Assets.loadImage('./drawable/3.png'),
                Assets.loadImage('./drawable/4.png'),
                Assets.loadImage('./drawable/5.png'),
                Assets.loadImage('./drawable/6.png'),
                Assets.loadImage('./drawable/7.png'),
                Assets.loadImage('./drawable/8.png'),
                Assets.loadImage('./drawable/mine.png'),
                Assets.loadImage('./drawable/flag.png'),
                Assets.loadImage('./drawable/miss.png'),
                Assets.loadRaw('./drawable/pause.emf').then((data) => {
                    images['pause'] = new Emf(data)
                }),
                Assets.loadAudio('./sound/bomb.m4a').then((data) => {
                    Audio.load('bomb', data);
                }),
                Assets.loadAudio('./sound/flag.m4a').then((data) => {
                    Audio.load('flag', data);
                }),
                Assets.loadAudio('./sound/shield.m4a').then((data) => {
                    Audio.load('shield', data);
                }),
                Assets.loadAudio('./sound/stage.m4a').then((data) => {
                    Audio.load('stage', data);
                }),
            ]
        ).then((results) => {
            images[1] = results[0];
            images[2] = results[1];
            images[3] = results[2];
            images[4] = results[3];
            images[5] = results[4];
            images[6] = results[5];
            images[7] = results[6];
            images[8] = results[7];
            images['mine'] = results[8];
            images['flag'] = results[9];
            images['miss'] = results[10];
            this.initViews();
        })
    }

    initViews() {
        this.initHeader();
        this.initScroller();
        this.initLevelScreen();
    }

    onEnter() {
        super.onEnter();
        Audio.stop();
        let start = 226809 / 44100;
        let end = (226809 + 3628799) / 44100;
        Audio.play('stage', {loop: true, loopStart: start, loopEnd: end});
        this.checkGameOver();
    }

    onLeave() {
        super.onLeave();
        Audio.stop();
    }

    initHeader() {
        this.header = new Header({
            left: 0,
            top: 0,
            width: this.width,
            height: HEADER_HEIGHT,
            order: 2
        }, this.level);
        this.addChild(this.header);

        this.header.countDownTimer.onTimer = this.onTimer.bind(this);
        this.header.countDownTimer.onTimeOver = this.onTimeOver.bind(this);
        if (this.level.started) {
            this.header.countDownTimer.start();
        }

        this.header.onPause = () => {
            this.doPause();
        };
    }

    initScroller() {
        let screenWidth = this.width;
        let screenHeight = this.height - HEADER_HEIGHT;

        this.scroller = new Scroller(this.level, screenWidth, screenHeight, TILE_SIZE, TILE_GAP);
        this.scroller.left = 10;
        this.scroller.top = this.height - this.scroller.height - 10;
        this.scroller.order = 2;

        this.addChild(this.scroller);
    }

    initLevelScreen() {
        let screenWidth = this.width;
        let screenHeight = this.height - HEADER_HEIGHT;

        this.levelScreen = new LevelScreen({
            left: 0,
            top: HEADER_HEIGHT,
            width: screenWidth,
            height: screenHeight
        }, this.level, this.scroller, TILE_SIZE, TILE_GAP);
        this.addChild(this.levelScreen);
    }

    handleTouchStart(event) {
        super.handleTouchStart(event);

        let viewPosition = this.scroller.viewPosition();
        let x = event.layerX + viewPosition.left;
        let y = event.layerY + viewPosition.top - HEADER_HEIGHT;
        this.touched = {x: x, y: y};
    }

    handleTouchEnd(event) {
        super.handleTouchEnd(event);

        if (this.level.isFinished()) {
            if (this.level.isSuccess()) {
                if (this.level.isLastLevel()) {
                    this.goEnding();
                } else {
                    this.goNextLevel();
                }
            } else if (this.level.isFailure()) {
                this.goTitle();
            }
            return;
        }

        let viewPosition = this.scroller.viewPosition();
        let x = event.layerX + viewPosition.left;
        let y = event.layerY + viewPosition.top - HEADER_HEIGHT;

        if (this.calcDistance(x, y, this.touched.x, this.touched.y) > TILE_SIZE / 2) {
            this.doFlag();
        } else {
            this.doReveal();
        }
        Engine.render();
    }

    calcDistance(x1, y1, x2, y2) {
        let a = x1 - x2;
        let b = y1 - y2;
        return Math.sqrt(a * a + b * b);
    }

    doFlag() {
        let x = this.touched.x;
        let y = this.touched.y;
        for (let i = 0; i < this.level.squares.length; i++) {
            let square = this.level.squares[i];
            if (View.ptInRect(x, y, square.left, square.top, square.width, square.height)) {
                if (square.revealed) {
                    break;
                }
                square.flag = !square.flag;
                if (square.flag) {
                    Audio.play('flag');
                }
                break;
            }
        }
    }

    doReveal() {
        let x = this.touched.x;
        let y = this.touched.y;

        for (let i = 0; i < this.level.squares.length; i++) {
            let square = this.level.squares[i];
            if (View.ptInRect(x, y, square.left, square.top, square.width, square.height)) {
                this.onClickSquare(square);
                break;
            }
        }
    }

    onClickSquare(square) {
        if (!this.level.started) {
            this.level.start(square);
            this.header.countDownTimer.start();
            this.level.recordStartStep(square);
        }
        if (square.revealed) {
            return;
        }
        if (square.flag) {
            return;
        }
        this.level.reveal(square);
        this.level.recordStep(square);
        if (square.mine) {
            if (this.level.shields > 0) {
                Audio.play('shield');
            } else {
                Audio.play('bomb');
            }
            this.header.breakShield();
        }
        this.checkGameOver();
    }

    checkGameOver() {
        if (this.level.isFailure()) {
            this.header.countDownTimer.stop();
            this.doFailure();
        } else if (this.level.isSuccess()) {
            this.header.countDownTimer.stop();
            this.doClear();
        }
    }

    onTimer(timeRemaining) {
        this.level.recordTimer(timeRemaining);
    }

    onTimeOver() {
        this.level.revealAll();
    }

    doFailure() {
        Audio.stop();
    }

    doClear() {
        Audio.stop();
        if (this.level.isLastLevel()) {
            Repository.setCurrentLevel(this.level.level);
        } else {
            Repository.setCurrentLevel(this.level.level + 1);
        }
        this.addChild(new Success({width: this.width, height: this.height}));
    }

    doPause() {
        this.header.countDownTimer.stop();
        this.goTitle();
    }

    goNextLevel() {
        Engine.changeScene('levelProgress', new LevelProgress());
    }

    goTitle() {
        Engine.changeScene('title');
    }

    goEnding() {
        Engine.changeScene('ending', new Ending());
    }

    static images() {
        return images;
    }
}
