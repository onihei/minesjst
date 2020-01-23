import View from './view.js'
import MersenneTwister from "./mersenne-twister.js";
import Firework from "./firework.js";

export default class Success extends View {

    constructor(props) {
        super(props);
        this.animationId = null;
        this.fireworks = [];
        this.fireworkInterval = 20;
        View.loopAnimate(this.successAnimationLoop.bind(this));
    }

    successAnimationLoop() {
        if (--this.fireworkInterval < 0) {
            let x = MersenneTwister.range(0, this.width);
            let y = MersenneTwister.range(0, this.height);
            this.fireworks.push(new Firework(x, y));
            this.fireworkInterval = MersenneTwister.range(3, 20);
        }
        this.fireworks.forEach(t => t.update());
        this.fireworks = this.fireworks.filter(t => t.particles.length > 0);
    }

    paint(ctx2d) {
        super.paint(ctx2d);
        this.fireworks.forEach(t => t.draw(ctx2d));
    }
}
