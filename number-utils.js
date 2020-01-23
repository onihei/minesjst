export default class NumberUtils {

    static split(n, ratios) {
        let sum = ratios.reduce((acc, t) => acc + t, 0);
        return ratios.map(r => n * r / sum);
    }
}
