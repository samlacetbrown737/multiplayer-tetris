// var express = require('express');
// var app = express();
// var server = app.listen(3000);

// app.use(express.static('public'));
// console.log('socker server running')
// var socket = require('socket.io');
// var io = (server);
// io.sockets.on('connection', newConnection);

// function newConnection(socket) {
// 	console.log('new connection: ' + socket.id); //note that something has connected and display it's id
// 	socket.on('mouse', mouseMessage); //if there is a message from this connection called mouse, run mouseMessage
// 	socket.on('disconnect', disconnected);
// }

// function mouseMessage(data) {
// 	console.log(data);
// 	io.sockets.emit('mouse', data); //sends to everyone, including one that sent the message
// 	//socket.broadcast.emit('mouse', data);
// }

// function disconnected() {
// 	console.log('disconnected');
// }

var start1;
var start2;

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
  function (socket) {
    console.log("We have a new client: " + socket.id);
    
    socket.on('move',
      function(data) {
        console.log("Received: 'move' " + data.user + " " + data.keyPressed);

        // Send it to all other clients
        socket.broadcast.emit('move', data);
        
        // This is a way to send to everyone including sender
        // io.sockets.emit('message', "this goes to everyone");
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
        console.log("Received: 'start' " + data.user);
        if(data.user == "one") {
          start1 = data.start;
        } else {
          start2 = data.start;
        }

        if(start1 && start2) {
          io.sockets.emit('startGame', true);
        }
      }
    );
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);