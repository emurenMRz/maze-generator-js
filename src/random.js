export default class Random {
	static int(max) { return Math.random() * (1 + max) | 0; }
	static range(min, max) { return min + this.int(max - min); }
	static p(percent) { return this.range(0, 99) < percent; }
	static coinToss() { return Math.random() < .5; }
}
