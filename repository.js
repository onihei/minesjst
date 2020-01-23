const prefix = 'minesjst';

export default class Repository {

    static getCurrentLevel() {
        return Number(localStorage.getItem(`${prefix}.currentLevel`) || '0');
    }

    static setCurrentLevel(level) {
        localStorage.setItem(`${prefix}.currentLevel`, level);
        localStorage.removeItem(`${prefix}.startStep`);
        this.setSteps([]);

        let reached = this.getReachedLevel();
        if (level > reached) {
            this.setReachedLevel(level);
        }
    }

    static getReachedLevel() {
        return Number(localStorage.getItem(`${prefix}.reachedLevel`) || '0');
    }

    static setReachedLevel(level) {
        localStorage.setItem(`${prefix}.reachedLevel`, level);
    }

    static getSeed() {
        return Number(localStorage.getItem(`${prefix}.seed`) || '0');
    }

    static setSeed(seed) {
        localStorage.setItem(`${prefix}.seed`, seed);
    }

    static getTimeRemaining() {
        return Number(localStorage.getItem(`${prefix}.timeRemaining`) || '0');
    }

    static setTimeRemaining(timeRemaining) {
        localStorage.setItem(`${prefix}.timeRemaining`, timeRemaining);
    }

    static setStartStep(square, seed) {
        this.setSeed(seed);
        localStorage.setItem(`${prefix}.startStep`, [square.x, square.y].join(':'));
    }

    static getStartStep() {
        let startStep = localStorage.getItem(`${prefix}.startStep`);
        if (!startStep) {
            return null;
        }
        return (startStep).split(':').map(s => Number(s));
    }

    static addStep(square) {
        let steps = this.getSteps();
        steps.push([square.x, square.y]);
        this.setSteps(steps);
    }

    static getSteps() {
        let steps = localStorage.getItem(`${prefix}.steps`);
        if (!steps) {
            return [];
        }
        return steps.split(',').map(s => {
            let v = s.split(':');
            return [Number(v[0]), Number(v[1])];
        });
    }

    static setSteps(steps) {
        let serialized = steps.map(step => step.join(':')).join(',');
        localStorage.setItem(`${prefix}.steps`, serialized);
    }
}
