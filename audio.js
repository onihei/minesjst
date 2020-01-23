let audio = null;

export default class Audio {

    constructor() {
        let AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
        this.mute = false;
        this.gainNode.gain.value = .35;
        this.audioBUfferPromiseMap = {};
        this.audioSourcePromiseMap = {};
    }

    static init() {
        audio = new Audio();
    }

    static resume() {
        audio.resume();
    }

    static load(id, arrayBuffer) {
        audio.load(id, arrayBuffer);
    }

    static play(id, option = {}) {
        audio.play(id, option);
    }

    static stop(id) {
        audio.stop(id);
    }

    static setMute(mute) {
        audio.setMute(mute);
    }

    static isMute() {
        audio.isMute();
    }

    resume() {
        this.context.resume();
    }

    load(id, arrayBuffer) {
        if (window.webkitAudioContext) {
            this.audioBUfferPromiseMap[id] = new Promise((resolve, reject) => {
                this.context.decodeAudioData(arrayBuffer.slice(0), function (buf) {
                    resolve(buf);
                });
            });
        } else {
            this.audioBUfferPromiseMap[id] = this.context.decodeAudioData(arrayBuffer.slice(0));
        }
    }

    play(id, option) {
        option = {loop: false, loopStart: 0, loopEnd: 0, ...option};
        let promise = this.audioBUfferPromiseMap[id];
        if (promise) {
            this.audioSourcePromiseMap[id] = promise.then((audioBuffer) => {
                let source = this.context.createBufferSource();
                source.loop = option.loop;
                source.loopStart = option.loopStart;
                source.loopEnd = option.loopEnd;
                source.buffer = audioBuffer;
                source.connect(this.gainNode);
                source.start();
                return source;
            });
        }
    }

    stop(id) {
        if (id) {
            this.audioSourcePromiseMap[id].then((source) => {
                if (source instanceof AudioBufferSourceNode) {
                    source.stop();
                    delete this.audioSourcePromiseMap[id];
                }
            });
        } else {
            Object.keys(this.audioSourcePromiseMap).forEach(key => {
                this.stop(key);
            });
        }
    }

    setMute(mute) {
        this.mute = mute;
        if (mute) {
            this.gainNode.gain.value = 0;
        } else {
            this.gainNode.gain.value = .35;
        }
    }

    isMute() {
        return this.mute;
    }
}
