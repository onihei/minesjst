import Scene from './scene.js'
import Assets from './assets.js'
import Engine from './engine.js'
import Audio from "./audio.js"
import Color from "./color.js";
import EmfSprite from "./emf-sprite.js";
import Emf from "./emf.js";
import Vector from "./vector.js";
import MersenneTwister from "./mersenne-twister.js";

let textCanvas;
let textCanvasCtx;

export default class Ending extends Scene {

    constructor(props) {
        super(props);

        this.requestId = null;
        this.frame = 0;
        this.messages = [];
    }

    async init() {
        super.init();
        this.initMessages();
        await Promise.all(
            [
                Assets.loadAudio('./sound/ending.m4a').then((data) => {
                    Audio.load('ending', data);
                }),
                Assets.loadRaw('./drawable/buta.emf').then((data) => {
                    let emf = new EmfSprite(new Emf(data), this.width, this.height, true);
                    emf.left = (this.width - emf.width) / 2;
                    emf.top = (this.height - emf.height) / 2;
                    emf.visible = false;
                    this.addChild(emf);
                    this.buta = emf;
                }),
            ])
    }

    initMessages() {
        this.messages.push(new Message(60, 300, 'Congratulations!', this.width / 2, 200, '30px', '#7ed308'));
        this.messages.push(new Message(180, 300, 'おめでとう🍊', this.width / 2, 300, '30px', '#339bff'));
        this.messages.push(new Message(600, 500, '全てのレベルを攻略！', this.width / 2, 200, '20px', '#339bff'));
        this.messages.push(new Message(700, 400, '終わり', this.width / 2, 270, '60px', '#339bff'));

        this.messages.push(new Message(1200, 700, 'プログラム', this.width / 2, 250, '20px', '#d6ff71'));
        this.messages.push(new Message(1200, 700, '林 雄一郎', this.width / 2, 280, '30px', '#339bff'));
        this.messages.push(new Message(1200, 700, 'BGM 素材', this.width / 2, 340, '20px', '#d6ff71'));
        this.messages.push(new Message(1200, 700, 'ユーフルカ', this.width / 2, 370, '30px', '#339bff'));
        this.messages.push(new Message(1200, 700, 'エンディング BGM', this.width / 2, 430, '20px', '#d6ff71'));
        this.messages.push(new Message(1200, 700, 'Prod. by Mr Kimy', this.width / 2, 460, '30px', '#339bff'));

        this.messages.push(new Message(1900, 600, 'お楽しみいただけたでしょうか', this.width / 2, 150, '20px', '#339bff'));
        this.messages.push(new Message(2000, 500, '50レベル用意できなくて', this.width / 2, 300, '20px', '#339bff'));
        this.messages.push(new Message(2000, 500, 'ごめんなさい', this.width / 2, 370, '50px', '#339bff'));
    }

    initTextCanvas() {
        textCanvas = document.createElement('canvas');
        textCanvas.width = this.width;
        textCanvas.height = this.height;
        textCanvasCtx = textCanvas.getContext('2d');
        textCanvasCtx.fillStyle = '#000';
        textCanvasCtx.textAlign = 'center';
        textCanvasCtx.textBaseline = 'middle';
    }

    mainLoop() {
        this.messages.forEach(message => {
            message.tick(this.frame);
        });
        if (this.frame === 3000) {
            this.buta.visible = true;
        }
        Engine.render();
        this.requestId = requestAnimationFrame(this.mainLoop.bind(this));
        this.frame++;
    }

    paint(ctx2d) {
        super.onDraw(ctx2d);
        ctx2d.fillStyle = this.bgColor(this.frame);
        ctx2d.fillRect(0, 0, this.width, this.height);
        this.messages.forEach(message => {
            message.paint(ctx2d, this.frame);
        });
    }

    bgColor(frame) {
        let r = Math.floor(255 * frame / 10000);
        return Color.rgb(r > 127 ? 127 : r, 0, 0);
    }

    onEnter() {
        super.onEnter();
        this.initTextCanvas();
        Audio.stop();
        Audio.play('ending', {loop: true});
        this.requestId = requestAnimationFrame(this.mainLoop.bind(this));
    }

    onLeave() {
        super.onLeave();
        cancelAnimationFrame(this.requestId);
    }
}

class Message {
    constructor(startFrame, duration, text, x, y, textSize, color) {
        this.startFrame = startFrame;
        this.duration = duration;
        this.text = text;
        this.x = x;
        this.y = y;
        this.textSize = textSize;
        this.color = color;
        this.particles = [];
        this.textFadeFrameLength = 5;
        this.particleFrameLength = 60;
        this.rgbColor = Color.hexToRgb(color);
    }

    tick(frame) {
        let localFrame = frame - this.startFrame;
        if (localFrame === this.duration - this.particleFrameLength) {
            this.particles = this.createParticles();
        } else if (localFrame === this.duration) {
            this.particles = [];
        }
        this.particles.forEach((p) => {
            p.advance();
        });
    }

    paint(ctx2d, frame) {
        let localFrame = frame - this.startFrame;
        if (localFrame < 0) {
            return;
        }
        ctx2d.textAlign = 'center';
        ctx2d.textBaseline = 'middle';
        ctx2d.font = this.textSize + " 'Hiragino Sans', HiraginoSans-W3, Meiryo";
        if (localFrame < this.duration - this.particleFrameLength) {
            ctx2d.fillStyle = this.textColor(localFrame);
            ctx2d.fillText(this.text, this.x, this.y);
        } else {
            ctx2d.fillStyle = this.particleColor(localFrame - (this.duration - this.particleFrameLength));
            this.particles.forEach((p) => {
                ctx2d.fillRect(p.x, p.y, 2, 2);
            });
        }
    }

    createParticles() {
        textCanvasCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
        textCanvasCtx.font = this.textSize + " 'Hiragino Sans', HiraginoSans-W3, Meiryo";
        textCanvasCtx.fillText(this.text, this.x, this.y);

        let pixels = textCanvasCtx.getImageData(0, 0, textCanvas.width, textCanvas.height).data;

        let particles = [];
        for (let y = 0; y < textCanvas.height; y++) {
            for (let x = 0; x < textCanvas.width; x++) {
                if (y % 2 || x % 2) {
                    continue;
                }
                if (pixels[(y * textCanvas.width + x) * 4 + 3] > 0) {
                    particles.push(new Particle(x, y));
                }
            }
        }
        return particles;
    }

    textColor(textFrame) {
        if (textFrame < this.textFadeFrameLength) {
            let alpha = textFrame / this.textFadeFrameLength;
            return Color.rgba(this.rgbColor.r, this.rgbColor.g, this.rgbColor.b, alpha);
        } else {
            return this.color;
        }
    }

    particleColor(particleFrame) {
        let alpha = (this.particleFrameLength - particleFrame) / this.particleFrameLength;
        return Color.rgba(this.rgbColor.r, this.rgbColor.g, this.rgbColor.b, alpha);
    }
}

class Particle {

    get x() {
        return this.p.x;
    }

    get y() {
        return this.p.y;
    }

    constructor(x, y) {
        this.p = new Vector(x, y);
        this.a = new Vector(0, 0);
        this.v = new Vector(0, 0);
        this.FRICTION = new Vector(0.88, 0.88);
    }

    advance() {
        this.a.x = (MersenneTwister.nextNumber() - 0.5) * 0.8;
        this.a.y = (MersenneTwister.nextNumber() - 0.5) * 0.8;

        this.v.add(this.a);
        this.v.multiply(this.FRICTION);

        this.p.add(this.v);
    }
}
