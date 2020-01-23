import View from "./view.js";
import Engine from "./engine.js";

export default class StopWatch extends View {

    constructor(props) {
        super(props);
        this.startTime = null;
        this.time = 0;
        this.textureCanvas = null;
        this.initSegment();
    }

    initSegment() {
        this.fontSize = 60;
        this.textureCanvas = document.createElement('canvas');
        this.textureCanvasCtx = this.textureCanvas.getContext('2d');
        this.textureCanvasCtx.font = `${this.fontSize}px gamefont`;
        this.charWidth = this.textureCanvasCtx.measureText('0').width + 2;
        this.charHeight = this.charWidth * 2.2;
        this.textureCanvas.width = this.charWidth * 11;
        this.textureCanvas.height = this.charHeight;
        this.textureCanvasCtx.textAlign = 'center';
        this.textureCanvasCtx.textBaseline = 'bottom';

        this.textureCanvasCtx.font = `${this.fontSize}px gamefont`;
        this.textureCanvasCtx.fillStyle = '#fff';
        this.leftPositions = {};
        '0123456789:'.split('').forEach((c, index) => {
            this.textureCanvasCtx.fillText(c, index * this.charWidth + this.charWidth / 2, this.charHeight);
            this.leftPositions[c] = index * this.charWidth;
        });
    }

    paint(ctx2d) {
        super.paint(ctx2d);
        ctx2d.beginPath();
        ctx2d.lineWidth = 2;
        ctx2d.strokeStyle = "rgba(0, 127, 0, 0.7)";
        ctx2d.fillStyle = "rgba(128, 255, 0, 0.7)";
        ctx2d.rect(0, 0, this.width, this.height);
        ctx2d.fill();

        this.drawDigits(ctx2d, this.timeDigits());
    }

    drawDigits(ctx2d, digits) {
        if (!this.textureCanvas) {
            return;
        }
        let w = this.width / 5;
        let h = this.height;
        digits.split('').forEach((c, index) => {
            ctx2d.drawImage(this.textureCanvas, this.leftPositions[c], 0, this.charWidth, this.charHeight, index * w, 0, w, h);
        });
    }

    timeDigits() {
        let minutes = Math.floor((this.time / 1000 / 60) << 0);
        let seconds = Math.floor((this.time / 1000) % 60);

        if (minutes > 99) {
            return '99:59';
        }
        return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }

    start() {
        this.startTime = new Date().getTime();
        this.time = 0;
        this.timer = setInterval(this.updateTime.bind(this), 1000);
    }

    updateTime() {
        this.time = new Date().getTime() - this.startTime;
        Engine.render();
    }

    stop() {

    }
}
