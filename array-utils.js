import MersenneTwister from './mersenne-twister.js'

export default class ArrayUtils {

    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(MersenneTwister.nextNumber() * (i + 1));
            let t = array[i];
            array[i] = array[j];
            array[j] = t;
        }
        return array;
    }
}
