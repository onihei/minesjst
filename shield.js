import View from "./view.js";

export default class Shield extends View {

    constructor(props) {
        super(props);
    }

    paint(ctx2d) {
        super.paint(ctx2d);
        ctx2d.beginPath();
        ctx2d.lineWidth = 0;
        ctx2d.fillStyle = "rgba(128, 255, 0, 0.7)";
        ctx2d.rect(0, 0, this.width, this.height);
        ctx2d.fill();
    }
}
