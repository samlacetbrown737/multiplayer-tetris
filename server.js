var start1;
var start2;
var reset1;
var reset2;

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
io.sockets.on('connection', function (socket) {
  console.log("We have a new client: " + socket.id);

  socket.on('board', function(data) {
    socket.broadcast.emit('board', data);
  });

  socket.on('pause', function(data) {
    console.log("Received: 'pause' " + data.pause);
    socket.broadcast.emit('pause', data);
  });

  socket.on('start', function(data) {
    console.log("Received: 'start' " + data.user);
    if(data.user == "one") {
      start1 = true;
    } else {
      start2 = true;
    }
    console.log(start1 + " " + start2)
    if(start1 && start2) {
      io.sockets.emit('start', true);
    }
  });

  socket.on('reset', function(data) {
    console.log("Received: 'reset' " + data.user);
    if(data.user == "one") {
      reset1 = true;
    } else if(data.user == "two") {
      reset2 = true;
    }

    if(reset1 && reset2) {
      io.sockets.emit('reset', true);
    }
  });

  socket.on('disconnect', function() {
    console.log("Client has disconnected");
    start1 = false;
    start2 = false;
    reset1 = false;
    reset2 = false;
  });
});
