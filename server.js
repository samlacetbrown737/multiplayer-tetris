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




var express = require('express');
var app = express();
var server = app.listen(process.env.PORT || 3000, listen);
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
  
    // When this user emits, client side: socket.emit('otherevent',some data);
    socket.on('mouse',
      function(data) {
        // Data comes in as whatever was sent, including objects
        console.log("Received: 'mouse' " + data.x + " " + data.y);
      
        // Send it to all other clients
        socket.broadcast.emit('mouse', data);
        
        // This is a way to send to everyone including sender
        // io.sockets.emit('message', "this goes to everyone");

      }
    );
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);

