import Audio from './audio.js'
import Engine from './engine.js'
import SceneRenderer from './scene-renderer.js'
import Title from './title.js'
import EmfSpriteRenderer from "./emf-sprite-renderer.js";
import RoundRectRenderer from "./round-rect-renderer.js";
import LabelRenderer from "./label-renderer.js";
import Assets from "./assets.js";

Audio.init();
Engine.init(window.innerWidth, window.innerHeight, 2);
Engine.addRenderer(new SceneRenderer());
Engine.addRenderer(new EmfSpriteRenderer());
Engine.addRenderer(new RoundRectRenderer());
Engine.addRenderer(new LabelRenderer());

Assets.loadFont('gamefont', './font/FjallaOne-Regular.ttf')
    .then(() => {
        return Engine.changeScene('title', new Title());
    });
