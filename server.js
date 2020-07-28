var express = require('express');
var app = express();
var server = app.listen(process.env.PORT || 56151, listen);

function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('listening');
}

app.use(express.static('public'));

var io = require('socket.io')(server);
io.sockets.on('connection',
  // We are given a websocket object in our function
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
        console.log("Piece " + data.id);
        socket.broadcast.emit('newPiece', data);
      }
    );

    socket.on('pause',
      function(data) {
        console.log("Received: 'pause' " + data.pause);
        socket.broadcast.emit('pause', data);
      }
    );

    var start1 = false;
    var start2 = false;
    socket.on('start',
      function(data) {
        console.log("Received: 'start' " + data.user);
        console.log(data.user + " " + start1 + " " + start2);
        if(data.user == "one") {
          start1 = data.start;
        } else if (data.user == "two") {
          start2 = data.start;
        }
        console.log(start1 + " " + start2);
        if(start1 && start2) {
          console.log(start1 + " " + start2);
          io.sockets.emit('startGame', true);
        }
      }
    );
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);

