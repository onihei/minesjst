import View from './view.js'

export default class LevelScreen extends View {

    constructor(props, level, scroller, tileSize, tileGap) {
        super(props);
        this.level = level;
        this.scroller = scroller;
        this.tileSize = tileSize;
        this.tileGap = tileGap;

        this.arrangeSquares();
    }

    arrangeSquares() {
        this.level.squares.forEach((square) => {
            Object.assign(square, {
                left: square.x * (this.tileSize + (square.x > 0 ? this.tileGap : 0)),
                top: square.y * (this.tileSize + (square.y > 0 ? this.tileGap : 0)),
                width: this.tileSize,
                height: this.tileSize
            });
            this.addChild(square);
        });
    }

    onDraw(ctx2d) {
        super.onDraw(ctx2d);

        let position = this.scroller.viewPosition();
        ctx2d.translate(-position.left, -position.top);
    }
}
