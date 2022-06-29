import { Tile, Maze } from './maze-generator.js';

function main(type) {
	const range = (min, max) => (Math.random() * (max - min) | 0) + min;
	// const maze = new Maze(32, 32);
	const maze = new Maze(range(32, 64), range(32, 64));

	try {
		maze.build(type);
		maze.heightMap();
	} catch (e) { console.error('build error:' + e.stack) }

	const flag = document.createDocumentFragment();
	for (let y = 0; y < maze.height; ++y)
		for (let x = 0; x < maze.width; ++x) {
			const grid = toGrid(maze.get(x, y));

			if (grid) {
				const span = document.createElement('span');
				span.style.color = grid.color;
				span.textContent = grid.char;
				flag.appendChild(span);
			}
			else
				flag.appendChild(document.createTextNode(' '));
			if (x == maze.width - 1)
				flag.appendChild(document.createElement('br'));
		}

	const mainScreen = document.getElementById('screen');
	mainScreen.textContent = '';
	mainScreen.appendChild(flag);
}

addEventListener('load', () => {
	const mazeType = document.getElementById('maze-type');
	mazeType.addEventListener('change', e => main(e.target.value));
	document.getElementById('update').addEventListener('click', e => main(mazeType.value));
	main();
});

function toGrid(grid) {
	if (grid & Tile.Door) return { char: '＋', color: 'brown' };
	if (grid & Tile.Grass) return { char: 'ｗ', color: 'lightgreen' };
	if (grid & Tile.Water) return { char: 'ｗ', color: 'deepskyblue' };
	if (grid & Tile.Room) return { char: '．', color: 'white' };
	if (grid & Tile.Route) return { char: '＃', color: 'white' };
	if (grid & Tile.Border) return { char: '■', color: 'gray' };
	return { char: '■', color: 'white' };
}
