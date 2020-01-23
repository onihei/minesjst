import Engine from "./engine.js";

let animations = [];

export default class View {

    constructor(props = {}) {
        this.id = props.id || null;
        this.left = props.left || 0;
        this.top = props.top || 0;
        this.width = props.width || 0;
        this.height = props.height || 0;
        this.order = props.order || 0;
        this.visible = props.visible || true;
        this.children = [];
        this.clickFn = null;

        this.eventToHandlerMap = {
            'click': 'handleClick',
            'contextmenu': 'handleContextMenu'
        };
        if ('ontouchstart' in window) {
            this.eventToHandlerMap = {
                "touchstart": "handleTouchStart",
                "touchmove": "handleTouchMove",
                "touchend": "handleTouchEnd",
                'contextmenu': 'handleContextMenu'
            };
        }

        this._listener = (event) => {
            let x = event.offsetX || event.layerX;
            let y = event.offsetY || event.layerY;
            if (event.touches !== undefined) {
                if (event.touches[0]) {
                    x = event.touches[0].pageX;
                    y = event.touches[0].pageY;
                } else {
                    x = event.changedTouches[0].pageX;
                    y = event.changedTouches[0].pageY;
                }
            }
            let customEvent = {
                type: event.type,
                layerX: x,
                layerY: y,
                orgEvent: event
            };
            this._handleEvent(customEvent)
        };

    }

    onDraw(ctx2d) {

    }

    paint(ctx2d) {

    }

    addChild(view) {
        if (!(view instanceof View)) {
            throw "child is not View"
        }
        this.children.push(view)
    }

    removeChild(view) {
        if (!(view instanceof View)) {
            return;
        }
        for (let i in this.children) {
            if (this.children[i] === view) {
                view.parent = null;
                this.children.splice(i, 1);
                return;
            }
        }
    }

    delegateEvents(canvas) {
        for (let key in this.eventToHandlerMap) {
            canvas.addEventListener(key, this._listener)
        }
    }

    undelegateEvents(canvas) {
        for (let key in this.eventToHandlerMap) {
            canvas.removeEventListener(key, this._listener)
        }
    }

    _handleEvent(event) {
        if (!this.visible) {
            return;
        }
        if (View.ptInRect(event.layerX, event.layerY, 0, 0, this.width, this.height)) {
            let consumed = false;
            for (let i = 0; i < this.children.length; i++) {
                let child = this.children[i];
                let customEvent = {
                    type: event.type,
                    layerX: event.layerX - child.left,
                    layerY: event.layerY - child.top,
                    orgEvent: event.orgEvent
                };
                consumed = consumed || child._handleEvent(customEvent);
            }
            if (consumed) {
                return true;
            }
            let handlerName = this.eventToHandlerMap[event.type];
            if (handlerName) {
                return this[handlerName](event);
            }
        }
        return false;
    }

    setOnClickListener(fn) {
        this.clickFn = fn;
    }

    handleClick(event) {
        if (this.clickFn) {
            this.clickFn();
        }
        return false;
    }

    handleTouchStart(event) {
        return false;
    }

    handleTouchMove(event) {
        event.orgEvent.preventDefault();
        return false;
    }

    handleTouchEnd(event) {
        return this.handleClick(event);
    }

    handleContextMenu(event) {
        event.orgEvent.preventDefault();
    }

    static ptInRect(x, y, left, top, width, height) {
        if (x < left || x >= (left + width) || y < top || y > top + height) {
            return false
        }
        return true
    }

    static animate(duration, delay, fn) {
        let start;
        let animation = {};
        let fnAnim = (timestamp) => {
            if (!start) {
                start = timestamp;
            }
            let time = timestamp - start;
            if (time - delay > duration) {
                fn(1.0);
                animations = animations.filter((anim) => anim.requestId !== animation.requestId);
                Engine.render();
            } else if (time > delay) {
                let p = (time - delay) / duration;
                fn(p);
                animation.requestId = requestAnimationFrame(fnAnim);
                Engine.render();
            } else {
                animation.requestId = requestAnimationFrame(fnAnim);
            }
        };
        animation.requestId = requestAnimationFrame(fnAnim);
        animation.sceneName = Engine.getCurrentSceneName();
        animations.push(animation);
        return animation;
    }

    static loopAnimate(fn) {
        let animation = {};
        let fnAnim = (timestamp) => {
            fn();
            animation.requestId = requestAnimationFrame(fnAnim);
            Engine.render();
        };
        animation.requestId = requestAnimationFrame(fnAnim);
        animation.sceneName = Engine.getCurrentSceneName();
        animations.push(animation);
        return animation;
    }

    static cancelAnimation(animation) {
        if (animation) {
            cancelAnimationFrame(animation.requestId);
            animations = animations.filter((anim) => anim.requestId !== animation.requestId);
        }
    }

    static cancelAnimations(filter = () => true) {
        animations.filter((anim) => filter(anim)).forEach(animation => {
            this.cancelAnimation(animation)
        })
    }
}
