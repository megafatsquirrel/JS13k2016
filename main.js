// TODO tasklist
// create game work flow, turned based combat
// create game piece interactions (move, attack, special abilities)
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
	var GAME_PIECE_DEFAULT_COLOR_NPC = '#ffc107';
	var GAME_PIECE_HIGHLIGHT_COLOR_NPC = '#ffedb6';
	var GAME_PIECE_DEFAULT_COLOR_PC = '#d40dcb';
	var GAME_PIECE_HIGHLIGHT_COLOR_PC = '#f7abf3';
	var HIGHLIGHT_COLOR_MOVE = 'rgba(128, 145, 241, 0.6)';
	var HIGHLIGHT_COLOR_ATTACK = 'rgba(251, 34, 34, 0.6)';

	var gameRound = 0;

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
	var gameMapOverlay = gameMap;
	// setup game objects
	var weapon1 = { name: 'dagger', damage: 2 };
	var armor1 = { name: 'rags', defense: 1 };
	var gamePieceGoblin = createGamePiece(gameMap[0][0].left, gameMap[0][0].top, TILE_WIDTH, TILE_HEIGHT, 
									GAME_PIECE_DEFAULT_COLOR_NPC, 'goblin', {x: 0, y: 0}, 'Goblin', 2, 4, weapon1, armor1, 5, true);
	gameMap[0][0].occupied = true;
	gameMap[0][0].occupiedType = gamePieceGoblin.type;
	gameMap[0][0].gamePieceId = gamePieceGoblin.id;

	var gamePieceHero = createGamePiece(gameMap[1][1].left, gameMap[1][1].top, TILE_WIDTH, TILE_HEIGHT, 
									GAME_PIECE_DEFAULT_COLOR_PC, 'hero', {x: 1, y: 1}, 'Hero', 12, 4, weapon1, armor1, 0, false);

	gameMap[1][1].occupied = true;
	gameMap[1][1].occupiedType = gamePieceHero.type;
	gameMap[1][1].gamePieceId = gamePieceHero.id;
	var gameObjects = new Array(gamePieceGoblin, gamePieceHero);

	function createGamePiece(left, top, width, height, color, id, location, name, health, movement, weapon, armor, exp, isNPC) {
		// TODO refactor this into a base case for all pieces
		// TODO find a way to enforce a unique id
		var temp = {
			left: left,
			top: top,
			width: width,
			height: height,
			color: color,
			hasMoved: false,
			hasAttacked: false,
			id: id,
			location: location, //1|2
			name: name,
			health: health,
			movement: movement,
			currentHP: health,
			weapon: weapon,
			armor: armor,
			attack: weapon.damage * 1, // TODO Add a dynamic mod for game piece type
			attackRange: 2,
			defense: armor.defense * 1, // TODO Add a dynamic mod for game piece type
			exp: exp,
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
			isHighlightMove: false,
			isHighlightAttack: false,
			occupied: false,
			occupiedType: '',
			type: 'NORMAL'
		};

		return temp;
	}

	var gamePieceInfoCard = document.getElementById('gamePieceInfoCard');
	var gamePieceName = document.getElementById('gamePieceName');
	var gamePieceHealth = document.getElementById('gamePieceHealth');
	var gamePieceExp = document.getElementById('gamePieceExp');
	var gamePieceAttack = document.getElementById('gamePieceAttack');
	var gamePieceDefense = document.getElementById('gamePieceDefense');
	var gamePieceWeapon = document.getElementById('gamePieceWeapon');
	var gamePieceArmor = document.getElementById('gamePieceArmor');
	var gamePieceMovement = document.getElementById('gamePieceMovement');
	var gamePieceHasMoved = document.getElementById('gamePieceHasMoved');
	var gamePieceInfoDisplay = document.getElementById('gamePieceInfoDisplay');
	var gamePieceInfoDisplayDefault = document.getElementById('gamePieceInfoDisplayDefault');
	var gamePieceHasAttacked = document.getElementById('gamePieceHasAttacked');
	var currentRound = document.getElementById('currentRound');

	var endTurnBtn = document.getElementById('endTurnBtn');

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

			if ( clickX >= 0 && clickX <= (TILE_WIDTH * MAP_WIDTH) && clickY >= 0 && clickY <= (TILE_HEIGHT * MAP_HEIGHT) ) {
				var indexX = parseInt(clickX / TILE_WIDTH);
				var indexY = parseInt(clickY / TILE_HEIGHT);
				if (indexX >= 0 && indexY >= 0 && indexX <= MAP_WIDTH && indexY <= MAP_HEIGHT) {
					var mapTile = gameMap[indexX][indexY];
					if (mapTile !== undefined && mapTile.occupied && !mapTile.isHighlightAttack) {
						gameObjects.forEach(function(item) {
							if (item.id === mapTile.gamePieceId) {
								selectGamePiece(item);
							}
						});
					}else if (currentSelectedTile !== null){ // clicked outside of the occupied square
						// attack piece
						if (!currentSelectedTile.hasAttacked && mapTile.occupied && mapTile.isHighlightAttack && currentSelectedTile.type === 'PC'){
							for (var i = 0; i < gameObjects.length; i++) {
								var enemy = gameObjects[i];
								if (mapTile.gamePieceId === enemy.id){
									if (enemy.type === 'NPC'){
										var damage = currentSelectedTile.attack;
										// TODO handle death and giving XP
										enemy.currentHP -= damage;
										if (enemy.currentHP <= 0){
											currentSelectedTile.exp += enemy.exp;
											gameObjects.splice(i, 1);
										}
										currentSelectedTile.hasMoved = true;
										currentSelectedTile.hasAttacked = true;
										showDamageNumber(enemy, damage);
									}
								}
							}
						}

						// move piece
						if (!currentSelectedTile.hasMoved && !mapTile.occupied && mapTile.isHighlightMove && currentSelectedTile.type === 'PC'){
							for (var i = 0; i < gameObjects.length; i++) {
								if (currentSelectedTile.id === gameObjects[i].id){
									var currentGamePiece = gameObjects[i];
									currentGamePiece.left = gameMap[indexX][indexY].left;
									currentGamePiece.top = gameMap[indexX][indexY].top;
									gameMap[currentGamePiece.location.x][currentGamePiece.location.y].occupied = false;
									gameMap[currentGamePiece.location.x][currentGamePiece.location.y].occupiedType = '';
									gameMap[currentGamePiece.location.x][currentGamePiece.location.y].gamePieceId = '';
									currentGamePiece.location = {x: indexX, y: indexY};
									gameMap[indexX][indexY].occupied = true;
									gameMap[indexX][indexY].occupiedType = currentGamePiece.type;
									gameMap[indexX][indexY].gamePieceId = currentGamePiece.id;
									gameObjects[i].hasMoved = true;
									currentSelectedTile = currentGamePiece;
								}
							}
						}

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
		});

		endTurnBtn.addEventListener('click', function(e){
			// TODO add enemy logic here

			for (var i = 0; i < gameObjects.length; i++) {
				gameObjects[i].hasMoved = false;
				gameObjects[i].hasAttacked = false;
			}
			gameRound++;
			currentRound.innerHTML = gameRound;
		});
	}

	function selectGamePiece(gamePiece){
		if (currentSelectedTile !== null){
			deselectGamePiece(currentSelectedTile);
		}

		currentSelectedTile = gamePiece;
		gamePiece.color = gamePiece.type === 'PC' ? GAME_PIECE_HIGHLIGHT_COLOR_PC : GAME_PIECE_HIGHLIGHT_COLOR_NPC;



		gamePieceName.innerHTML = gamePiece.name;
		gamePieceHealth.innerHTML = gamePiece.currentHP + " / " + gamePiece.health;
		
		if (gamePiece.type === 'PC') {
			gamePieceExp.innerHTML = gamePiece.exp;	
			gamePieceMovement.innerHTML = gamePiece.movement;
			gamePieceAttack.innerHTML = gamePiece.attack;
			gamePieceDefense.innerHTML = gamePiece.defense;
			gamePieceWeapon.innerHTML = gamePiece.weapon.name;
			gamePieceArmor.innerHTML = gamePiece.armor.name;
			gamePieceHasMoved.innerHTML = gamePiece.hasMoved;
			gamePieceHasAttacked.innerHTML = gamePiece.hasAttacked;
		}
		
		gamePieceInfoDisplay.style.display = 'block';
		gamePieceInfoDisplayDefault.style.display = 'none';

		if (gamePiece.type === 'PC'){
			if (!gamePiece.hasMoved)
				highlightMoveAttackArea(gamePiece, gamePiece.movement, false);
			if (!gamePiece.hasAttacked)
				highlightMoveAttackArea(gamePiece, gamePiece.attackRange, true);
		}
	}

	function highlightMoveAttackArea(gamePiece, actionLength, isAttack) {
		var rightTile;
		var leftTile;
		var topTile;
		var downTile;
		for(var i = 1; i <= actionLength; i++){
			// right
			if (gamePiece.location.x + i < MAP_WIDTH){
				rightTile = gameMap[gamePiece.location.x + i][gamePiece.location.y];
				checkTileMoveAttack(rightTile, gamePiece, isAttack);
				selectSideTiles(gamePiece, actionLength - i, gamePiece.location.x + i, false, isAttack);
			}
			// left
			if (gamePiece.location.x - i >= 0){
				leftTile = gameMap[gamePiece.location.x - i][gamePiece.location.y];
				checkTileMoveAttack(leftTile, gamePiece, isAttack);
				selectSideTiles(gamePiece, actionLength - i, gamePiece.location.x - i, true, isAttack);
			}
			// top
			if (gamePiece.location.y - i >= 0){
				topTile = gameMap[gamePiece.location.x][gamePiece.location.y - i];
				checkTileMoveAttack(topTile, gamePiece, isAttack);
				selectDownTiles(gamePiece, actionLength - i, gamePiece.location.y - i, true, isAttack);
			}
			// down
			if (gamePiece.location.y + i < MAP_HEIGHT){
				downTile = gameMap[gamePiece.location.x][gamePiece.location.y + i];
				checkTileMoveAttack(downTile, gamePiece, isAttack);
				selectDownTiles(gamePiece, actionLength - i, gamePiece.location.y + i, false, isAttack);
			}
		}
	}

	function selectSideTiles(gamePiece, movement, index, reverse, isAttack){
		for(var i = 1; i <= movement; i++){
			if (!reverse){
				if (gamePiece.location.y + i < MAP_HEIGHT){
					var tile = gameMap[index][gamePiece.location.y + i];
					checkTileMoveAttack(tile, gamePiece, isAttack);
				}
			}else{
				if (gamePiece.location.y - i >= 0){
					var tile = gameMap[index][gamePiece.location.y - i];
					checkTileMoveAttack(tile, gamePiece, isAttack);
				}
			}
		}
	}

	function selectDownTiles(gamePiece, movement, index, reverse, isAttack){
		for(var i = 1; i <= movement; i++){
			if (!reverse){
				if (gamePiece.location.x - i >= 0){
					var tile = gameMap[gamePiece.location.x - i][index];
					checkTileMoveAttack(tile, gamePiece, isAttack);
				}
			}else{
				if (gamePiece.location.x + i < MAP_WIDTH){
					var tile = gameMap[gamePiece.location.x + i][index];
					checkTileMoveAttack(tile, gamePiece, isAttack);
				}
			}
		}
	}

	function checkTileMoveAttack(tile, gamePiece, isAttack) {
		if (!tile.occupied && !isAttack){
			tile.isHighlightMove = true;
		}else{
			tile.isHighlightAttack = true;
		}
	}

	function deselectGameMapTiles() {
		for (var i = 0; i < MAP_WIDTH; i++){
			for (var j = 0; j < MAP_HEIGHT; j++){
				if (gameMap[i][j].isHighlightMove || gameMap[i][j].isHighlightAttack) {
					gameMap[i][j].isHighlightMove = false;
					gameMap[i][j].isHighlightAttack = false;
				}
			}
		}
	}

	function deselectGamePiece(gamePiece){
		currentSelectedTile = null;
		gamePiece.color = gamePiece.type === 'PC' ? GAME_PIECE_DEFAULT_COLOR_PC : GAME_PIECE_DEFAULT_COLOR_NPC;
		gamePieceInfoDisplay.style.display = 'none';
		gamePieceInfoDisplayDefault.style.display = 'block';
		deselectGameMapTiles();
	}

	var numberOverlay = null;
	var numberOverlayTimeoutId = null;
	function showDamageNumber(gamePiece, damage) {
		numberOverlay = {
			x: gamePiece.location.x + MAP_OFFSET_LEFT,
			y: gamePiece.location.y + MAP_OFFSET_TOP,
			damage: damage
		};

		numberOverlayTimeoutId = window.setTimeout(function() {
			numberOverlay = null;
			this.clearTimeout(numberOverlayTimeoutId);
		}, 1000);
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
				ctx.fillStyle = gameMap[i][j].color;
				
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

		// draw overlay
		for (var i = 0; i < MAP_WIDTH; i++){
			for (var j = 0; j < MAP_HEIGHT; j++){
				if (gameMap[i][j].isHighlightAttack || gameMap[i][j].isHighlightMove){

					if (gameMap[i][j].isHighlightMove)
						ctx.fillStyle = HIGHLIGHT_COLOR_MOVE;
					if (gameMap[i][j].isHighlightAttack)
						ctx.fillStyle = HIGHLIGHT_COLOR_ATTACK;
					
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
		}

		// show damage number 
		if (numberOverlay !== null) {
			ctx.font = '48px serif';
			ctx.fillStyle = '#000';
  			ctx.fillText('-' + numberOverlay.damage, numberOverlay.x, numberOverlay.y);
		}
	}

	function logic(){
		
	}

	function gameLoop(){

		logic();
		render();
		requestAnimationFrame(gameLoop);		
	}

	createInputEvents();
	requestAnimationFrame(gameLoop);
});