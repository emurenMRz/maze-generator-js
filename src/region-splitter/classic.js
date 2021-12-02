import Random from '/src/random.js';
import * as Tile from '/src/tile-types.js';
import * as Room from '/src/room/build.js';

export default function splitRegion(maze, x1, y1, x2, y2) {
	const w = x2 - x1;
	const h = y2 - y1;

	const cellW = w / 3 | 0;
	const cellH = h / 3 | 0;

	const borderV1 = x1 + cellW;
	const borderV2 = x2 - cellW;
	const borderH1 = y1 + cellH;
	const borderH2 = y2 - cellH;

	const regions = [
		[x1, y1, borderV1, borderH1],
		[borderV1, y1, borderV2, borderH1],
		[borderV2, y1, x2, borderH1],
		[x1, borderH1, borderV1, borderH2],
		[borderV1, borderH1, borderV2, borderH2],
		[borderV2, borderH1, x2, borderH2],
		[x1, borderH2, borderV1, y2],
		[borderV1, borderH2, borderV2, y2],
		[borderV2, borderH2, x2, y2],
	];

	for (; ;)
		try {
			for (let x = x1; x <= x2; ++x) {
				maze.field[borderH1][x] |= Tile.Border;
				maze.field[borderH2][x] |= Tile.Border;
			}
			for (let y = y1; y <= y2; ++y) {
				maze.field[y][borderV1] |= Tile.Border;
				maze.field[y][borderV2] |= Tile.Border;
			}

			connectAllRooms(maze, setupRooms(maze, regions));
			break;
		} catch (e) {
			console.debug(e.stack);
			maze.clear();
		}
}

/**
 * Set up a room in each of the divided cells.
 * @param {*} maze 
 * @param {*} regions 
 * @returns 
 */
function setupRooms(maze, regions) {
	// cell no:
	//  0|1|2
	//  -+-+-
	//  3|4|5
	//  -+-+-
	//  6|7|8
	const cells = Random.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]);

	// There are up to four cells with no rooms.
	cells.length = Random.range(cells.length - 4, cells.length);

	const horizonGroup = [
		[1, 2], [0, 2], [0, 1],
		[4, 5], [3, 5], [3, 4],
		[7, 8], [6, 8], [6, 7],
	];
	const connectionTarget = [
		[[1, 2], [3, 6]], [[0], [2], [4, 7]], [[1, 0], [5, 8]],
		[[4, 5], [0], [6]], [[3], [5], [1], [7]], [[4, 3], [2], [8]],
		[[7, 8], [3, 0]], [[6], [8], [4, 1]], [[7, 6], [5, 2]],
	];

	const rooms = {};
	for (const no of cells) {
		const region = regions[no];
		const nodeNo = readyRoom(maze, region[0], region[1], region[2], region[3]);
		const data = maze.getRoomByNodeNo(nodeNo);
		rooms[no] = {
			cellNo: no,
			id: data.id,
			data,
			horizonGroup: horizonGroup[no],
			connectionTarget: connectionTarget[no]
		};
	}
	return rooms;
}

/**
 * Create a room that fits within the specified coordinates.
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
 * Connecting the all rooms.
 * @param {*} maze 
 * @param {*} rooms 
 */
function connectAllRooms(maze, rooms) {
	const targetChoice = (rooms, room) => {
		const result = [];
		let connectedAlready = false;
		for (const target of room.connectionTarget)
			for (const cellNo of target)
				if (cellNo in rooms) {
					const targetRoom = rooms[cellNo];
					if (!targetRoom.data.isConnected(room.data.id))
						result.push({ cellNo, id: targetRoom.id });
					else connectedAlready = true;
					break;
				}
		if (!result.length) {
			if (connectedAlready)
				return undefined;
			throw new TypeError('No connection cell.');
		}
		return Random.randomChoice(result);
	};
	const connect = room => {
		const choice = targetChoice(rooms, room);
		if (!choice)
			return false;
		const dir = (room.horizonGroup.indexOf(choice.cellNo) != -1) ? Room.Direction.Horizon : Room.Direction.Vertical;
		connectRoom(maze, room.id, choice.id, dir);
		// console.debug(`connect cell: ${room.cellNo} - ${choice.cellNo}`);
		return true;
	};

	// console.groupCollapsed('classic field');
	for (const room of Object.values(rooms))
		connect(room);
	// console.groupEnd();

	// Measures for unconnected room groups.
	const searchCellByRoomId = id => {
		for (const room of Object.values(rooms))
			if (id == room.data.id)
				return room.cellNo;
		throw new RangeError('Not found cell.')
	};
	const recursiveConnection = (group, data) => {
		for (const id of data.connectedRoom) {
			const cellNo = searchCellByRoomId(id);
			if (group.indexOf(cellNo) != -1)
				continue;
			group.push(cellNo);
			recursiveConnection(group, maze.getRoom(id));
		}
	};
	const initCellGroup = () => {
		const room = Object.values(rooms)[0];
		const group = [room.cellNo];
		recursiveConnection(group, room.data);
		return group;
	};

	// console.group('classic field - unconnected');
	const group = initCellGroup();
	for (const cellNo of Random.shuffle(Object.keys(rooms))) {
		if (group.indexOf(cellNo | 0) == -1) {
			const room = rooms[cellNo];
			if (!connect(room))
				continue;
			group.push(cellNo | 0);
			recursiveConnection(group, room.data);
		}
	}
	// console.groupEnd();
}

/**
 * Connecting the two rooms.
 * @param {*} maze 
 * @param {*} room1 first room id
 * @param {*} room2 second room id
 * @param {*} dir 
 */
function connectRoom(maze, room1, room2, dir) {
	let r1 = maze.getRoom(room1);
	let r2 = maze.getRoom(room2);
	let exchange = false;

	if (dir == Room.Direction.Horizon) {
		const c1 = (r1.right - r1.left) / 2 + r1.left;
		const c2 = (r2.right - r2.left) / 2 + r2.left;
		exchange = c2 < c1;
	} else if (dir == Room.Direction.Vertical) {
		const c1 = (r1.bottom - r1.top) / 2 + r1.top;
		const c2 = (r2.bottom - r2.top) / 2 + r2.top;
		exchange = c2 < c1;
	}

	if (exchange)
		[r1, r2] = [r2, r1];

	Room.connect(maze.field, r1, r2, dir);
}
