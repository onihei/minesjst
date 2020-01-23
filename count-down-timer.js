import View from "./view.js";
import Engine from "./engine.js";
import StringPainter from "./string-painter.js";

export default class CountDownTimer extends View {

    constructor(props, time) {
        super(props);
        this.startTime = null;
        this.time = time;
        this.lastTimeDigits = null;
        this.timeRemaining = time;
        this.onTimer = null;
        this.onTimeOver = null;
        this.stringPainter = new StringPainter(30, '#fff', ':0123456789');
    }

    paint(ctx2d) {
        super.paint(ctx2d);
        // ctx2d.beginPath();
        // ctx2d.lineWidth = 2;
        // ctx2d.strokeStyle = "rgba(0, 127, 0, 0.7)";
        // ctx2d.fillStyle = "rgba(128, 255, 0, 0.7)";
        // ctx2d.rect(0, 0, this.width, this.height);
        // ctx2d.fill();

        this.stringPainter.paint(ctx2d, this.timeDigits(), 0, 0, -3);
    }

    timeDigits() {
        let minutes = Math.floor((this.timeRemaining / 1000 / 60) << 0);
        let seconds = Math.floor((this.timeRemaining / 1000) % 60);

        if (minutes > 99) {
            return '99:59';
        }
        return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }

    start() {
        this.startTime = new Date().getTime();
        this.remains = this.time;
        this.lastTimeDigits = this.timeDigits();
        this.timer = setInterval(this.updateTime.bind(this), 100);
    }

    updateTime() {
        this.timeRemaining = this.time - (new Date().getTime() - this.startTime);
        let t = this.timeDigits();
        if (this.lastTimeDigits !== t) {
            this.lastTimeDigits = t;
            if (this.onTimer) {
                this.onTimer(this.timeRemaining);
            }
        }
        if (this.timeRemaining < 0) {
            this.timeRemaining = 0;
            this.stop();
            if (this.onTimeOver) {
                this.onTimeOver();
            }
        }
        Engine.render();
    }

    stop() {
        clearInterval(this.timer);
        this.timer = null;
    }
}
