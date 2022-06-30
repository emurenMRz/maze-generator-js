export default class Random {
	static get value() { return Math.random(); }
	static get coinToss() { return this.value < .5; }
	static int0(max) { return this.value * max | 0; }
	static int1(max) { return this.int0(1 + max); }
	static range(min, max) { return min + this.int1(max - min); }
	static P(percent) { return this.range(0, 99) < percent; }

	static shuffle(array) {
		for (let i = 0; i < array.length; ++i) {
			const j = this.int0(array.length);
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}
	static randomValue(array) { return array[this.int0(array.length)]; }
}
