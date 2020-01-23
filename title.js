import Scene from './scene.js'
import Assets from './assets.js'
import Engine from './engine.js'
import Stage from './stage.js'
import EmfSprite from "./emf-sprite.js";
import Emf from "./emf.js";
import Repository from "./repository.js";
import LevelProgress from "./level-progress.js";
import LevelSelect from "./level-select.js";
import Audio from "./audio.js";

export default class Title extends Scene {

    constructor(props) {
        super(props);
    }

    async init() {
        super.init();
        await Promise.all(
            [
                Assets.loadRaw('./drawable/ship.emf').then((data) => {
                    let emf = new EmfSprite(new Emf(data), this.width - 20, this.height, true);
                    emf.left = (this.width - emf.width) / 2;
                    emf.top = 360;
                    this.addChild(emf);
                }),
                Assets.loadRaw('./drawable/title.emf').then((data) => {
                    let emf = new EmfSprite(new Emf(data), this.width - 20, this.height, true);
                    emf.left = (this.width - emf.width) / 2;
                    emf.top = 70;
                    this.addChild(emf);
                }),
                Assets.loadRaw('./drawable/start.emf').then((data) => {
                    let emf = new EmfSprite(new Emf(data), 200, 70, true);
                    emf.left = (this.width - emf.width) / 2;
                    emf.top = 180;
                    emf.order = 2;
                    emf.setOnClickListener(() => {
                        this.doStart();
                    });
                    this.addChild(emf);
                }),
                Assets.loadRaw('./drawable/continue.emf').then((data) => {
                    let emf = new EmfSprite(new Emf(data), 200, 70, true);
                    emf.left = (this.width - emf.width) / 2;
                    emf.top = 250;
                    emf.order = 2;
                    emf.setOnClickListener(() => {
                        this.doResume();
                    });
                    this.addChild(emf);
                }),
                Assets.loadRaw('./drawable/level-select.emf').then((data) => {
                    let emf = new EmfSprite(new Emf(data), 200, 70, true);
                    emf.left = (this.width - emf.width) / 2;
                    emf.top = 320;
                    emf.order = 2;
                    emf.setOnClickListener(() => {
                        this.doLevelSelect();
                    });
                    this.addChild(emf);
                }),
                Assets.loadRaw('./drawable/sound-on.emf').then((data) => {
                    let emf = new EmfSprite(new Emf(data), 60, 60, true);
                    this.soundOn = emf;
                    emf.left = this.width / 2 + 110;
                    emf.top = 10;
                    emf.order = 2;
                    emf.visible = !Audio.isMute();
                    emf.setOnClickListener(() => {
                        Audio.setMute(true);
                        setTimeout(() => {
                            this.soundOn.visible = false;
                            this.soundMute.visible = true;
                            Engine.render();
                        }, 0);
                    });
                    this.addChild(emf);
                }),
                Assets.loadRaw('./drawable/sound-mute.emf').then((data) => {
                    let emf = new EmfSprite(new Emf(data), 60, 60, true);
                    this.soundMute = emf;
                    emf.left = this.width / 2 + 110;
                    emf.top = 10;
                    emf.order = 2;
                    emf.visible = Audio.isMute();
                    emf.setOnClickListener(() => {
                        Audio.setMute(false);
                        setTimeout(() => {
                            this.soundOn.visible = true;
                            this.soundMute.visible = false;
                            Engine.render();
                        }, 0);
                    });
                    this.addChild(emf);
                })
            ]
        );
    }

    paint(ctx2d) {
        super.paint(ctx2d);
        ctx2d.beginPath();
        let grad = ctx2d.createLinearGradient(0, 0, 0, this.height);
        grad.addColorStop(0, 'rgb(40, 83, 162)');
        grad.addColorStop(0.4667, 'rgb(191, 182, 217)');
        grad.addColorStop(0.6, 'rgb(232, 123, 161)');
        grad.addColorStop(0.6303, 'rgb(27, 67, 120)');
        grad.addColorStop(1, 'rgb(34, 83, 145)');
        ctx2d.fillStyle = grad;
        ctx2d.rect(0, 0, this.width, this.height);
        ctx2d.fill();
    }

    doStart() {
        Repository.setCurrentLevel(0);
        Audio.resume();
        Engine.changeScene('levelProgress', new LevelProgress());
    }

    doResume() {
        let level = Repository.getCurrentLevel();
        Audio.resume();
        Engine.changeScene('stage', new Stage(level, true));
    }

    doLevelSelect() {
        Audio.resume();
        Engine.changeScene('levelSelect', new LevelSelect());
    }
}
