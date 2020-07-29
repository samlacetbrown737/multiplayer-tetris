var express = require('express');
var app = express();
var server = app.listen(process.env.PORT || 56151, listen);
var start1 = false;
var start2 = false;

function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('listening');
}

app.use(express.static('public'));

var io = require('socket.io')(server);
io.sockets.on('connection',
  function (socket) {
  
	console.log("We have a new client: " + socket.id);

	socket.on('move',
		function(data) {
			console.log("Key " + data.keyPressed + " from player " + data.user);
			socket.broadcast.emit('move', data);
		}
	);

	socket.on('newPiece',
	  function(data) {
		console.log("Piece " + data.piece.id + " on " + data.board);
		socket.broadcast.emit('newPiece', data);
	  }
	);

	socket.on('pause',
	  function(data) {
		console.log("Received: 'pause' " + data.pause);
		socket.broadcast.emit('pause', data);
	  }
	);

	socket.on('start',
	  function(data) {
		console.log("Received: 'start' " + data.player);
		if(data.player == "one") {
		  start1 = true;
		} else if (data.player == "two") {
		  start2 = true;
		}
		console.log(start1 + " " + start2);
		if(start1 && start2) {
        	io.sockets.emit('start', true);
    	}
	  }
	);
	
	socket.on('disconnect', function() {
	  console.log("Client has disconnected");
	  start1 = false;
	  start2 = false;
	});
  }
);

