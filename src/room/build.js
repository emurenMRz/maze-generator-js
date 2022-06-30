import Random from '/src/random.js';
import Flag from "../tile-flags.js";

export const Direction = {
	Free: 0,
	Horizon: 1,
	Vertical: 2
};

export class Data {
	constructor(id, left, top, right, bottom) {
		this.id = id;
		this.left = left;
		this.top = top;
		this.right = right;
		this.bottom = bottom;
		this.connectedRoom = [];
		this.step = -1;
	}

	isConnected(id) { return this.connectedRoom.indexOf(id) != -1; }
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
			field[y][x] |= Flag.Route | Flag.Room;
}

export function roughRoom(field, x1, y1, x2, y2) {
	for (let y = y1; y <= y2; ++y)
		for (let x = x1; x <= x2; ++x)
			if (Random.P(95))
				field[y][x] |= Flag.Route | Flag.Room;
}

/**
 * Adjusts the rectangle so that it fits within the specified coordinates.
 * @param {Number} x1 
 * @param {Number} y1 
 * @param {Number} x2 
 * @param {Number} y2 
 * @returns adjusted coordinates
 */
export function adjustRect(x1, y1, x2, y2) {
	const ROOM_WIDTH = 5;

	x1 += 2;
	y1 += 2;
	x2 -= 2;
	y2 -= 2;

	// Determine the location and size of the room in the region.
	let w = x2 - x1;
	let h = y2 - y1;

	if (w - ROOM_WIDTH > 0) {
		const ww = Random.range(ROOM_WIDTH, w);
		x1 += Random.int1(w - ww);
		x2 = x1 + ww;
		w = ww;
	}
	if (h - ROOM_WIDTH > 0) {
		const wh = Random.range(ROOM_WIDTH, h);
		y1 += Random.int1(h - wh);
		y2 = y1 + wh;
		h = wh;
	}

	// Correct the size of the room so that it is not too long either vertically or horizontally.
	if (w >= h && w > h * 3) {
		let ww = h * 3;
		let ws = (w - ww) / 2 | 0;
		x1 += ws;
		x2 = x1 + ww;
	} else if (h > w * 3) {
		let wh = w * 3;
		let ws = (h - wh) / 2 | 0;
		y1 += ws;
		y2 = y1 + wh;
	}

	return [x1, y1, x2, y2];
}

/**
 * Connecting the two rooms.
 * @param {Array[][]} field 
 * @param {Data} room1 
 * @param {Data} room2 
 * @param {Direction} dir 
 * @param {Flag} door 
 */
export function connect(field, room1, room2, dir, door = 0) {
	let x1, x2;
	let y1, y2;

	if (dir == Direction.Horizon) {
		x1 = room1.right + 1;
		x2 = room2.left - 1;
		if (x2 - x1 >= 2) {
			y1 = Random.range(room1.top, room1.bottom);
			y2 = Random.range(room2.top, room2.bottom);
		} else {
			y1 = room1.top > room2.top ? room1.top : room2.top;
			y2 = room1.bottom < room2.bottom ? room1.bottom : room2.bottom;
			y1 = y2 = Random.range(y1, y2);
		}
		field[y1][x1] |= Flag.Route | door;
		field[y2][x2] |= Flag.Route | door;
		++x1;
		--x2;
		let x = x1;
		const row1 = field[y1];
		for (; ; ++x) {
			row1[x] |= Flag.Route;
			if (row1[x] & Flag.Border)
				break;
		}
		const border = x;
		const row2 = field[y2];
		for (; x <= x2; ++x)
			row2[x] |= Flag.Route;
		if (y1 > y2)
			[y1, y2] = [y2, y1];
		for (let y = y1; y <= y2; ++y)
			field[y][border] |= Flag.Route;
	} else if (dir == Direction.Vertical) {
		y1 = room1.bottom + 1;
		y2 = room2.top - 1;
		if (y2 - y1 >= 2) {
			x1 = Random.range(room1.left, room1.right);
			x2 = Random.range(room2.left, room2.right);
		} else {
			x1 = room1.left > room2.left ? room1.left : room2.left;
			x2 = room1.right < room2.right ? room1.right : room2.right;
			x1 = x2 = Random.range(x1, x2);
		}
		field[y1][x1] |= Flag.Route | door;
		field[y2][x2] |= Flag.Route | door;
		++y1;
		--y2;
		let y = y1;
		for (; ; ++y) {
			field[y][x1] |= Flag.Route;
			if (field[y][x1] & Flag.Border)
				break;
		}
		const border = y;
		for (; y <= y2; ++y)
			field[y][x2] |= Flag.Route;
		if (x1 > x2)
			[x1, x2] = [x2, x1];
		for (let x = x1; x <= x2; ++x)
			field[border][x] |= Flag.Route;
	}

	room1.connectedRoom.push(room2.id);
	room2.connectedRoom.push(room1.id);
}