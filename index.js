/* global image, loadImage, strokeWeight, BEVEL, strokeJoin, beginShape, endShape, vertex, textAlign, CENTER, LEFT, RIGHT, UP_ARROW, keyCode, frameCount, createCanvas, stroke, width, height, windowHeight, windowWidth, colorMode, RGB, background, random, textSize, fill, text, noStroke, rect, color, key, LEFT_ARROW, RIGHT_ARROW, DOWN_ARROW*/
/*
TODO
- Pause button
- Restart button
- Add speeding up as score increases
- Settings panel
- Add sound
- Check all filled rows, not just the first filled ones
- Find better font for splash screen
- Multiplayer on two computers
  - Figure out how to send info from host
  - Add option for four players?
*/

var socket;
var shapes;

var colors;
var colors2;
var colors3;
var colors4;

var blockWidth = 20;
var widthX = 400;
var heightY = 600;

var board;
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

var player = "unknown";
var player1Button;
var player2Button;


function setup() {
	colorMode(RGB, 255, 255, 255, 100);
	createCanvas(canWidth, canHeight)
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
	
	initBoards();

	socket = io.connect('http://localhost:3000');
	socket.on('mouse', newDrawing); //if client receives packet mouse, run newDrawing

	currentShape = new Shape(0, 0, Math.floor(random(0, 7)), board);
	currentShape2 = new Shape2(0, 0, Math.floor(random(0, 7)), board2);
}

function initBoards() {
	// Initialize left board and fill with 0
	board = [];
	for (var i = 0; i < heightY / blockWidth + 1; i++) {
		board[i] = [];
		for (var j = 0; j < (widthX) / blockWidth; j++) {
			board[i][j] = 0;
		}
	}
	//set bottom border
	for (var j = 0; j < board[0].length; j++) {
		board[board.length - 1][j] = 1;
	}

	// Initialize right board and fill with 0
	board2 = [];
	for (var i = 0; i < heightY / blockWidth + 1; i++) {
		board2[i] = [];
		for (var j = 0; j < widthX / blockWidth; j++) {
			board2[i][j] = 0;
		}
	}
	//set bottom border
	for (var j = 0; j < board2[0].length; j++) {
		board2[board2.length - 1][j] = 1;
	}
	displayTitleScreen();
}

//all commented out
function draw() {
   //if first run, draw start screen
   if(startGame) {
 	//background(0);
    stroke(100);
    // Draw left board
    for (var r = 0; r < board.length; r++) {
      for (var c = 0; c < board[0].length; c++) {
        if (board[r][c] == 0) {
          fill("black");
          strokeWeight(2);
          rect(c * blockWidth, r * blockWidth, blockWidth, blockWidth);
        } else {
          strokeWeight(2);
          rect(c * blockWidth, r * blockWidth, blockWidth, blockWidth);
          drawBlock(c * blockWidth + 2.5, r * blockWidth + 3, board[r][c] - 1);
        }
      }
    }
    
    stroke(100);
    // Draw right board
    for (var r = 0; r < board2.length; r++) {
      for (var c = 0; c < board2[0].length; c++) {
        if (board2[r][c] == 0) {
          fill("black");
          strokeWeight(2);
          rect(board2x + (c * blockWidth), r * blockWidth, blockWidth, blockWidth);
        } else {
          strokeWeight(2);
          rect(board2x + (c * blockWidth), r * blockWidth, blockWidth, blockWidth);
          drawBlock(board2x + c * blockWidth + 2.5, r * blockWidth + 3, board2[r][c] - 1);
        }
        
      }
    }

    if (!gameIsOver) {
      // If left shape does not collide, fall
      if (frameCount % rate == 0) {
        if (!currentShape.doesCollide()) {
          currentShape.fall();
        } else {
          currentShape.shapeHit();
        }
      }

      currentShape.draw();

      // If right shape does not collide, fall
      if (frameCount % rate == 0) {
        if (!currentShape2.doesCollide()) {
          currentShape2.fall();
        } else {
          currentShape2.shapeHit();
        }
      }

      currentShape2.draw();
      checkRowFilled();
      checkGameOver();
    } else {
      textAlign(CENTER);
      textSize(70);
      fill(255);
      stroke("black");
      text("GAME OVER", canWidth / 2, canHeight / 2);
    }

    displayScore();
  }
}

// Class for left tetris shape
class Shape {
  // x, y top left corner of the matrix in the board
  constructor(x, y, id, board) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.color = colors[id];
    this.matrix = shapes[id];
    this.board = board;
  }

  // Draws matrix as blocks
  draw() {
    for (var r = 0; r < this.matrix.length; r++) {
      for (var c = 0; c < this.matrix[0].length; c++) {
        if (this.matrix[r][c] == 1) {
          // Draw block
          drawBlock(
            (this.x + c) * blockWidth + 2.5,
            (this.y + r) * blockWidth + 3,
            this.id
          );
        }
      }
    }
  }

  fall() {
    this.y += 1;
  }

  doesCollide() {
    var hit = false;
    for (var r = 0; r < this.matrix.length; r++) {
      for (var c = 0; c < this.matrix[0].length; c++) {
        if (this.matrix[r][c] != 0) {
          // Check bottom
          if (board[r + this.y + 1][c + this.x] != 0) {
            hit = true;
          }
        }
      }
    }
    return hit;
  }

  shapeHit() {
    for (var r = 0; r < this.matrix.length; r++) {
      for (var c = 0; c < this.matrix[0].length; c++) {
        if (this.matrix[r][c] == 1) {
          board[r + this.y][c + this.x] = this.id + 1;
        }
      }
    }
    currentShape = new Shape(0, 0, Math.floor(random(0, 7)), board);
  }
}

// Class for right tetris shape
class Shape2 {
  // x, y top left corner of the matrix in the board
  constructor(x, y, id, board) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.color = colors[id];
    this.matrix = shapes[id];
    this.board = board;
  }

  // Draws matrix as blocks
  draw() {
    for (var r = 0; r < this.matrix.length; r++) {
      for (var c = 0; c < this.matrix[0].length; c++) {
        if (this.matrix[r][c] == 1) {
          // Draw block
          drawBlock(
            board2x + (this.x + c) * blockWidth + 2.5,
            (this.y + r) * blockWidth + 3,
            this.id
          );
        }
      }
    }
  }

  fall() {
    this.y += 1;
  }

  doesCollide() {
    var hit = false;
    for (var r = 0; r < this.matrix.length; r++) {
      for (var c = 0; c < this.matrix[0].length; c++) {
        if (this.matrix[r][c] != 0) {
          // Check bottom
          if (board2[r + this.y + 1][c + this.x] != 0) {
            hit = true;
          }
        }
      }
    }
    return hit;
  }

  shapeHit() {
    for (var r = 0; r < this.matrix.length; r++) {
      for (var c = 0; c < this.matrix[0].length; c++) {
        if (this.matrix[r][c] == 1) {
          board2[r + this.y][c + this.x] = this.id + 1;
        }
      }
    }
    currentShape2 = new Shape2(0, 0, Math.floor(random(0, 7)), board2);
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
	console.log('press' + keyCode)
  var hit = false;
  if (keyCode == 65) {
    //A
    for (var r = 0; r < currentShape.matrix.length; r++) {
      for (var c = 0; c < currentShape.matrix[0].length; c++) {
        if (currentShape.matrix[r][c] != 0) {
          if (board[r + currentShape.y][c + currentShape.x - 1] != 0) {
            hit = true;
          }
        }
      }
    }
    if (!hit) {
      currentShape.x -= 1;
    }
  } else if (keyCode == 68) {
    for (var r = 0; r < currentShape.matrix.length; r++) {
      for (var c = 0; c < currentShape.matrix[0].length; c++) {
        if (currentShape.matrix[r][c] != 0) {
          if (board[r + currentShape.y][c + currentShape.x + 1] != 0) {
            hit = true;
          }
        }
      }
    }
    if (!hit) {
      currentShape.x += 1;
    }
  } else if (keyCode == 83 && !currentShape.doesCollide()) {
    //S
    currentShape.y += 1;
  } else if (keyCode == 87) {
    //W
    currentShape.matrix = rotatePiece(currentShape);
  }

  var hit2 = false;
  if (keyCode == LEFT_ARROW) {
    for (var r = 0; r < currentShape2.matrix.length; r++) {
      for (var c = 0; c < currentShape2.matrix[0].length; c++) {
        if (currentShape2.matrix[r][c] != 0) {
          if (board2[r + currentShape2.y][c + currentShape2.x - 1] != 0) {
            hit2 = true;
          }
        }
      }
    }
    if (!hit2) {
      currentShape2.x -= 1;
    }
  } else if (keyCode == RIGHT_ARROW) {
    for (var r = 0; r < currentShape2.matrix.length; r++) {
      for (var c = 0; c < currentShape2.matrix[0].length; c++) {
        if (currentShape2.matrix[r][c] != 0) {
          if (board2[r + currentShape2.y][c + currentShape2.x + 1] != 0) {
            hit2 = true;
          }
        }
      }
    }
    if (!hit2) {
      currentShape2.x += 1;
    }
  } else if (keyCode == DOWN_ARROW && !currentShape2.doesCollide()) {
    currentShape2.y += 1;
  } else if (keyCode == UP_ARROW) {
    currentShape2.matrix = rotatePiece(currentShape2);
  } else if(keyCode == 32 && player != "unknown") { // Space
  	console.log('go')
    gameStarted();
  }
}

function gameStarted() {
    startGame = true;
    player1Button.hide();
    player2Button.hide();
}


function rotatePiece(shape) {
  var newArray = [];
  var zeroArray = [];
  for (var i = 3; i >= 0; i--) {
    zeroArray.push(0);
    newArray.push([]);
  }
  
  // Fill new array with rotated blocks
  for (var i = 3; i >= 0; i--) {
    for (var j = 3; j >= 0; j--) {
      newArray[j].push(shape.matrix[i][j]);
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
  
  // If x less than width away from right edge, x -= width - dist - 1
  var dist = board[0].length - shape.x;
  
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
    shape.x -= width - dist;
  }
  
  // Check if overlap with other blocks
  for(var i = 0; i < 4; i++) {
    for(var j = 0; j < 4; j++) {
      if(newArray[i][j] != 0 && shape.board[i + shape.y][j + shape.x] != 0) {
        return shape.matrix;
      }
    }
  }
  
  return newArray;
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
  for (var j = 0; j < board[0].length; j++) {
    if (board[0][j] != 0) {
      gameIsOver = true;
      break;
    }
  }

  // Check board2
  for (var j = 0; j < board2[0].length; j++) {
    if (board2[0][j] != 0) {
      gameIsOver = true;
      break;
    }
  }
}

//seems to only work if row filled is first row? or maybe if they fill around the same time? idk, buggy
// If same row on both boards filled with non-zero numbers, clear row and move every row down. Increment score by 20.
function checkRowFilled() {
  var rowFilled = -1;
  for (var i = 0; i < board.length - 1 && rowFilled == -1; i++) {
    for (var j = 0; j < board[0].length; j++) {
      if (board[i][j] == 0) {
        break;
      }
      if(j == board[0].length - 1) {
        rowFilled = i;
      }
    }
  }

  if (rowFilled != -1) {
    var rowsFilled = true;
    for (var j = 0; j < board2[0].length; j++) {
      if (board2[rowFilled][j] == 0) {
        rowsFilled = false;
        break;
      }
    }

    if (rowsFilled) {
      // Remove row from boards
      board.splice(rowFilled, 1);
      board2.splice(rowFilled, 1);
      // Add new rows at the top of both boards
      var new_r = [];
      for (var i = 0; i < board[0].length; i++) {
        new_r[i] = 0;
      }
      board.unshift(new_r);
      board2.unshift(new_r);

      score += 20;
    }
  }
}

//won't run if logo is defined elsewhere
//might need to use standard JS to place logo
function displayTitleScreen() {
  logo = loadImage("https://cdn.glitch.com/e124587a-0d4d-42e9-90cc-450206705272%2FTetris%20Multiplayer.png?v=1595186550348");
  textAlign(CENTER);
  fill(255);
  image(logo, canWidth / 2 - 450 / 2, 100, 450, 236);
  textSize(16);
  text("A row must be filled across both boards to cancel out", canWidth / 2, 370);

  textAlign(LEFT);
  textSize(16);
  text("Player 1:", 100, 420);
  text("WASD to move, W to rotate", 100, 440);
  player1Button = createButton("Player 1");
  player1Button.position(120, 350);
  player1Button.mousePressed(function() {player="one"; console.log(player)});
  
  textAlign(RIGHT);
  text("Player 2:", canWidth - 100, 420);
  text("Arrow keys to move, up arrow to rotate", canWidth - 100, 440);
  player2Button = createButton("Player 2");
  player2Button.position(canWidth-120, 350);
  player2Button.mousePressed(function() {player="two"; console.log(player)});

  textAlign(CENTER);
  text("Chose player, then", canWidth/2, 480);
  text("press space to start", canWidth / 2, 500);
  
  text("Disclaimer: We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with the", canWidth / 2, canHeight - 40);
  text("Tetris Company, LLC or Tetris Holding LLC.", canWidth / 2, canHeight - 20);
}

function newDrawing(data) {
	console.log("Got: " + data.x + " " + data.y);
	fill(0,0,255);
	noStroke();
	ellipse(data.x, data.y, 20, 20);
}

function mouseDragged() {

	fill(255);
	noStroke();
	ellipse(mouseX,mouseY,20,20);
	sendMouse(mouseX,mouseY);
}

function sendMouse(xpos, ypos) {

	var data = {
		x: xpos,
		y: ypos
	};

  // Send that object to the socket
  socket.emit('mouse',data);
}
