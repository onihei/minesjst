import Assets from "./assets.js";

export default class StringPainter {

    constructor(fontSize, color, characters) {
        this.textureCanvas = null;
        this.charWidth = null;
        this.charHeight = null;
        this.leftPositions = {};
        this.initTexture(fontSize, color, characters);
    }

    initTexture(fontSize, color, characters) {
        this.textureCanvas = document.createElement('canvas');
        let ctx = this.textureCanvas.getContext('2d');
        ctx.font = `${fontSize}px gamefont`;
        this.charWidth = ctx.measureText('0').width + 2;
        this.charHeight = this.charWidth * 2;
        this.textureCanvas.width = this.charWidth * characters.length + 10;
        this.textureCanvas.height = this.charHeight;

        // ctx.beginPath();
        // ctx.lineWidth = 0;
        // ctx.fillStyle = "rgba(128, 32, 122, 0.7)";
        // ctx.rect(0, 0, this.textureCanvas.width, this.textureCanvas.height);
        // ctx.fill();
        //
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = `${fontSize}px gamefont`;
        ctx.fillStyle = color;

        characters.split('').forEach((c, index) => {
            ctx.fillText(c, index * this.charWidth + this.charWidth / 2, this.textureCanvas.height / 2);
            this.leftPositions[c] = index * this.charWidth;
        });
    }

    paint(ctx2d, str, left, top, kerning = 0) {
        if (!this.textureCanvas) {
            return;
        }
        let w = this.charWidth;
        let h = this.charHeight;
        str.split('').forEach((c, index) => {
            ctx2d.drawImage(this.textureCanvas, this.leftPositions[c], 0, w, this.textureCanvas.height, left + index * (w + kerning), top, w, h);
        });
    }

}
