import Random from '/src/random.js';
import * as Tile from '/src/tile-types.js';
import * as Room from '/src/room/build.js';

export default function splitRegion(maze, x1, y1, x2, y2, depth = 0) {
	if (depth > 3)
		return readyRoom(maze, x1, y1, x2, y2);

	const v = Math.random();
	const w = x2 - x1;
	const h = y2 - y1;

	if (w >= h) {
		if (w < 15)
			return readyRoom(maze, x1, y1, x2, y2);

		const border = ((w - 10) * v | 0) + 5 + x1;
		const room1 = splitRegion(maze, x1, y1, border, y2, depth + 1);
		const room2 = splitRegion(maze, border, y1, x2, y2, depth + 1);

		for (let y = y1; y <= y2; ++y)
			maze.field[y][border] |= Tile.Border;

		return connectRoom(maze, room1, room2, border, Room.Direction.Horizon);
	} else {
		if (h < 15)
			return readyRoom(maze, x1, y1, x2, y2);

		const border = ((h - 10) * v | 0) + 5 + y1;
		const room1 = splitRegion(maze, x1, y1, x2, border, depth + 1);
		const room2 = splitRegion(maze, x1, border, x2, y2, depth + 1);

		for (let x = x1; x <= x2; ++x)
			maze.field[border][x] |= Tile.Border;

		return connectRoom(maze, room1, room2, border, Room.Direction.Vertical);
	}
}

function readyRoom(maze, x1, y1, x2, y2) {
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
		x1 += Random.int(w - ww);
		x2 = x1 + ww;
		w = ww;
	}
	if (h - ROOM_WIDTH > 0) {
		const wh = Random.range(ROOM_WIDTH, h);
		y1 += Random.int(h - wh);
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

	Room.build(maze.field, x1, y1, x2, y2);

	return maze.addRoom(new Room.Data(x1, y1, x2, y2));
}

function connectRoom(maze, room1, room2, border, dir) {
	let node1 = maze.getRoomNode(room1);
	let node2 = maze.getRoomNode(room2);

	const nodeNo = maze.addRoomNode(new Room.Node(dir, room1, room2));
	node1.parent = nodeNo;
	node2.parent = nodeNo;

	while (node1.dir != Room.Direction.Free)
		node1 = maze.getRoomNode(node1.dir == dir ? node1.room2 : Random.coinToss() ? node1.room1 : node1.room2);
	while (node2.dir != Room.Direction.Free)
		node2 = maze.getRoomNode(node2.dir == dir ? node2.room1 : Random.coinToss() ? node2.room1 : node2.room2);
	const r1 = maze.getRoom(node1.room1);
	const r2 = maze.getRoom(node2.room1);

	let x1, x2;
	let y1, y2;

	if (dir == Room.Direction.Horizon) {
		x1 = r1.right + 1;
		x2 = r2.left - 1;
		if (x2 - x1 >= 2) {
			y1 = Random.range(r1.top, r1.bottom);
			y2 = Random.range(r2.top, r2.bottom);
		} else {
			y1 = r1.top > r2.top ? r1.top : r2.top;
			y2 = r1.bottom < r2.bottom ? r1.bottom : r2.bottom;
			y1 = y2 = Random.range(y1, y2);
		}
		maze.field[y1][x1] |= Tile.Route | Tile.Door;
		maze.field[y2][x2] |= Tile.Route | Tile.Door;
		++x1;
		--x2;
		for (let x = x1; x <= border; ++x)
			maze.field[y1][x] |= Tile.Route;
		for (let x = border; x <= x2; ++x)
			maze.field[y2][x] |= Tile.Route;
		if (y1 > y2)
			[y1, y2] = [y2, y1];
		for (let y = y1; y <= y2; ++y)
			maze.field[y][border] |= Tile.Route | Tile.Border;
	} else if (dir == Room.Direction.Vertical) {
		y1 = r1.bottom + 1;
		y2 = r2.top - 1;
		if (y2 - y1 >= 2) {
			x1 = Random.range(r1.left, r1.right);
			x2 = Random.range(r2.left, r2.right);
		} else {
			x1 = r1.left > r2.left ? r1.left : r2.left;
			x2 = r1.right < r2.right ? r1.right : r2.right;
			x1 = x2 = Random.range(x1, x2);
		}
		maze.field[y1][x1] |= Tile.Route | Tile.Door;
		maze.field[y2][x2] |= Tile.Route | Tile.Door;
		++y1;
		--y2;
		for (let y = y1; y <= border; ++y)
			maze.field[y][x1] |= Tile.Route;
		for (let y = border; y <= y2; ++y)
			maze.field[y][x2] |= Tile.Route;
		if (x1 > x2)
			[x1, x2] = [x2, x1];
		for (let x = x1; x <= x2; ++x)
			maze.field[border][x] |= Tile.Route | Tile.Border;
	}

	r1.connectedRoom.push(r2);
	r2.connectedRoom.push(r1);

	return nodeNo;
}
