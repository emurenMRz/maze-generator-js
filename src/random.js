export default class Random {
	static int0(max) { return Math.random() * max | 0; }
	static int(max) { return this.int0(1 + max); }
	static range(min, max) { return min + this.int(max - min); }
	static p(percent) { return this.range(0, 99) < percent; }
	static coinToss() { return Math.random() < .5; }

	static shuffle(array) {
		for (let i = 0; i < array.length; ++i) {
			const j = this.int0(array.length);
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}
	static randomChoice(array) { return array[this.int0(array.length)]; }
}
