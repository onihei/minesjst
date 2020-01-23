import View from "./view.js";
import Shield from "./shield.js";
import CountDownTimer from "./count-down-timer.js";
import StringPainter from "./string-painter.js";
import EmfSprite from "./emf-sprite.js";
import Stage from "./stage.js";

export default class Header extends View {

    constructor(props, level) {
        super(props);

        this.levelNumber = level.level;
        this.onPause = () => {
        };

        this.shields = [];
        for (let i = 0; i < level.shields; i++) {
            let shield = new Shield({
                left: 210 + 15 * i,
                top: 10,
                width: 0,
                height: 30
            });
            View.animate(200, 200 * i, (progress) => {
                shield.width = 10 * progress;
            });
            this.addChild(shield);
            this.shields.push(shield);
        }

        this.countDownTimer = new CountDownTimer({
            left: 120,
            top: 10,
            width: 80,
            height: 30
        }, level.time);
        this.addChild(this.countDownTimer);

        let emf = new EmfSprite(Stage.images()['pause'], 100, 40, true);
        emf.left = this.width - 70;
        emf.top = 5;
        emf.setOnClickListener(() => {
            this.onPause();
        });
        this.addChild(emf);

        this.stringPainter = new StringPainter(30, '#fff', 'LEVEL0123456789');
    }

    paint(ctx2d) {
        super.paint(ctx2d);
        ctx2d.beginPath();
        ctx2d.lineWidth = 0;
        ctx2d.fillStyle = "rgba(128, 0, 0, 1)";
        ctx2d.rect(0, 0, this.width, this.height);
        ctx2d.fill();

        this.stringPainter.paint(ctx2d, 'LEVEL' + this.levelNumber, 10, 10, -3);
    }

    breakShield() {
        let last = this.shields.pop();
        this.removeChild(last);
    }
}
