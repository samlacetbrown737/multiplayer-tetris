/* global image, loadImage, strokeWeight, BEVEL, strokeJoin, beginShape, endShape, vertex, textAlign, CENTER, LEFT, RIGHT, UP_ARROW, keyCode, frameCount, createCanvas, stroke, width, height, windowHeight, windowWidth, colorMode, RGB, background, random, textSize, fill, text, noStroke, rect, color, key, LEFT_ARROW, RIGHT_ARROW, DOWN_ARROW*/
/*
TODO
- Settings panel
- Sound effects
- Multiplayer on two computers
- Add option for four players?
*/

var socket;

var shapes;
var colors;
var colors2;
var colors3;
var colors4;

var logo;
//var bgm;
var press2Play;

var blockWidth = 30;
var widthX = 300;
var heightY = 600;
var board2x = widthX + blockWidth * 5;
var canWidth = board2x + widthX;
var canHeight = heightY;

var board1;
var board2;
var score = 0;
var startGame = false;
var gameIsOver = false;
var rate = 30;
var frames = 0;

var pause = false;
var pauseButton;
var resetButton;

var player = "unknown";
var player1Button;
var player2Button;

function preload() {
  press2Play = loadFont('font.ttf');
}

function loaded() {
  // bgm.loop();
  // bgm.setVolume(0.2);
}

function setup() {
  colorMode(RGB, 255, 255, 255, 100);
  createCanvas(canWidth, canHeight);
  background(0);
  // Store 7 tetris shapes as 4 x 4 matrices
  // 1 = block, 0 = no block.
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
  
  //userStartAudio();
  //bgm = loadSound("Original Tetris Theme.mp3", loaded);

  
 //socket = io.connect('localhost:56151');
  socket = io.connect('http://73.181.243.148:56151');
  socket.on('board', setOtherBoard);
  socket.on('pause', setPause);
  socket.on('start', gameStarted);
  socket.on('score', scoreChange)
  socket.on('reset', reset);

  textFont(press2Play);
  displayTitleScreen();  
	
  pauseButton = createButton("Pause");
  pauseButton.style("font-family: 'Press Start 2P'; font-size: 16;");
	pauseButton.position(widthX + 55, 200 + blockWidth * 8);
	pauseButton.mousePressed(function() {pause = !pause; sendPause(pause)});
  pauseButton.hide();
  
  resetButton = createButton("Restart");
  resetButton.style("font-family: 'Press Start 2P'; font-size: 16;");
	resetButton.position(widthX + 40, 200 + blockWidth * 4);
	resetButton.mousePressed(sendReset);
	resetButton.hide();
}

function reset() {
  score = 0;
	rate = 30;
  resetButton.hide();
  gameIsOver = false;
  pause = false;
  gameStarted();
}

function draw() { if(board1 != undefined && board2 != undefined) {
  frames++;
  //if first run, draw start screen
  if(startGame && !pause && !gameIsOver) {
    background(0);

    board1.draw();
    board2.draw();

    if(player == "one") {
      if(frames % rate == 0) {
        if(!board1.doesCollide()) {
          board1.shape.fall();
        } else {
          board1.shapeHit();
        }
      }
      sendBoard(board1.x, board1.width, board1.height, board1.shape.x, board1.shape.y, board1.shape.id, board1.shape.matrix, board1.nextShape.x, board1.nextShape.y, board1.nextShape.id, board1.board, 1);
    } else {
      if(frames % rate == 0) {
        if(!board2.doesCollide()) {
          board2.shape.fall();
        } else {
          board2.shapeHit();
        }
      }
      sendBoard(board2.x, board2.width, board2.height, board2.shape.x, board2.shape.y, board2.shape.id, board2.shape.matrix, board2.nextShape.x, board2.nextShape.y, board2.nextShape.id, board2.board, 2);
    }
    
    board1.drawShape();
    board2.drawShape();

    checkRowFilled();

    board1.checkGameOver();
    board2.checkGameOver();

    displayMiddle();
  } else {
    if(!pause) {
      textAlign(CENTER);
      textSize(70);
      fill(255);
      stroke("black");
      text("GAME OVER", canWidth / 2, canHeight / 2);
      resetButton.show();
    }
  }
}}

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
  
  setter(matrix) {
    this.color = colors[this.id];
		this.matrix = matrix;
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
    this.nextShape = new Shape(0, 0, Math.floor(random(0, 7)));

    // Initialize board and fill with 0
    this.board = [];
    for(var i = 0; i < this.height / blockWidth + 1; i++) {
      this.board[i] = [];
      for(var j = 0; j < this.width / blockWidth; j++) {
        this.board[i][j] = 0;
      }
    }
    //set bottom border
    for(var j = 0; j < this.board[0].length; j++) {
      this.board[this.board.length - 1][j] = 1;
    }
  }

  setter(smatrix, nx, ny, nid, board) {
    this.shape.setter(smatrix);

    this.nextShape = new Shape(nx, ny, nid);
    this.nextShape.setter(shapes[nid]);

    this.board = board;
  }

  draw() {
    for(var r = 0; r < this.board.length; r++) {
    	for(var c = 0; c < this.board[0].length; c++) {
        if(this.board[r][c] == 0) {
          fill("black");
          strokeWeight(2);
          stroke(100);
          rect(this.x + c * blockWidth, r * blockWidth, blockWidth, blockWidth);
        } else {
    			drawBlock(this.x + c * blockWidth, r * blockWidth, this.board[r][c] - 1);
    		}
      }
    }
	}

	drawShape() {
		for(var r = 0; r < this.shape.matrix.length; r++) {
			for(var c = 0; c < this.shape.matrix[0].length; c++) {
				if(this.shape.matrix[r][c] == 1) {
          drawBlock(this.x + (this.shape.x + c) * blockWidth,
          (this.shape.y + r) * blockWidth,
          this.shape.id);
				}
			}
		}
	}

	doesCollide() {
		var hit = false;
		for(var r = 0; r < this.shape.matrix.length; r++) {
			for(var c = 0; c < this.shape.matrix[0].length; c++) {
				if(this.shape.matrix[r][c] != 0) {
					// Check bottom
					if(this.board[r + this.shape.y + 1][c + this.shape.x] != 0) {
						hit = true;
					}
				}
			}
		}
		return hit;
  }
  
	shapeHit() {
		for(var r = 0; r < this.shape.matrix.length; r++) {
			for(var c = 0; c < this.shape.matrix[0].length; c++) {
				if(this.shape.matrix[r][c] == 1) {
					this.board[r + this.shape.y][c + this.shape.x] = this.shape.id + 1;
				}
			}
		}
    this.shape = this.nextShape;
    this.nextShape = new Shape(0, 0, Math.floor(random(0, 7)));
    if(player == "one") {
      sendBoard(this.x, this.width, this.height, this.shape.x, this.shape.y, this.shape.id, this.shape.matrix, this.nextShape.x, this.nextShape.y, this.nextShape.id, this.board, 1);
    } else if(player == "two") {
      sendBoard(this.x, this.width, this.height, this.shape.x, this.shape.y, this.shape.id, this.shape.matrix, this.nextShape.x, this.nextShape.y, this.nextShape.id, this.board, 2);
    }
    console.log(player + this.shape.id);
	}

	update() {
		if(frames % rate == 0) {
			if(!this.doesCollide()) {
				this.shape.fall();
			} else {
        this.shapeHit();
        if(player == "one") {
          board1.setNextShape(Math.floor(random(0, 7)));
        } else {
          board2.setNextShape(Math.floor(random(0, 7)));
        }
			}
		}
		this.drawShape();
	}

	rotatePiece() {
		var newArray = [];
		var zeroArray = [];
		for(var i = 3; i >= 0; i--) {
			zeroArray.push(0);
			newArray.push([]);
		}

		// Fill new array with rotated blocks
		for(var i = 3; i >= 0; i--) {
			for(var j = 3; j >= 0; j--) {
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
  
  // If top row of board has blocks, game over.
  checkGameOver() {
    for(var j = 0; j < this.board[0].length; j++) {
      if(this.board[0][j] != 0 && !pause) {
        gameIsOver = true;
        break;
      }
    }
  }
}

function drawBlock(x, y, id) {
  noStroke();
  fill(colors2[id]);
  triangle(x, y, x + blockWidth / 2, y + blockWidth / 2, x + blockWidth, y);
  fill(colors3[id]);
  triangle(x + blockWidth, y + blockWidth, x + blockWidth / 2, y + blockWidth / 2, x + blockWidth, y);
  fill(colors4[id]);
  triangle(x, y + blockWidth, x + blockWidth, y + blockWidth, x + blockWidth / 2, y + blockWidth / 2);
  fill(colors3[id]);
  triangle(x, y, x, y + blockWidth, x + blockWidth / 2, y + blockWidth / 2);
  fill(colors[id]);
	rect(x + blockWidth / 8, y + blockWidth / 8, blockWidth * 3 / 4, blockWidth * 3 / 4);
}

function keyPressed() {
	if(!pause) {
    var board;
    var boardNum;
		if(player == "one") {
      board = board1;
      boardNum = 1;
		} else if(player == "two") {
      board = board2;
      boardNum = 2;
    }
    var hit = false;
    if(keyCode == LEFT_ARROW || keyCode == 65) {
      for(var r = 0; r < board.shape.matrix.length; r++) {
        for(var c = 0; c < board.shape.matrix[0].length; c++) {
          if(board.shape.matrix[r][c] != 0) {
            if(board.board[r + board.shape.y][c + board.shape.x - 1] != 0) {
              hit = true;
            }
          }
        }
      }
      if(!hit) {
        board.shape.x -= 1;
        sendBoard(board.x, board.width, board.height, board.shape.x, board.shape.y, board.shape.id, board.shape.matrix, board.nextShape.x, board.nextShape.y, board.nextShape.id, board.board, boardNum);
      }
    } else if(keyCode == RIGHT_ARROW || keyCode == 68) {
      for(var r = 0; r < board.shape.matrix.length; r++) {
        for(var c = 0; c < board.shape.matrix[0].length; c++) {
          if(board.shape.matrix[r][c] != 0) {
            if(board.board[r + board.shape.y][c + board.shape.x + 1] != 0) {
              hit = true;
            }
          }
        }
      }
      if(!hit) {
        board.shape.x += 1;
        sendBoard(board.x, board.width, board.height, board.shape.x, board.shape.y, board.shape.id, board.shape.matrix, board.nextShape.x, board.nextShape.y, board.nextShape.id, board.board, boardNum);
      }
    } else if((keyCode == DOWN_ARROW || keyCode == 83) && !board.doesCollide()) {
      board.shape.y += 1;
      sendBoard(board.x, board.width, board.height, board.shape.x, board.shape.y, board.shape.id, board.shape.matrix, board.nextShape.x, board.nextShape.y, board.nextShape.id, board.board, boardNum);
    } else if(keyCode == UP_ARROW || keyCode == 87) {
      board.rotatePiece();
      sendBoard(board.x, board.width, board.height, board.shape.x, board.shape.y, board.shape.id, board.shape.matrix, board.nextShape.x, board.nextShape.y, board.nextShape.id, board.board, boardNum);
    } else if(keyCode == 32) {
      sendStart();
    }
  }
}

function gameStarted() {
  background(0);

  if(player == "one") {
    board1 = new Board(0, widthX, heightY, new Shape(0, 0, Math.floor(random(0, 7))));
    sendBoard(board1.x, board1.width, board1.height, board1.shape.x, board1.shape.y, board1.shape.id, board1.shape.matrix, board1.nextShape.x, board1.nextShape.y, board1.nextShape.id, board1.board, 1);
  } else if(player == "two"){
    board2 = new Board(board2x, widthX, heightY, new Shape(0, 0, Math.floor(random(0, 7))));
    sendBoard(board2.x, board2.width, board2.height, board2.shape.x, board2.shape.y, board2.shape.id, board2.shape.matrix, board2.nextShape.x, board2.nextShape.y, board2.nextShape.id, board2.board, 2);
  }
  
  frames = rate / 2;
  startGame = true;
  document.getElementById("logo").style = "display:none;";
  player1Button.hide();
  player2Button.hide();
  pauseButton.show();
}

function displayMiddle() {
	textSize(16);
  fill(255);
  noStroke();
  textAlign(CENTER);
	// Score	
  text("Score", canWidth / 2, 40);
  text(`${score}`, canWidth / 2, 60);
  // Player 1 next shape
  text("Next 1", canWidth / 2, 100);
  drawNextShape(widthX + blockWidth / 2, 120, board1.nextShape);
  // Player 2 next shape
  fill(255);
  noStroke();
  text("Next 2", canWidth / 2, 160 + blockWidth * 4);
  drawNextShape(widthX + blockWidth / 2, 180 + blockWidth * 4, board2.nextShape);
}

function drawNextShape(x, y, shape) {
  for(var r = 0; r < 4; r++) {
    for(var c = 0; c < 4; c++) {
      fill("black");
      strokeWeight(2);
      stroke(100);
      rect(x + c * blockWidth, y + r * blockWidth, blockWidth, blockWidth);
      if(shape.matrix[r][c] == 1) {
        drawBlock(x + c * blockWidth, y + r * blockWidth, shape.id);
      }
    }
  }
}

//seems to only work if row filled is first row? or maybe if they fill around the same time? idk, buggy
function checkRowFilled() {
	var rowFilled = -1;
	for(var i = 0; i < board1.board.length - 1 && rowFilled == -1; i++) {
		for(var j = 0; j < board1.board[0].length; j++) {
			if(board1.board[i][j] == 0) {
				break;
			}
			if(j == board1.board[0].length - 1) {
				rowFilled = i;
			}
		}
	}

	if(rowFilled != -1) {
		var rowsFilled = true;
		for(var j = 0; j < board2.board[0].length; j++) {
			if(board2.board[rowFilled][j] == 0) {
				rowsFilled = false;
				break;
			}
		}

		if(rowsFilled) {
			// Remove row from boards
			board1.board.splice(rowFilled, 1);
			board2.board.splice(rowFilled, 1);
			// Add new rows at the top of both boards
			var new_r = [];
			for(var i = 0; i < board1.board[0].length; i++) {
				new_r[i] = 0;
			}
			board1.board.unshift(new_r);
			board2.board.unshift(new_r);

			score += 20; //could this just be one?
			if(rate > 6) {
				rate -= 2;
			}
      sendScore();

      sendBoard(board1.x, board1.width, board1.height, board1.shape.x, board1.shape.y, board1.shape.id, board1.shape.matrix, board1.nextShape.x, board1.nextShape.y, board1.nextShape.id, board1.board, 1);
      sendBoard(board2.x, board2.width, board2.height, board2.shape.x, board2.shape.y, board2.shape.id, board2.shape.matrix, board2.nextShape.x, board2.nextShape.y, board2.nextShape.id, board2.board, 2);
		}
	}
}

function displayTitleScreen() {
	logo = new Image(450, 236);
	logo.src = "Tetris Multiplayer.png";
	logo.style = `position:absolute; top:70px; left:${canWidth / 2 - 225 + 20}px;`;
	logo.id = "logo";
	document.body.appendChild(logo);
	textAlign(CENTER);
	fill(255);
  textSize(16);
  text("Choose player", canWidth / 2, 360);
  
  player1Button = createButton("Player 1");
  player1Button.style("font-family: 'Press Start 2P'; font-size: 16;");
  player1Button.position(canWidth / 2 - player1Button.size().width - 80, 370);  
  player1Button.mousePressed(function() {player = "one"; console.log(player);});
  
  player2Button = createButton("Player 2");
  player2Button.style("font-family: 'Press Start 2P'; font-size: 16;");
  player2Button.position(canWidth / 2 + 55, 370);  
  player2Button.mousePressed(function() {player = "two"; console.log(player);});

  text("Press space to start", canWidth / 2, 435);
  text("A row must be filled across both", canWidth / 2, 475);
  text("boards to cancel out", canWidth / 2, 495);
  
  textSize(7);
	text("Disclaimer: We are not affiliated, associated, authorized, endorsed by, or in any way", canWidth / 2, canHeight - 40);
	text("officially connected with the Tetris Company, LLC or Tetris Holding LLC.", canWidth / 2, canHeight - 30);
}

function setOtherBoard(data) {
  if(data.boardNum == 1) {
    board1 = new Board(data.x, data.width, data.height, new Shape(data.sx, data.sy, data.sid));
    board1.setter(data.smatrix, data.nx, data.ny, data.nid, data.board);
    console.log(board1);
  } else {
    board2 = new Board(data.x, data.width, data.height, new Shape(data.sx, data.sy, data.sid));
    board2.setter(data.smatrix, data.nx, data.ny, data.nid, data.board);
    console.log(board2);
  }
}

function sendBoard(x, width, height, sx, sy, sid, smatrix, nx, ny, nid, board, boardNum) {
  var data = {
    x: x,
    width: width,
    height: height,
    sx: sx,
    sy: sy,
    sid: sid,
    smatrix: smatrix,
    nx: nx,
    ny: ny,
    nid: nid,
    board: board,
    boardNum: boardNum
  };
  console.log(data);
  socket.emit('board', data);
}

function setPause(data) {
	console.log("Got 'pause' " + data.pause);
	pause = data.pause;
}

function sendPause(p) {
	var data = {
    pause: p
	};
  socket.emit('pause', data);
}

function sendStart() {
	var data = {
    user: player
  };
  socket.emit('start', data);
  if(player == "one") {
    player2Button.attribute("disabled", true);
  } else if(player == "two") {
    player1Button.attribute("disabled", true);
  }
  fill(0);
  noStroke();
  rect(0, 415, canWidth, 20);
  textAlign(CENTER);
  fill(255, 0, 0);
  textSize(16);
  text("Waiting for other player...", canWidth / 2, 435);
}

function sendReset() {
  var data = {
    user: player
  };
  socket.emit('reset', data);
  textAlign(CENTER);
  fill(255, 0, 0);
  noStroke();
  textSize(16);
  text("Waiting for other player...", canWidth / 2, 260 + blockWidth * 4);
}

function sendScore() {
  var data = {
    scoreSent: score
  }
  socket.emit('score', data);
}

function scoreChange(data) {
  score = data.scoreSent;
}
