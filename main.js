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

	var MAP_WIDTH = 10;
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
	
	function getRandomNumber(min, max) {
		return parseInt(Math.random() * (max - min) + min);
	}
	
	// setup game objects
	var weapon1 = { name: 'dagger', damage: 2 };
	var armor1 = { name: 'rags', defense: 1 };

	// enemies
	var goblinLocation1 = {x: 1, y: 1};
	var goblinLocation2 = {x: 4, y: 1};
	var goblinLocation3 = {x: 8, y: 1};

	var gamePieceGoblin = createGamePiece(gameMap[goblinLocation1.x][goblinLocation1.y].left, gameMap[goblinLocation1.x][goblinLocation1.y].top, TILE_WIDTH, TILE_HEIGHT, 
									GAME_PIECE_DEFAULT_COLOR_NPC, 'goblin', {x: goblinLocation1.x, y: goblinLocation1.y}, 'Goblin', 2, 4, weapon1, armor1, 5, true);
	var gamePieceGoblin2 = createGamePiece(gameMap[goblinLocation2.x][goblinLocation2.y].left, gameMap[goblinLocation2.x][goblinLocation2.y].top, TILE_WIDTH, TILE_HEIGHT, 
									GAME_PIECE_DEFAULT_COLOR_NPC, 'goblin2', {x: goblinLocation2.x, y: goblinLocation2.y}, 'Goblin', 2, 4, weapon1, armor1, 5, true);
	var gamePieceGoblin3 = createGamePiece(gameMap[goblinLocation3.x][goblinLocation3.y].left, gameMap[goblinLocation3.x][goblinLocation3.y].top, TILE_WIDTH, TILE_HEIGHT, 
									GAME_PIECE_DEFAULT_COLOR_NPC, 'goblin3', {x: goblinLocation3.x, y: goblinLocation3.y}, 'Goblin', 2, 4, weapon1, armor1, 5, true);
	gameMap[goblinLocation1.x][goblinLocation1.y].occupied = true;
	gameMap[goblinLocation2.x][goblinLocation2.y].occupiedType = gamePieceGoblin.type;
	gameMap[goblinLocation3.x][goblinLocation3.y].gamePieceId = gamePieceGoblin.id;
	
	// heroes
	var heroLocation1 = {x: 1, y: 8};
	var heroLocation2 = {x: 4, y: 8};
	var heroLocation3 = {x: 8, y: 8};

	var gamePieceHero = createGamePiece(gameMap[heroLocation1.x][heroLocation1.y].left, gameMap[heroLocation1.x][heroLocation1.y].top, TILE_WIDTH, TILE_HEIGHT, 
									GAME_PIECE_DEFAULT_COLOR_PC, 'hero', {x: heroLocation1.x, y: heroLocation1.y}, 'Hero', 12, 4, weapon1, armor1, 0, false);
	var gamePieceHero2 = createGamePiece(gameMap[heroLocation2.x][heroLocation2.y].left, gameMap[heroLocation2.x][heroLocation2.y].top, TILE_WIDTH, TILE_HEIGHT, 
									GAME_PIECE_DEFAULT_COLOR_PC, 'hero2', {x: heroLocation2.x, y: heroLocation2.y}, 'Hero2', 12, 4, weapon1, armor1, 0, false);
	var gamePieceHero3 = createGamePiece(gameMap[heroLocation3.x][heroLocation3.y].left, gameMap[heroLocation3.x][heroLocation3.y].top, TILE_WIDTH, TILE_HEIGHT, 
									GAME_PIECE_DEFAULT_COLOR_PC, 'hero3', {x: heroLocation3.x, y: heroLocation3.y}, 'Hero3', 12, 4, weapon1, armor1, 0, false);

	gameMap[heroLocation1.x][heroLocation1.y].occupied = true;
	gameMap[heroLocation1.x][heroLocation1.y].occupiedType = gamePieceHero.type;
	gameMap[heroLocation1.x][heroLocation1.y].gamePieceId = gamePieceHero.id;
	gameMap[heroLocation2.x][heroLocation2.y].occupied = true;
	gameMap[heroLocation2.x][heroLocation2.y].occupiedType = gamePieceHero2.type;
	gameMap[heroLocation2.x][heroLocation2.y].gamePieceId = gamePieceHero2.id;
	gameMap[heroLocation3.x][heroLocation3.y].occupied = true;
	gameMap[heroLocation3.x][heroLocation3.y].occupiedType = gamePieceHero3.type;
	gameMap[heroLocation3.x][heroLocation3.y].gamePieceId = gamePieceHero3.id;
	
	var heroPieces = new Array(gamePieceHero, gamePieceHero2, gamePieceHero3);
	var enemyPieces = new Array(gamePieceGoblin, gamePieceGoblin2, gamePieceGoblin3);

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
			attack: weapon.damage,
			attackRange: 2,
			defense: armor.defense,
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

	var enemyPhase = false;

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

			var btnX = (e.clientX - canvas.parentElement.offsetLeft) + document.scrollingElement.scrollLeft;
			var btnY = (e.clientY - canvas.parentElement.offsetTop) + document.scrollingElement.scrollTop;
			if (!gameStart && btnX >= startBtn.left && btnX <= (startBtn.left + startBtn.width) &&
				btnY >= startBtn.top && btnY <= (startBtn.top + startBtn.height)) {
				gameStart = true;
			}

			if ( clickX >= 0 && clickX <= (TILE_WIDTH * MAP_WIDTH) && clickY >= 0 && clickY <= (TILE_HEIGHT * MAP_HEIGHT) ) {
				var indexX = parseInt(clickX / TILE_WIDTH);
				var indexY = parseInt(clickY / TILE_HEIGHT);
				if (indexX >= 0 && indexY >= 0 && indexX <= MAP_WIDTH && indexY <= MAP_HEIGHT) {
					var mapTile = gameMap[indexX][indexY];
					if (mapTile !== undefined && mapTile.occupied && !mapTile.isHighlightAttack) {
						heroPieces.forEach(function(item) {
							if (item.id === mapTile.gamePieceId) {
								selectGamePiece(item);
							}
						});
						enemyPieces.forEach(function(item) {
							if (item.id === mapTile.gamePieceId) {
								selectGamePiece(item);
							}
						});
					}else if (currentSelectedTile !== null){ // clicked outside of the occupied square
						// attack piece
						if (!currentSelectedTile.hasAttacked && mapTile.occupied && mapTile.isHighlightAttack && currentSelectedTile.type === 'PC'){
							for (var i = 0; i < enemyPieces.length; i++) {
								var enemy = enemyPieces[i];
								if (mapTile.gamePieceId === enemy.id){
									if (enemy.type === 'NPC'){
										// Roll for hit
										var hitRoll = getRandomNumber(1, 10);
										var HIT_CHANCE = 7;
										var currentHit = HIT_CHANCE - enemy.armor.defense;
										if (hitRoll >= currentHit) {
											// hit success, roll for damage
											var damage = getRandomNumber(1, currentSelectedTile.attack);
											enemy.currentHP -= damage;
											if (enemy.currentHP <= 0){
												currentSelectedTile.exp += enemy.exp;
												enemyPieces.splice(i, 1);

												if (isGameOver()) {
													showGameMessage(300, 300, 'WINNER!', false);
												}
											}
											currentSelectedTile.hasMoved = true;
											currentSelectedTile.hasAttacked = true;
											showDamageNumber(enemy, '-' + damage);
										}else{
											currentSelectedTile.hasMoved = true;
											currentSelectedTile.hasAttacked = true;
											showDamageNumber(enemy, 'MISS!');
										}
									}
								}
							}
						}

						// move piece
						if (!currentSelectedTile.hasMoved && !mapTile.occupied && mapTile.isHighlightMove && currentSelectedTile.type === 'PC'){
							for (var i = 0; i < heroPieces.length; i++) {
								if (currentSelectedTile.id === heroPieces[i].id){
									moveGamePiece(heroPieces[i], indexX, indexY);
								}
							}
						}

						heroPieces.forEach(function(item) {
							if (currentSelectedTile !== null && item.id === currentSelectedTile.id) {
								deselectGamePiece(item);
							}
						});
						enemyPieces.forEach(function(item) {
							if (currentSelectedTile !== null && item.id === currentSelectedTile.id) {
								deselectGamePiece(item);
							}
						});
					}
				}				
			}else if (currentSelectedTile !== null){ // clicked outside of the map
				heroPieces.forEach(function(item) {
					if (currentSelectedTile !== null && item.id === currentSelectedTile.id) {
						deselectGamePiece(item);
					}
				});
				enemyPieces.forEach(function(item) {
					if (currentSelectedTile !== null && item.id === currentSelectedTile.id) {
						deselectGamePiece(item);
					}
				});
			}
		});

		endTurnBtn.addEventListener('click', function(e){
			enemyLogic();
		});
	}

	function rollForHit(){}
	function rollForDamage(){}
	function usePlayerSkill(){}

	function moveGamePiece(gamePiece, indexX, indexY) {
		var currentGamePiece = gamePiece;
		currentGamePiece.left = gameMap[indexX][indexY].left;
		currentGamePiece.top = gameMap[indexX][indexY].top;
		gameMap[currentGamePiece.location.x][currentGamePiece.location.y].occupied = false;
		gameMap[currentGamePiece.location.x][currentGamePiece.location.y].occupiedType = '';
		gameMap[currentGamePiece.location.x][currentGamePiece.location.y].gamePieceId = '';
		currentGamePiece.location = {x: indexX, y: indexY};
		gameMap[indexX][indexY].occupied = true;
		gameMap[indexX][indexY].occupiedType = currentGamePiece.type;
		gameMap[indexX][indexY].gamePieceId = currentGamePiece.id;
		currentGamePiece.hasMoved = true;
		currentSelectedTile = currentGamePiece;
	}

	function enemyLogic(){
		for (var i = 0; i < enemyPieces.length; i++) {
			var hero = heroPieces[0];
			var distanceX = hero.location.x - enemyPieces[i].location.x;
			var distanceY = hero.location.y - enemyPieces[i].location.y;
			var absX = Math.abs(distanceX);
			var absY = Math.abs(distanceY);
			var moveX = 0;
			var moveY = 0;
			var moveRemaining = enemyPieces[i].movement;
			if (absX > 0){
				moveX = absX > moveRemaining ? moveRemaining : absX;
				moveRemaining -= absX;
			}

			if (absY > 0 && moveRemaining > 0){
				moveY = absY > moveRemaining ? moveRemaining : absY;
				moveRemaining -= absY;
			}

			if (distanceX < 0){
				moveX -= enemyPieces[i].location.x;
				moveX = Math.abs(moveX);
			}else{
				moveX += enemyPieces[i].location.x;
			}

			if (distanceY < 0){
				moveY -= enemyPieces[i].location.y;
				moveY = Math.abs(moveY);
			}else{
				moveY += enemyPieces[i].location.y;
			}
			
			if (!gameMap[moveX][moveY].occupied){
				moveGamePiece(enemyPieces[i], moveX, moveY);
			}else if (moveX - 1 >= 0 && !gameMap[moveX - 1][moveY].occupied){ // left
				moveGamePiece(enemyPieces[i], moveX - 1, moveY);
			}else if (moveY - 1 >= 0 && !gameMap[moveX][moveY - 1].occupied){ // top
				moveGamePiece(enemyPieces[i], moveX, moveY - 1);
			}else if (moveY + 1 >= 0 && !gameMap[moveX][moveY + 1].occupied){ // bottom
				moveGamePiece(enemyPieces[i], moveX, moveY + 1);
			}
			
			var currentEnemy = enemyPieces[i];
			if (currentEnemy.location.x - 1 >= 0 && gameMap[currentEnemy.location.x - 1][currentEnemy.location.y].occupied){
				findHeroAndAttack(gameMap[currentEnemy.location.x - 1][currentEnemy.location.y], currentEnemy);
			}else if(currentEnemy.location.x + 1 <= MAP_WIDTH && gameMap[currentEnemy.location.x + 1][currentEnemy.location.y].occupied){
				findHeroAndAttack(gameMap[currentEnemy.location.x + 1][currentEnemy.location.y], currentEnemy);
			}else if(currentEnemy.location.y - 1 >= 0 && gameMap[currentEnemy.location.x][currentEnemy.location.y - 1].occupied){
				findHeroAndAttack(gameMap[currentEnemy.location.x][currentEnemy.location.y - 1], currentEnemy);
			}else if(currentEnemy.location.y + 1 <= MAP_HEIGHT && gameMap[currentEnemy.location.x][currentEnemy.location.y + 1].occupied){
				findHeroAndAttack(gameMap[currentEnemy.location.x][currentEnemy.location.y + 1], currentEnemy);
			}
		}
		endOfRound();
	}

	function findHeroAndAttack(gameTile, currentEnemy){
		for (var i = 0; i < heroPieces.length; i++) {
			if (gameTile.gamePieceId === heroPieces[i].id){
				var damage = currentEnemy.attack;
				heroPieces[i].currentHP -= damage;
				if (heroPieces[i].currentHP <= 0){
					
					heroPieces.splice(i, 1);
					showGameMessage(300, 300, 'WINNER!', false);
				}
				currentEnemy.hasMoved = true;
				currentEnemy.hasAttacked = true;
				showDamageNumber(heroPieces[i], '-' + damage);			
			}
		}
	}

	function endOfRound(){
		for (var i = 0; i < heroPieces.length; i++) {
			heroPieces[i].hasMoved = false;
			heroPieces[i].hasAttacked = false;
		}
		for (var i = 0; i < enemyPieces.length; i++) {
			enemyPieces[i].hasMoved = false;
			enemyPieces[i].hasAttacked = false;
		}
		gameRound++;
		currentRound.innerHTML = gameRound;
	}

	function isGameOver(){
		for (var i = 0; i < enemyPieces.length; i++) {
			if (enemyPieces[i].type === 'NPC'){
				return false;
			}
		}

		return true;
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
			x: gamePiece.left + MAP_OFFSET_LEFT,
			y: gamePiece.top + MAP_OFFSET_TOP,
			damage: damage
		};

		numberOverlayTimeoutId = window.setTimeout(function() {
			numberOverlay = null;
			this.clearTimeout(numberOverlayTimeoutId);
		}, 1000);
	}

	var messageOverlay = null;
	var messageOverlayTimeoutId = null;
	function showGameMessage(x, y, msg, isTimed) {
		messageOverlay = {
			x: x,
			y: y,
			msg: msg
		};

		if (isTimed){
			messageOverlayTimeoutId = window.setTimeout(function() {
				messageOverlay = null;
				this.clearTimeout(messageOverlayTimeoutId);
			}, 5000);	
		}
	}

	function clearScreen(){
		ctx.fillStyle = CLEAR_COLOR;
		ctx.fillRect(canvas.offsetLeft, canvas.offsetTop, canvas.width, canvas.height);
	}

	var gameStart = true; //TODO remove for testing
	var startBtn = {
		color: '#000000',
		left: canvas.width/2 - 200,
		top: canvas.width/2 - 150,
		width: 400,
		height: 100
	};
	function gameMenuOverlay(){
		// ctx.fillStyle = "#FFFFFF";
		// ctx.fillRect(canvas.offsetLeft, canvas.offsetTop, canvas.width, canvas.height);
		ctx.fillStyle = startBtn.color;
		ctx.fillRect(startBtn.left, startBtn.top, startBtn.width, startBtn.height);
		
		// TODO add click handler for the button and game menu
		ctx.font = '48px serif';
		ctx.fillStyle = '#FFFFFF';
		ctx.fillText("START", canvas.width/2 - 70, canvas.height/2 + 15);
	}

	function render(){
		clearScreen();

		if (!gameStart) {
			gameMenuOverlay();
		}else{
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
			for (var i = 0; i < heroPieces.length; i++) {
				ctx.fillStyle = heroPieces[i].color;
				ctx.fillRect(heroPieces[i].left, 
					heroPieces[i].top, 
					heroPieces[i].width, 
					heroPieces[i].height);
			}
			for (var i = 0; i < enemyPieces.length; i++) {
				ctx.fillStyle = enemyPieces[i].color;
				ctx.fillRect(enemyPieces[i].left, 
					enemyPieces[i].top, 
					enemyPieces[i].width, 
					enemyPieces[i].height);
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
	  			ctx.fillText(numberOverlay.damage, numberOverlay.x, numberOverlay.y);
			}

			if (messageOverlay !== null) {
				ctx.font = '48px serif';
				ctx.fillStyle = '#000';
	  			ctx.fillText(messageOverlay.msg, messageOverlay.x, messageOverlay.y);
			}
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