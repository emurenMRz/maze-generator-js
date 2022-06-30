import Random from '/src/random.js';
import Flag from "../tile-flags.js";
import * as Room from "../room/build.js";

export default function splitRegion(maze, x1, y1, x2, y2, depth = 0) {
	if (depth > 3)
		return readyRoom(maze, x1, y1, x2, y2);

	const v = Random.value;
	const w = x2 - x1;
	const h = y2 - y1;

	if (w >= h) {
		if (w < 15)
			return readyRoom(maze, x1, y1, x2, y2);

		const border = ((w - 10) * v | 0) + 5 + x1;
		const room1 = splitRegion(maze, x1, y1, border, y2, depth + 1);
		const room2 = splitRegion(maze, border, y1, x2, y2, depth + 1);

		for (let y = y1; y <= y2; ++y)
			maze.field[y][border] |= Flag.Border;

		return connectRoom(maze, room1, room2, Room.Direction.Horizon);
	} else {
		if (h < 15)
			return readyRoom(maze, x1, y1, x2, y2);

		const border = ((h - 10) * v | 0) + 5 + y1;
		const room1 = splitRegion(maze, x1, y1, x2, border, depth + 1);
		const room2 = splitRegion(maze, x1, border, x2, y2, depth + 1);

		for (let x = x1; x <= x2; ++x)
			maze.field[border][x] |= Flag.Border;

		return connectRoom(maze, room1, room2, Room.Direction.Vertical);
	}
}

/**
 * Create a room that fits within the specified coordinates.
 * 
 * @param {*} maze 
 * @param {*} x1 
 * @param {*} y1 
 * @param {*} x2 
 * @param {*} y2 
 * @returns node-number
 */
function readyRoom(maze, x1, y1, x2, y2) {
	[x1, y1, x2, y2] = Room.adjustRect(x1, y1, x2, y2);
	Room.build(maze.field, x1, y1, x2, y2);
	return maze.addRoom(x1, y1, x2, y2);
}

/**
 * Connecting the two rooms.
 * @param {*} maze 
 * @param {*} room1 first node no
 * @param {*} room2 second node no
 * @param {*} dir 
 * @returns node-number
 */
function connectRoom(maze, room1, room2, dir) {
	let node1 = maze.getRoomNode(room1);
	let node2 = maze.getRoomNode(room2);

	const nodeNo = maze.addRoomNode(new Room.Node(dir, room1, room2));
	node1.parent = nodeNo;
	node2.parent = nodeNo;

	while (node1.dir != Room.Direction.Free)
		node1 = maze.getRoomNode(node1.dir == dir ? node1.room2 : Random.coinToss ? node1.room1 : node1.room2);
	while (node2.dir != Room.Direction.Free)
		node2 = maze.getRoomNode(node2.dir == dir ? node2.room1 : Random.coinToss ? node2.room1 : node2.room2);
	const r1 = maze.getRoom(node1.room1);
	const r2 = maze.getRoom(node2.room1);

	Room.connect(maze.field, r1, r2, dir, Flag.Door);

	return nodeNo;
}
