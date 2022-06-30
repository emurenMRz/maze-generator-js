import Generator from './maze-generator.js';

function main(type) {
	const range = (min, max) => (Math.random() * (max - min) | 0) + min;
	const maze = new Generator.Maze(range(32, 64), range(32, 64));

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

function value2symbol(value) {
	switch (value) {
		case "rough": return Generator.BuildType.Rough;
		case "classic": return Generator.BuildType.Classic;
		case "big-room": return Generator.BuildType.BigRoom;
	}
	return Generator.BuildType.Standard;
}

addEventListener('load', () => {
	const mazeType = document.getElementById('maze-type');
	mazeType.addEventListener('change', e => main(value2symbol(e.target.value)));
	document.getElementById('update').addEventListener('click', e => main(value2symbol(mazeType.value)));
	main();
});

function toGrid(grid) {
	if (grid & Generator.Flag.Door) return { char: '＋', color: 'brown' };
	if (grid & Generator.Flag.Grass) return { char: 'ｗ', color: 'lightgreen' };
	if (grid & Generator.Flag.Water) return { char: 'ｗ', color: 'deepskyblue' };
	if (grid & Generator.Flag.Room) return { char: '．', color: 'white' };
	if (grid & Generator.Flag.Route) return { char: '＃', color: 'white' };
	if (grid & Generator.Flag.Border) return { char: '■', color: 'gray' };
	return { char: '■', color: 'white' };
}
