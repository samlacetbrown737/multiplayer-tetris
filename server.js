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
      start1 = data.start;
    } else {
      start2 = data.start;
    }

    if(start1 && start2) {
      io.sockets.emit('start', true);
    }
  });

  socket.on('disconnect', function() {
    console.log("Client has disconnected");
    start1 = false;
    start2 = false;
  });
});
