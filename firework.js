import MersenneTwister from "./mersenne-twister.js";

export default class Firework {

    constructor(x, y) {
        let hue = MersenneTwister.range(0, 360);
        this.particles = this.createParticles(x, y, hue);
    }

    createParticles(x, y, hue) {
        return [...Array(30)].map(() => new Particle(x, y, hue));
    }

    update() {
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.alpha > p.decay);
    }

    draw(ctx2d) {
        ctx2d.globalCompositeOperation = 'lighter';
        ctx2d.lineWidth = 3;
        this.particles.forEach(p => p.draw(ctx2d));
    }
}

class Particle {

    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.lastX = this.x;
        this.lastY = this.y;
        this.angle = MersenneTwister.range(0, Math.PI * 2);
        this.speed = MersenneTwister.range(1, 10);
        this.friction = 0.95;
        this.gravity = 1;
        this.hue = MersenneTwister.range(hue - 50, hue + 50);
        this.brightness = MersenneTwister.range(50, 80);
        this.alpha = 1;
        this.decay = MersenneTwister.range(0.015, 0.03);
    }

    update() {
        this.lastX = this.x;
        this.lastY = this.y;
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;
    }

    draw(ctx2d) {
        ctx2d.beginPath();
        ctx2d.moveTo(this.lastX, this.lastY);
        ctx2d.lineTo(this.x, this.y);
        ctx2d.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        ctx2d.stroke();
    }
}