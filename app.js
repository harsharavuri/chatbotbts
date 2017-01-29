// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
// var io = require('../..')(server);
// New:
var io = require('socket.io')(server);

var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

var numUsers = 0;


app.get('/pdf', function(request, res){
	
	var s = request.url;
	s = s.split('?')[1];
	
	//res.send(s);
	var params = s.split('&');
	console.log(params);
	var i = params.length-1; 
	//console.log(params);
	
	//res.render('sample', paramValues:params} );
	res.render('sample', { name:params[0], age:params[1], bloodgroup:params[2], sex:params[3], otherinfo:params[4], symptom:params[5], bodypart:params[6] })
	//res.send("Hello World");
/*		var headers = request.headers;
  var method = request.method;
  var url = request.url;
  var body = [];
  request.on('error', function(err) {
    console.error(err);
  }).on('data', function(chunk) {
    body.push(chunk);
  }).on('end', function() {
    body = Buffer.concat(body).toString();
    console.log(request);
	//console.log(headers);
	//console.log(method);
	// At this point, we have the headers, method, url and body, and can now
    // do whatever we need to in order to respond to this request.
  });*/
	});

app.set('view engine', 'pug');

server.on('request', function(request, response){
	//
	  var headers = request.headers;
	  var method = request.method;
	  var url = request.url;
	  var body = [];
	  //console.log(headers);
		request.on('data', function(chunk) {
		  body.push(chunk);
		}).on('end', function() {
		  body = Buffer.concat(body).toString();
		  // at this point, `body` has the entire request body stored in it as a string
		});
	
});






io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
