/* global image, loadImage, strokeWeight, BEVEL, strokeJoin, beginShape, endShape, vertex, textAlign, CENTER, LEFT, RIGHT, UP_ARROW, keyCode, frameCount, createCanvas, stroke, width, height, windowHeight, windowWidth, colorMode, RGB, background, random, textSize, fill, text, noStroke, rect, color, key, LEFT_ARROW, RIGHT_ARROW, DOWN_ARROW*/
/*
TODO
- Restart button
- Add speeding up as score increases
- Settings panel
- Add sound
- Check all filled rows, not just the first filled ones
- Find better font for splash screen
- Multiplayer on two computers
	- Add option for four players?
	*/

	var socket;
	var shapes;
	var press2Play;

	var colors;
	var colors2;
	var colors3;
	var colors4;

	var blockWidth = 20;
	var widthX = 400;
	var heightY = 600;

	var board1;
	var board2;
	var board2x = widthX + blockWidth + 50;

	var canWidth = board2x + widthX;
	var canHeight = heightY;

	var currentShape;
	var currentShape2;

	var score = 0;
	var startGame = false;
	var gameIsOver = false;
	var rate = 30;
	var logo;

	var pause = false;
	var pauseButton;
	var resetButton;

	var player = "unknown";
	var player1Button;
	var player2Button;

 	function preload() {
 		press2Play = loadFont('font.ttf');
 	}

	function setup() {
		colorMode(RGB, 255, 255, 255, 100);
		createCanvas(canWidth, canHeight);
		background(0);
	// Store 7 tetris shapes as 4 x 4 matrices
		//1 = block, 0 = no block.
		shapes = [
			[[1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], //O
			[[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]], //I
			[[0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], //S
			[[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]], //Z
			[[1, 0, 0, 0], [1, 0, 0, 0], [1, 1, 0, 0], [0, 0, 0, 0]], //L
			[[0, 1, 0, 0], [0, 1, 0, 0], [1, 1, 0, 0], [0, 0, 0, 0]], //J
			[[1, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] //T
			];

		// Shape primary colors
		colors = [
			color(240, 240, 0), //O
			color(2, 240, 240), //I
			color(0, 240, 1), //S
			color(240, 35, 0), //Z
			color(240, 160, 0), //L
			color(4, 47, 240), //J
			color(160, 52, 240) //T
			];

		// Shape top border colors
		colors2 = [
			color(251, 251, 179), //O
			color(179, 251, 251), //I
			color(179, 251, 179), //S
			color(251, 179, 179), //Z
			color(251, 227, 179), //L
			color(179, 179, 251), //J
			color(227, 179, 251) //T
			];

		// Shape left/right border colors
		colors3 = [
			color(216, 216, 1), //O
			color(1, 216, 216), //I
			color(0, 216, 0), //S
			color(216, 30, 0), //Z
			color(216, 144, 0), //L
			color(3, 41, 216), //J
			color(143, 46, 216) //T
			];

		//Shape bottom border color
		colors4 = [
			color(120, 120, 0), //O
			color(0, 120, 120), //I
			color(1, 120, 0), //S
			color(120, 12, 0), //Z
			color(120, 80, 0), //L
			color(1, 18, 120), //J
			color(80, 21, 120) //T
			];

			board1 = new Board(0, widthX, heightY, new Shape(0, 0, Math.floor(random(0, 7))));
			board2 = new Board(board2x, widthX, heightY, new Shape(0, 0, Math.floor(random(0, 7))));

			displayTitleScreen();

			socket = io.connect('http://localhost:56151');
			socket.on('move', moveOther);
			socket.on('newPiece', setPiece);
			socket.on('pause', setPause);
			// socket.on('start', starting);
			socket.on('startGame', gameStarted);
	
	textFont(press2Play);
	pauseButton = createButton("Pause");
	pauseButton.position(board2x - 32.5, 60);
	pauseButton.mousePressed(function() {pause = !pause;sendPause(pause)});
	pauseButton.hide();
	resetButton = createButton("Restart");
	resetButton.position(board2x - 35, 80);
	resetButton.mousePressed(reset());
	resetButton.hide();
}

function reset() {
	score = 0;
	board1 = new Board(0, widthX, heightY, new Shape(0, 0, Math.floor(random(0, 7))));
	board2 = new Board(board2x, widthX, heightY, new Shape(0, 0, Math.floor(random(0, 7))));
	rate = 30;
	resetButton.hide();
	gameIsOver = false;
}

function draw() {
	 //if first run, draw start screen
	 if(startGame && !pause) {
	 	background(0);

		board1.draw();
		board2.draw();

		if(!gameIsOver) {
			board1.update();
			board2.update();
			checkRowFilled();
			checkGameOver();
		} else {
			textAlign(CENTER);
			textSize(70);
			fill(255);
			stroke("black");
			text("GAME OVER", canWidth / 2, canHeight / 2);
			resetButton.show();
		}

		displayScore();
	}
}

// Class for left tetris shape
class Shape {
	// x, y top left corner of the matrix in the board
	constructor(x, y, id) {
		this.x = x;
		this.y = y;
		this.id = id;
		this.color = colors[id];
		this.matrix = shapes[id];
	}

	fall() {
		this.y += 1;
	}
}

class Board {
	constructor(x, width, height, shape) {
		this.x = x;
		this.y = 0;
		this.width = width;
		this.height = height;
		this.shape = shape;

		// Initialize board and fill with 0
		this.board = [];
		for (var i = 0; i < this.height / blockWidth + 1; i++) {
			this.board[i] = [];
			for (var j = 0; j < (this.width) / blockWidth; j++) {
				this.board[i][j] = 0;
			}
		}
		//set bottom border
		for (var j = 0; j < this.board[0].length; j++) {
			this.board[this.board.length - 1][j] = 1;
		}
	}

	createShape() {
		var piece = new Shape(0, 0, Math.floor(random(0, 7)))
		if(player == "one") {
			sendPiece(piece.id, 1);
			console.log('piece:' + piece.id);
		} else {
			sendPiece(piece.id, 2);
		}
	}

	draw() {
		stroke(100);
    	// Draw right board
    	for (var r = 0; r < this.board.length; r++) {
    		for (var c = 0; c < this.board[0].length; c++) {
    			if (this.board[r][c] == 0) {
    				fill("black");
    				strokeWeight(2);
    				rect(this.x + (c * blockWidth), r * blockWidth, blockWidth, blockWidth);
    			} else {
    				strokeWeight(2);
    				rect(this.x + (c * blockWidth), r * blockWidth, blockWidth, blockWidth);
    				drawBlock(this.x + c * blockWidth + 2.5, r * blockWidth + 3, this.board[r][c] - 1);
    			}
    		}
    	}
	}

	drawShape() {
		for (var r = 0; r < this.shape.matrix.length; r++) {
			for (var c = 0; c < this.shape.matrix[0].length; c++) {
				if (this.shape.matrix[r][c] == 1) {
					// Draw block
					drawBlock(
						this.x + (this.shape.x + c) * blockWidth + 2.5,
						(this.shape.y + r) * blockWidth + 3,
						this.shape.id
						);
				}
			}
		}
	}

	doesCollide() {
		var hit = false;
		for (var r = 0; r < this.shape.matrix.length; r++) {
			for (var c = 0; c < this.shape.matrix[0].length; c++) {
				if (this.shape.matrix[r][c] != 0) {
					// Check bottom
					if (this.board[r + this.shape.y + 1][c + this.shape.x] != 0) {
						hit = true;
					}
				}
			}
		}
		return hit;
	}


	shapeHit() {
		for (var r = 0; r < this.shape.matrix.length; r++) {
			for (var c = 0; c < this.shape.matrix[0].length; c++) {
				if (this.shape.matrix[r][c] == 1) {
					this.board[r + this.shape.y][c + this.shape.x] = this.shape.id + 1;
				}
			}
		}
		this.shape = new Shape(0, 0, Math.floor(random(0, 7)));
	}

	update() {
		if(frameCount % rate == 0) {
			if(!this.doesCollide()) {
				this.shape.fall();
			} else {
				this.shapeHit();
			}
		}
		this.drawShape();
	}

	rotatePiece() {
		var newArray = [];
		var zeroArray = [];
		for (var i = 3; i >= 0; i--) {
			zeroArray.push(0);
			newArray.push([]);
		}

		// Fill new array with rotated blocks
		for (var i = 3; i >= 0; i--) {
			for (var j = 3; j >= 0; j--) {
				newArray[j].push(this.shape.matrix[i][j]);
			}
		}

		// Align top
		var rowEmpty = true;
		for(var j = 0; j < 4; j++) {
			if(newArray[0][j] != 0) {
				rowEmpty = false;
				break;
			}
		}
		while(rowEmpty) {
			newArray.splice(0, 1);
			newArray.push(zeroArray);

			rowEmpty = true;
			for(var j = 0; j < 4; j++) {
				if(newArray[0][j] != 0) {
					rowEmpty = false;
					break;
				}
			}
		}

		// Align left
		var colEmpty = true;
		for(var i = 0; i < 4; i++) {
			if(newArray[i][0] != 0) {
				colEmpty = false;
				break;
			}
		}
		while(colEmpty) {
			for(var i = 0; i < 4; i++) {
				newArray[i].splice(0, 1);
				newArray[i].push(0);
			}

			colEmpty = true;
			for(var i = 0; i < 4; i++) {
				if(newArray[i][0] != 0) {
					colEmpty = false;
					break;
				}
			}
		}
		var dist = this.board[0].length - this.shape.x;

		// Calculate width
		var width = 4;
		for(var j = 3; j >= 0; j--) {
			colEmpty = true;
			for(var i = 0; i < 4; i++) {
				if(newArray[i][j] != 0) {
					colEmpty = false;
					break;
				}
			}
			if(colEmpty) {
				width--;
			}
		}

		if(dist < width) {
			this.shape.x -= width - dist;
		}

		// Check if overlap with other blocks
		for(var i = 0; i < 4; i++) {
			for(var j = 0; j < 4; j++) {
				if(newArray[i][j] != 0 && this.board[i + this.shape.y][j + this.shape.x] != 0) {
					return;
				}
			}
		}
		this.shape.matrix = newArray;
	}
}

function drawBlock(x, y, id) {
	fill(colors[id]);
	rect(x, y, blockWidth - 0.25 * blockWidth, blockWidth - 0.25 * blockWidth);
	strokeWeight((0.25 * blockWidth) / 2);
	strokeJoin(BEVEL);

	stroke(colors2[id]);
	beginShape();
	vertex(x, y);
	vertex(x + blockWidth - 0.25 * blockWidth, y);
	endShape();

	stroke(colors3[id]);
	beginShape();
	vertex(x + blockWidth - 0.25 * blockWidth, y);
	vertex(
		x + blockWidth - 0.25 * blockWidth,
		y + blockWidth - 0.25 * blockWidth
		);
	endShape();

	stroke(colors4[id]);
	beginShape();
	vertex(
		x + blockWidth - 0.25 * blockWidth,
		y + blockWidth - 0.25 * blockWidth
		);
	vertex(x, y + blockWidth - 0.25 * blockWidth);
	endShape();

	stroke(colors3[id]);
	beginShape();
	vertex(x, y + blockWidth - 0.25 * blockWidth);
	vertex(x, y);
	endShape();
	stroke(100);
}

function keyPressed() {
	if(!pause) {
	//player 1
		if(player == "one") {
			var hit = false;
			if (keyCode == 65) {
				for (var r = 0; r < board1.shape.matrix.length; r++) {
					for (var c = 0; c < board1.shape.matrix[0].length; c++) {
						if (board1.shape.matrix[r][c] != 0) {
							if (board1.board[r + board1.shape.y][c + board1.shape.x - 1] != 0) {
								hit = true;
							}
						}
					}
				}
				if (!hit) {
					board1.shape.x -= 1;
					sendMove(keyCode, player);
				}
			} else if (keyCode == 68) {
				for (var r = 0; r < board1.shape.matrix.length; r++) {
					for (var c = 0; c < board1.shape.matrix[0].length; c++) {
						if (board1.shape.matrix[r][c] != 0) {
							if (board1.board[r + board1.shape.y][c + board1.shape.x + 1] != 0) {
								hit = true;
							}
						}
					}
				}
				if (!hit) {
					board1.shape.x += 1;
					sendMove(keyCode, player);
				}
			} else if (keyCode == 83 && !board1.doesCollide()) {
				board1.shape.y += 1;
				sendMove(keyCode, player);
			} else if (keyCode == 87) {
				board1.rotatePiece();
				sendMove(keyCode, player);
			} else if(keyCode == 32) {
				sendStart(true, player);
			}
		}

			//player 2
		if(player=="two") {
			var hit2 = false;
			if (keyCode == LEFT_ARROW) {
				for (var r = 0; r < board2.shape.matrix.length; r++) {
					for (var c = 0; c < board2.shape.matrix[0].length; c++) {
						if (board2.shape.matrix[r][c] != 0) {
							if (board2.board[r + board1.shape.y][c + board2.shape.x - 1] != 0) {
								hit2 = true;
							}
						}
					}
				}
				if (!hit2) {
					board2.shape.x -= 1;
					sendMove(keyCode, player);
				}
			} else if (keyCode == RIGHT_ARROW) {
			for (var r = 0; r < board2.shape.matrix.length; r++) {
				for (var c = 0; c < board2.shape.matrix[0].length; c++) {
					if (board2.shape.matrix[r][c] != 0) {
						if (board2.board[r + board1.shape.y][c + board2.shape.x + 1] != 0) {
							hit2 = true;
						}
					}
				}
			}
			if (!hit2) {
				board2.shape.x += 1;
				sendMove(keyCode, player);
			}
		} else if (keyCode == DOWN_ARROW && !board2.doesCollide()) {
			board2.shape.y += 1;
			sendMove(keyCode, player);
		} else if (keyCode == UP_ARROW) {
			board2.rotatePiece();
		} else if(keyCode == 32) {
			sendStart(true, player);
		}
	}
	// if(keyCode == 32 && player != "unknown") { // Space
	// 	console.log('go')
	// 	gameStarted();
	// }}
	}
}

function gameStarted() {
	background(0);
	if(player=="one") {
		board1.createShape();
	} else if (player=="two") {
		board2.createShape();
	}
	startGame = true;
	document.getElementById("logo").style = "display:none;";
	player1Button.hide();
	player2Button.hide();
	pauseButton.show();
}


function displayScore() {
	textSize(16);
	fill(255);
	//write score in the center of the board
	textAlign(CENTER);
	stroke("black");
	text(`Score: ${score}`, canWidth / 2, 20);
}

// If top row of either board has blocks, game over.
//Should this be if they go into the row above the visible board instead?
function checkGameOver() {
	// Check board
	for (var j = 0; j < board1.board[0].length; j++) {
		if (board1.board[0][j] != 0) {
			gameIsOver = true;
			break;
		}
	}

	// Check board2
	for (var j = 0; j < board2.board[0].length; j++) {
		if (board2.board[0][j] != 0) {
			gameIsOver = true;
			break;
		}
	}
}

//seems to only work if row filled is first row? or maybe if they fill around the same time? idk, buggy
function checkRowFilled() {
	var rowFilled = -1;
	for (var i = 0; i < board1.board.length - 1 && rowFilled == -1; i++) {
		for (var j = 0; j < board1.board[0].length; j++) {
			if (board1.board[i][j] == 0) {
				break;
			}
			if(j == board1.board[0].length - 1) {
				rowFilled = i;
			}
		}
	}

	if (rowFilled != -1) {
		var rowsFilled = true;
		for (var j = 0; j < board2.board[0].length; j++) {
			if (board2.board[rowFilled][j] == 0) {
				rowsFilled = false;
				break;
			}
		}

		if (rowsFilled) {
			// Remove row from boards
			board1.board.splice(rowFilled, 1);
			board2.board.splice(rowFilled, 1);
			// Add new rows at the top of both boards
			var new_r = [];
			for (var i = 0; i < board1.board[0].length; i++) {
				new_r[i] = 0;
			}
			board1.board.unshift(new_r);
			board2.board.unshift(new_r);

			score += 20; //could this just be one?
			if(rate > 6) {
				rate -= 2;
			}
		}
	}
}

function displayTitleScreen() {
	logo = new Image(450, 236);
	logo.src = "Tetris Multiplayer.png";
	logo.style = `position:absolute; top:70px; left:230px;`;
	logo.id = "logo";
	document.body.appendChild(logo);
	textAlign(CENTER);
	fill(255);
	textSize(16);
	text("A row must be filled across both boards to cancel out", canWidth / 2, 370);

	textAlign(LEFT);
	textSize(16);
	text("Player 1:", 100, 420);
	text("WASD to move, W to rotate", 100, 440);
	player1Button = createButton("Player 1");
	player1Button.position(125, 410);
	player1Button.mousePressed(function() {player="one"; console.log(player)});

	textAlign(RIGHT);
	text("Player 2:", canWidth - 100, 420);
	text("Arrow keys to move, up arrow to rotate", canWidth - 100, 440);
	player2Button = createButton("Player 2");
	player2Button.position(730, 410);
	player2Button.mousePressed(function() {player="two"; console.log(player)});

	textAlign(CENTER);
	text("Chose player, then", canWidth/2, 480);
	text("press space to start", canWidth / 2, 500);

	text("Disclaimer: We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with the", canWidth / 2, canHeight - 40);
	text("Tetris Company, LLC or Tetris Holding LLC.", canWidth / 2, canHeight - 20);
}

function moveOther(data) {
	console.log('got info');
	if(data.user == "one") {
		if (data.keyPressed == 65) {
			board1.shape.x -= 1;
		} else if (data.keyPressed == 68) {
			board1.shape.x += 1;  
		} else if (data.keyPressed == 83) {
			board1.shape.y += 1;
		} else if (data.keyPressed == 87) {
			board1.rotatePiece();
		}
	}

	if(data.user=="two") {
		if (data.keyPressed == LEFT_ARROW) {
			board2.shape.x -= 1;
		} else if (data.keyPressed == RIGHT_ARROW) {
			board2.shape.x += 1;
		} else if (data.keyPressed == DOWN_ARROW) {
			board2.shape.y += 1;
		} else if (data.keyPresssed == UP_ARROW) {
			board2.rotatePiece();
		}
	}
}

function sendMove(key, player) {
	var data = {
		keyPressed: key,
		user: player
	};

	socket.emit('move', data);
}

function setPause(data) {
	console.log("Got 'pause' " + data.pause);
	pause = data.pause;
}

function sendPause(p) {
	var data = {
  		pause: p
	}

  	socket.emit('pause', data);
}

// function sendStart(player) {
// 	var data = {
// 		player: player
// 	};
// 	socket.emit('start', data);
// }

// function starting(data) {
//     gameStarted();
// }

function sendStart(s, player) {
	var data = {
    	start: s,
   		user: player
	}
	socket.emit('start', data);
}

function sendPiece(id, board) {
	var data = {
		id: id,
		board: board
	};

	socket.emit('newPiece', data);
}

function setPiece(data) {
	if(data.board == 1) {
		board1.shape = new Shape(0, 0, data.id);
	}
	if(data.board == 2) {
		board2.shape = new Shape(0, 0, data.id);
	}
}
