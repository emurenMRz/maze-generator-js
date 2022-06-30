import Random from '/src/random.js';
import Flag from "../tile-flags.js";
import * as Room from "../room/build.js";

export default function splitRegion(maze, x1, y1, x2, y2, depth = 0) {
	const w = x2 - x1;
	const h = y2 - y1;

	if (w < 10 || h < 10 || Random.P(depth))
		return readyRoom(maze, x1, y1, x2, y2);

	++depth;

	if (w >= h) {
		const border = Random.range(x1 + 5, x2 - 5);
		const room1 = splitRegion(maze, x1, y1, border - 1, y2, depth);
		const room2 = splitRegion(maze, border + 1, y1, x2, y2, depth);

		if (!room1 && !room2) return null;
		else if (!room1) return room2;
		else if (!room2) return room1;

		//connect
		const i = Random.range(room1[1] + 1, room1[3] - 1);
		const j = Random.range(room2[1] + 1, room2[3] - 1);
		const d = j > i ? 1 : -1;

		for (let x = room1[2]; x <= border; ++x)
			maze.field[i][x] |= Flag.Route;
		maze.field[i][room1[2]] |= Flag.Door;
		for (let x = border; x <= room2[0]; ++x)
			maze.field[j][x] |= Flag.Route;
		maze.field[j][room2[0]] |= Flag.Door;
		if (j != i)
			for (let y = i; y != j; y += d)
				maze.field[y][border] |= Flag.Route;

		return Random.coinToss ? room1 : room2;
	} else {
		const border = Random.range(y1 + 5, y2 - 5);
		const room1 = splitRegion(maze, x1, y1, x2, border - 1, depth);
		const room2 = splitRegion(maze, x1, border + 1, x2, y2, depth);

		if (!room1 && !room2) return null;
		else if (!room1) return room2;
		else if (!room2) return room1;

		//connect
		const i = Random.range(room1[0] + 1, room1[2] - 1);
		const j = Random.range(room2[0] + 1, room2[2] - 1);
		const d = j > i ? 1 : -1;

		for (let y = room1[3]; y <= border; ++y)
			maze.field[y][i] |= Flag.Route;
		maze.field[room1[3]][i] |= Flag.Door;
		for (let y = border; y <= room2[1]; ++y)
			maze.field[y][j] |= Flag.Route;
		maze.field[room2[1]][j] |= Flag.Door;
		if (j != i)
			for (let x = i; x != j; x += d)
				maze.field[border][x] |= Flag.Route;

		return Random.coinToss ? room1 : room2;
	}
}

function readyRoom(maze, x1, y1, x2, y2) {
	const width = x2 - x1;
	const height = y2 - y1;
	if (width < 4 || height < 4) {
		console.error(`failed makeRoom: width:${width}, height:${height} [${x1}, ${y1}]-[${x2}, ${y2}]`);
		return null;
	}

	const w = (width > 4) ? Random.range(4, width) : width;
	const h = (height > 4) ? Random.range(4, height) : height;
	const x = Random.range(0, width - w) + x1;
	const y = Random.range(0, height - h) + y1;
	Room.build(maze.field, x + 1, y + 1, x + w - 1, y + h - 1);
	return [x, y, x + w, y + h];
}
