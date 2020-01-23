import View from "./view.js";
import Stage from "./stage.js";

export default class Square extends View {

    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.mine = false;
        this.hint = 0;
        this.revealed = false;
        this.flag = false;
    }

    paint(ctx2d) {
        super.paint(ctx2d);
        if (this.revealed) {
            ctx2d.beginPath();
            ctx2d.lineWidth = 0;
            ctx2d.fillStyle = "#aaa";
            ctx2d.rect(0, 0, this.width, this.height);
            ctx2d.fill();
        } else {
            ctx2d.beginPath();
            ctx2d.fillStyle = "#aaa";
            ctx2d.rect(0, 0, this.width, this.height);
            ctx2d.fill();
            ctx2d.lineWidth = 2;
            ctx2d.strokeStyle = '#fff';
            ctx2d.beginPath();
            ctx2d.moveTo(0, this.height);
            ctx2d.lineTo(0, 0);
            ctx2d.lineTo(this.width, 0);
            ctx2d.stroke();
            ctx2d.strokeStyle = '#000';
            ctx2d.beginPath();
            ctx2d.moveTo(this.width, 0);
            ctx2d.lineTo(this.width, this.height);
            ctx2d.lineTo(0, this.height);
            ctx2d.stroke();
        }
        if (this.revealed) {
            if (this.flag && !this.mine) {
                let img = Stage.images()['miss'];
                ctx2d.drawImage(img, 0, 0, this.width, this.height);
            } else if (this.mine) {
                let img = Stage.images()['mine'];
                ctx2d.drawImage(img, 0, 0, this.width, this.height);
            } else if (this.hint > 0) {
                let img = Stage.images()[this.hint];
                ctx2d.drawImage(img, 0, 0, this.width, this.height);
            }
        } else {
            if (this.flag) {
                let img = Stage.images()['flag'];
                ctx2d.drawImage(img, 0, 0, this.width, this.height);
            }
        }
    }
}
