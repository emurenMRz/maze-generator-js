import * as Tile from './tile-types.js';
import * as Room from './room/build.js';
import SplitterRough from './region-splitter/rough.js';
import Splitter from './region-splitter/standard.js';
import SplitterClassic from './region-splitter/classic.js';
import PerlinNoise from './perlin-noise.js';

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
		this.clear();

		switch (type) {
			case 'rough': SplitterRough(this, 0, 0, this.#width - 1, this.#height - 1); break;
			case 'classic': SplitterClassic(this, 0, 0, this.#width - 1, this.#height - 1); break;
			default: Splitter(this, 0, 0, this.#width - 1, this.#height - 1); break;
		}
	}

	heightMap(wScale = 4, hScale = 4, upBorder = .25, upTile = Tile.Grass, downBorder = -.25, downTile = Tile.Water) {
		const table = PerlinNoise.makePermutation;
		for (let y = 0; y < this.#height; ++y)
			for (let x = 0; x < this.#width; ++x)
				if (this.#field[y][x] & (Tile.Route | Tile.Room)) {
					const n = PerlinNoise.octaveValue(table, x / this.#width * wScale, y / this.#height * hScale, 0, 4);
					if (n > upBorder) this.#field[y][x] |= upTile;
					else if (n < downBorder) this.#field[y][x] |= downTile;
				}
	}

	clear() {
		this.#rooms = [];
		this.#roomTree = [];
		for (let y = 0; y < this.#height; ++y)
			for (let x = 0; x < this.#width; ++x)
				this.#field[y][x] = 0;
	}

	getRoom(id) { return this.#rooms[id]; }
	addRoom(x1, y1, x2, y2) {
		const id = this.#rooms.length;
		this.#rooms.push(new Room.Data(id, x1, y1, x2, y2));
		return this.addRoomNode(new Room.Node(Room.Direction.Free, id));
	}

	getRoomNode(no) { return this.#roomTree[no]; }
	addRoomNode(roomNode) {
		const nodeNo = this.#roomTree.length;
		this.#roomTree.push(roomNode);
		return nodeNo;
	}

	getRoomByNodeNo(nodeNo) {
		const node = this.getRoomNode(nodeNo);
		if (node.dir != Room.Direction.Free)
			throw new TypeError('Not room node.');
		return this.getRoom(node.room1);
	}
}
