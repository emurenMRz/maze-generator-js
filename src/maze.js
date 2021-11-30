import * as Room from './room/build.js';
import SplitterRough from './region-splitter/rough.js';
import Splitter from './region-splitter/standard.js';

export default class Maze {
	#width = 0;
	#height = 0;
	#field = null;

	#rooms = [];
	#roomTree = [];

	constructor(width, height) {
		this.#width = width;
		this.#height = height;
		this.#field = new Array(height);
		for (let y = 0; y < height; ++y)
			this.#field[y] = new Array(width);
	}

	get width() { return this.#width; }
	get height() { return this.#height; }
	get field() { return this.#field; }
	get(x, y) { return this.#field[y][x]; }
	at(offset) { return this.#field[offset / this.#width | 0][offset % this.#width]; }

	build(type) {
		this.#rooms = [];
		this.#roomTree = [];

		for (let y = 0; y < this.#height; ++y)
			for (let x = 0; x < this.#width; ++x)
				this.#field[y][x] = 0;

		switch (type) {
			case 'rough': SplitterRough(this, 0, 0, this.#width - 1, this.#height - 1); break;
			default: Splitter(this, 0, 0, this.#width - 1, this.#height - 1); break;
		}
	}

	getRoom(no) { return this.#rooms[no]; }
	addRoom(room) {
		const no = this.#rooms.length;
		this.#rooms.push(room);
		return this.addRoomNode(new Room.Node(Room.Direction.Free, no));
	}

	getRoomNode(no) { return this.#roomTree[no]; }
	addRoomNode(roomNode) {
		const nodeNo = this.#roomTree.length;
		this.#roomTree.push(roomNode);
		return nodeNo;
	}
}
