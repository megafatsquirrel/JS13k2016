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
	var HIGHLIGHT_COLOR = '#f5ed09';

	var MAP_WIDTH = 12;
	var MAP_HEIGHT = 10;
	var TILE_WIDTH = 50;
	var TILE_HEIGHT = 50;
	var MAP_OFFSET_LEFT = 100;
	var MAP_OFFSET_TOP = 50;

	var TILE_GRASS = '#18da39';
	var TILE_DIRT = '#e0bd6d';

	var gameMap = [];
	createGameMap(MAP_WIDTH, MAP_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
	function createGameMap(width, height, tileWidth, tileHeight) {
		for (var i = 0; i < width; i++){
			gameMap[i] = [];
			for (var j = 0; j < height; j++){
				gameMap[i][j] = createGameTile(
					i * TILE_WIDTH + MAP_OFFSET_LEFT,
					j * TILE_HEIGHT + MAP_OFFSET_TOP,
					TILE_WIDTH,
					TILE_HEIGHT,
					TILE_GRASS);
			}
		}
	}

	// setup game objects
	var weapon1 = { name: 'dagger', damage: 2 };
	var armor1 = { name: 'rags', defense: 1 };
	var gamePiece = createGamePiece(gameMap[0][0].left, gameMap[0][0].top, TILE_WIDTH, TILE_HEIGHT, 
									GAME_PIECE_DEFAULT_COLOR, 'goblin', {x: 0, y: 0}, 'Goblin', '10', 4, weapon1, armor1, true);
	gameMap[0][0].occupied = true;
	gameMap[0][0].gamePieceId = gamePiece.id;

	var gamePieceHero = createGamePiece(gameMap[2][1].left, gameMap[2][1].top, TILE_WIDTH, TILE_HEIGHT, 
									GAME_PIECE_DEFAULT_COLOR, 'hero', {x: 2, y: 1}, 'Hero', '12', 4, weapon1, armor1, true);

	gameMap[2][1].occupied = true;
	gameMap[2][1].gamePieceId = gamePieceHero.id;
	var gameObjects = new Array(gamePiece, gamePieceHero);

	function createGamePiece(left, top, width, height, color, id, location, name, health, movement, weapon, armor, isNPC) {
		// TODO refactor this into a base case for all pieces
		// TODO find a way to enforce a unique id
		var temp = {
			left: left,
			top: top,
			width: width,
			height: height,
			color: color,
			id: id,
			location: location, //1|2
			name: name,
			health: health,
			movement: movement,
			currentHP: health,
			weapon: weapon,
			armor: armor,
			attack: weapon.damage * 1, // TODO Add a dynamic mod for game piece type
			defense: armor.defense * 1, // TODO Add a dynamic mod for game piece type
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
			gamePieceId: '',
			isHighlight: false,
			occupied: false,
			type: 'NORMAL'
		};

		return temp;
	}

	var gamePieceInfoCard = document.getElementById('gamePieceInfoCard');
	var gamePieceName = document.getElementById('gamePieceName');
	var gamePieceHealth = document.getElementById('gamePieceHealth');
	var gamePieceAttack = document.getElementById('gamePieceAttack');
	var gamePieceDefense = document.getElementById('gamePieceDefense');
	var gamePieceWeapon = document.getElementById('gamePieceWeapon');
	var gamePieceArmor = document.getElementById('gamePieceArmor');
	var gamePieceMovement = document.getElementById('gamePieceMovement');

	var currentSelectedTile = null;

	var clientXoutput = document.getElementById('clientXoutput');
	var clientYoutput = document.getElementById('clientYoutput');
	var clickXoutput = document.getElementById('clickXoutput');
	var clickYoutput = document.getElementById('clickYoutput');
	function createInputEvents() {
		document.addEventListener("mousemove", function(e) {
			clientXoutput.innerHTML = e.clientX;
			clientYoutput.innerHTML = e.clientY;
		});

		document.addEventListener("mousedown", function(e) {
			var clickX = (e.clientX - (MAP_OFFSET_LEFT + canvas.parentElement.offsetLeft)) + document.scrollingElement.scrollLeft;
			var clickY = (e.clientY - (MAP_OFFSET_TOP + canvas.parentElement.offsetTop)) + document.scrollingElement.scrollTop;

			clickXoutput.innerHTML = clickX;
			clickYoutput.innerHTML = clickY;

			// TODO clicking on a tile, checks for a game piece show game piece info
			// Handle clicking on another game piece, deselect previous and select current

			if ( clickX >= 0 && clickX <= (TILE_WIDTH * MAP_WIDTH) && clickY >= 0 && clickY <= (TILE_HEIGHT * MAP_HEIGHT) ) {
				var indexX = parseInt(clickX / TILE_WIDTH);
				var indexY = parseInt(clickY / TILE_HEIGHT);
				if (indexX >= 0 && indexY >= 0 && indexX <= MAP_WIDTH && indexY <= MAP_HEIGHT) {
					var gamePiece = gameMap[indexX][indexY];
					if (gamePiece !== undefined && gamePiece.occupied) {
						gameObjects.forEach(function(item) {
							if (item.id === gamePiece.gamePieceId) {
								selectGamePiece(item);
							}
						});
					}else if (currentSelectedTile !== null){ // clicked outside of the occupied square
						gameObjects.forEach(function(item) {
							if (currentSelectedTile !== null && item.id === currentSelectedTile.id) {
								deselectGamePiece(item);
							}
						});
					}
				}				
			}else if (currentSelectedTile !== null){ // clicked outside of the map
				gameObjects.forEach(function(item) {
					if (currentSelectedTile !== null && item.id === currentSelectedTile.id) {
						deselectGamePiece(item);
					}
				});
			}
			
		} ) ;
	}

	function selectGamePiece(gamePiece){
		if (currentSelectedTile !== null){
			deselectGamePiece(currentSelectedTile);
		}

		currentSelectedTile = gamePiece;
		gamePiece.color = HIGHLIGHT_COLOR;
		gamePieceInfoCard.style.display = 'block';

		gamePieceName.innerHTML = gamePiece.name;
		gamePieceHealth.innerHTML = gamePiece.health + " / " + gamePiece.currentHP;
		gamePieceMovement.innerHTML = gamePiece.movement;
		gamePieceAttack.innerHTML = gamePiece.attack;
		gamePieceDefense.innerHTML = gamePiece.defense;
		gamePieceWeapon.innerHTML = gamePiece.weapon.name;
		gamePieceArmor.innerHTML = gamePiece.armor.name;

		// TODO highlight tiles for places the game piece can move
		for(var i = 1; i <= gamePiece.movement; i++){
			// right
			if (gamePiece.location.x + i <= MAP_WIDTH){
				gameMap[gamePiece.location.x + i][gamePiece.location.y].isHighlight = true;
				selectSideTiles(gamePiece, gamePiece.movement - i, gamePiece.location.x + i, false);
			}
			// left
			if (gamePiece.location.x - i >= 0){
				gameMap[gamePiece.location.x - i][gamePiece.location.y].isHighlight = true;
				selectSideTiles(gamePiece, gamePiece.movement - i, gamePiece.location.x - i, true);
			}
			// top
			if (gamePiece.location.y - i >= 0){
				gameMap[gamePiece.location.x][gamePiece.location.y - i].isHighlight = true;
				selectDownTiles(gamePiece, gamePiece.movement - i, gamePiece.location.y - i, true);
			}
			// down
			if (gamePiece.location.y + i <= MAP_HEIGHT){
				gameMap[gamePiece.location.x][gamePiece.location.y + i].isHighlight = true;
				selectDownTiles(gamePiece, gamePiece.movement - i, gamePiece.location.y + i, false);
			}
		}
	}

	function selectSideTiles(gamePiece, movement, index, reverse){
		for(var i = 1; i <= movement; i++){
			if (!reverse){
				if (gamePiece.location.y + i <= MAP_HEIGHT){
					gameMap[index][gamePiece.location.y + i].isHighlight = true;
				}
			}else{
				if (gamePiece.location.y - i >= 0){
					gameMap[index][gamePiece.location.y - i].isHighlight = true;
				}
			}
		}
	}

	function selectDownTiles(gamePiece, movement, index, reverse){
		for(var i = 1; i <= movement; i++){
			if (!reverse){
				if (gamePiece.location.x - i >= 0){				
					gameMap[gamePiece.location.x - i][index].isHighlight = true;
				}
			}else{
				if (gamePiece.location.x + i <= MAP_WIDTH){				
					gameMap[gamePiece.location.x + i][index].isHighlight = true;
				}
			}
		}
	}

	function deselectGameMapTiles() {
		for (var i = 0; i < MAP_WIDTH; i++){
			for (var j = 0; j < MAP_HEIGHT; j++){
				if (gameMap[i][j].isHighlight) {
					gameMap[i][j].isHighlight = false;
				}
			}
		}
	}

	function deselectGamePiece(gamePiece){
		currentSelectedTile = null;
		gamePiece.color = GAME_PIECE_DEFAULT_COLOR;
		gamePieceInfoCard.style.display = 'none';
		deselectGameMapTiles();
	}

	function clearScreen(){
		ctx.fillStyle = CLEAR_COLOR;
		ctx.fillRect(canvas.offsetLeft, canvas.offsetTop, canvas.width, canvas.height);
	}

	function render(){
		clearScreen();
		// draw map
		for (var i = 0; i < MAP_WIDTH; i++){
			for (var j = 0; j < MAP_HEIGHT; j++){
				ctx.fillStyle = gameMap[i][j].isHighlight ? HIGHLIGHT_COLOR : gameMap[i][j].color;
				ctx.fillRect(gameMap[i][j].left, 
					gameMap[i][j].top, 
					gameMap[i][j].width, 
					gameMap[i][j].height);

				ctx.fillStyle = '#000000';
				ctx.strokeRect(gameMap[i][j].left, 
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

	function logic(){
		
		// TODO add logic, maybe the smart kind...
	}

	function gameLoop(){

		logic();
		render();
		requestAnimationFrame(gameLoop);		
	}

	createInputEvents();
	requestAnimationFrame(gameLoop);
});