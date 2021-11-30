import * as Tile from '/src/tile-types.js';

export const Direction = {
	Free: 0,
	Horizon: 1,
	Vertical: 2
};

export class Data {
	constructor(left, top, right, bottom) {
		this.left = left;
		this.top = top;
		this.right = right;
		this.bottom = bottom;
		this.connectedRoom = [];
		this.step = -1;
	}
}

export class Node {
	constructor(dir, room1, room2 = -1, parent = -1) {
		this.dir = dir;
		this.room1 = room1;
		this.room2 = room2;
		this.parent = parent;
	}
}

export function build(field, x1, y1, x2, y2) {
	for (let y = y1; y <= y2; ++y)
		for (let x = x1; x <= x2; ++x)
			field[y][x] |= Tile.Route | Tile.Room;
}
