import View from "./view.js";
import NumberUtils from "./number-utils.js";
import Engine from "./engine.js";
import Box from "./box.js";

export default class Scroller extends View {

    constructor(level, screenWidth, screenHeight, tileSize, tileGap) {
        super();
        this.level = level;

        let leftPadding = screenWidth - tileSize;
        let rightPadding = screenWidth - tileSize;
        let topPadding = screenHeight - tileSize;
        let bottomPadding = screenHeight - tileSize;
        let tileWidth = tileSize * level.width + tileGap * (level.width - 1);
        let tileHeight = tileSize * level.height + tileGap * (level.height - 1);

        let w = leftPadding + tileWidth + rightPadding;
        let h = topPadding + tileHeight + bottomPadding;
        let box = new Box(w, h).calcContainBox(200, 200);
        this.width = box.width;
        this.height = box.height;

        let rw = NumberUtils.split(this.width, [leftPadding, tileWidth, rightPadding]);
        let rh = NumberUtils.split(this.height, [topPadding, tileHeight, bottomPadding]);

        this.minLevel = new MinLevel({
            left: rw[0],
            top: rh[0],
            width: rw[1],
            height: rh[1]
        });
        this.addChild(this.minLevel);

        this.scale = this.minLevel.width / tileWidth;

        this.minScreen = new MinScreen({
            left: this.minLevel.left,
            top: this.minLevel.top,
            width: screenWidth * this.scale,
            height: screenHeight * this.scale
        });
        this.addChild(this.minScreen);
    }

    paint(ctx2d) {
        super.paint(ctx2d);
        ctx2d.beginPath();
        ctx2d.lineWidth = 1;
        ctx2d.fillStyle = "rgba(128, 255, 100, .2)";
        ctx2d.strokeStyle = "rgb(128, 255, 100)";
        ctx2d.rect(0, 0, this.width, this.height);
        ctx2d.fill();
        ctx2d.stroke();
    }

    viewPosition() {
        return {
            left: (this.minScreen.left - this.minLevel.left) / this.scale,
            top: (this.minScreen.top - this.minLevel.top) / this.scale,
        }
    }

    handleTouchStart(event) {
        super.handleTouchStart(event);
        event.orgEvent.preventDefault();

        let x = event.layerX;
        let y = event.layerY;
        this.lastPosition = {x: x, y: y};
        return true;
    }

    handleTouchMove(event) {
        super.handleTouchMove(event);
        event.orgEvent.preventDefault();

        let x = event.layerX;
        let y = event.layerY;
        this._scroll(x - this.lastPosition.x, y - this.lastPosition.y);
        this.lastPosition = {x: x, y: y};
        return true;
    }

    handleTouchEnd(event) {
        super.handleTouchEnd(event);
        return true;
    }

    //
    // _handleMove(x, y) {
    //     let left = Math.min(Math.max(x - this.minScreen.width / 2, 0), this.width - this.minScreen.width );
    //     let top = Math.min(Math.max(y - this.minScreen.height / 2, 0), this.height - this.minScreen.height);
    //     this.minScreen.left = left;
    //     this.minScreen.top = top;
    //     Engine.render();
    // }

    _scroll(x, y) {
        this.minScreen.left += x;
        this.minScreen.top += y;
        let left = Math.min(Math.max(this.minScreen.left, 0), this.width - this.minScreen.width);
        let top = Math.min(Math.max(this.minScreen.top, 0), this.height - this.minScreen.height);
        this.minScreen.left = left;
        this.minScreen.top = top;
        Engine.render();
    }
}

class MinLevel extends View {

    constructor(props) {
        super(props);

    }

    paint(ctx2d) {
        super.paint(ctx2d);
        ctx2d.beginPath();
        ctx2d.lineWidth = 0;
        ctx2d.fillStyle = "rgb(88, 88, 88)";
        ctx2d.rect(0, 0, this.width, this.height);
        ctx2d.fill();
    }
}

class MinScreen extends View {

    constructor(props) {
        super(props);

    }

    paint(ctx2d) {
        super.paint(ctx2d);
        ctx2d.beginPath();
        ctx2d.lineWidth = 0;
        ctx2d.strokeStyle = "rgb(255, 255, 255)";
        ctx2d.rect(0, 0, this.width, this.height);
        ctx2d.stroke();
    }
}
