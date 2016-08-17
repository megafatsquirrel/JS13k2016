// TODO tasklist

// create event for selecting game pieces
// create game piece interactions (move, attack, special abilities)
// create game piece UI
// create game work flow, turned based combat
// create menu, start, and other screens
// create game piece classes
// create game piece monsters
// create game piece weapons
// create game piece items
// create game piece armor


document.addEventListener('DOMContentLoaded', function(e) {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var CLEAR_COLOR = '#FFFFFF';
	var GAME_PIECE_DEFAULT_COLOR = '#da4040';

	var MAP_WIDTH = 12;
	var MAP_HEIGHT = 10;
	var TILE_WIDTH = 50;
	var TILE_HEIGHT = 50;


	var TILE_GRASS = '#18da39';
	var TILE_DIRT = '#e0bd6d';

	var gameMap = [];
	createGameMap(MAP_WIDTH, MAP_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
	function createGameMap(width, height, tileWidth, tileHeight) {
		for (var i = 0; i < width; i++){
			gameMap[i] = [];
			for (var j = 0; j < height; j++){
				gameMap[i][j] = createGameTile(
					i * (TILE_WIDTH + 1) + 100,
					j * (TILE_HEIGHT + 1) + 50,
					TILE_WIDTH,
					TILE_HEIGHT,
					TILE_GRASS);
			}
		}
	}

	// setup game objects
	var gamePiece = createGamePiece(gameMap[0][0].left, gameMap[0][0].top, TILE_WIDTH, TILE_HEIGHT, GAME_PIECE_DEFAULT_COLOR, true);
	var gameObjects = new Array(gamePiece);

	function createGamePiece(left, top, width, height, color, isNPC) {
		// TODO refactor this into a base case for all pieces
		var temp = {
			left: left,
			top: top,
			width: width,
			height: height,
			color: color,
			type: isNPC ? 'NPC' : 'PC'
		};

		return temp;
	}

	function createGameTile(left, top, width, height, color, type) {
		var temp = {
			left: left,
			top: top,
			width: width,
			height: height,
			color: color,
			type: "NORMAL"
		};

		return temp;
	}

	var clientXoutput = document.getElementById('clientXoutput');
	var clientYoutput = document.getElementById('clientYoutput');
	var screenXoutput = document.getElementById('screenXoutput');
	var screenYoutput = document.getElementById('screenYoutput');
	function createInputEvents() {
		document.addEventListener("mousemove", function(e) {
			clientXoutput.innerHTML = e.clientX;
			clientYoutput.innerHTML = e.clientY;
			screenXoutput.innerHTML = e.screenX;
			screenYoutput.innerHTML = e.screenY;
		});


		document.addEventListener("mousedown", function(e) {
			// TODO clicking on a tile, checks for a game piece show game piece info
			// if empty tile or outside of game board deselect
			gameObjects[0].color = '#000000';	
		});
	}

	function clearScreen() {
		ctx.fillStyle = CLEAR_COLOR;
		ctx.fillRect(canvas.offsetLeft, canvas.offsetTop, canvas.width, canvas.height);
	}

	function render() {
		clearScreen();
		// draw map
		for (var i = 0; i < MAP_WIDTH; i++){
			for (var j = 0; j < MAP_HEIGHT; j++){
				ctx.fillStyle = gameMap[i][j].color;
				ctx.fillRect(gameMap[i][j].left, 
					gameMap[i][j].top, 
					gameMap[i][j].width, 
					gameMap[i][j].height);
			}
		}

		// draw game objects
		for (var i = 0; i < gameObjects.length; i++) {
			ctx.fillStyle = gameObjects[i].color;
			ctx.fillRect(gameObjects[i].left, 
				gameObjects[i].top, 
				gameObjects[i].width, 
				gameObjects[i].height);
		}
	}

	function logic() {
		
		// TODO add logic, maybe the smart kind...
	}

	function gameLoop() {

		logic();
		render();
		requestAnimationFrame(gameLoop);		
	}

	createInputEvents();
	requestAnimationFrame(gameLoop);
});