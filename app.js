const KEY = 'ntalk.sid',  SECRET  = 'ntalk';
var	express	= require('express')
, load = require("express-load")	
, bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, expressSession = require('express-session')
, methodOverride	= require('method-override')
, server =	require('http').Server(app)
, io =	require('socket.io')(server)
, cookie  = cookieParser(SECRET)
, store = new expressSession.MemoryStore()  
, app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser('ntalk'));
app.use(expressSession({
        secret: SECRET, 
        name: KEY,  
        resave: true, 
        saveUninitialized:  true,
        store:  store
    }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:	true}));
app.use(express.static(__dirname + '/public'));

io.use(function(socket, next) {
  var data  = socket.request;
  cookie(data,  {}, function(err) {
    var sessionID = data.signedCookies[KEY];
    store.get(sessionID,  function(err, session) {
        if  (err  ||  !session) {
            return  next(new Error('acesso  negado'));
        } else  {
            socket.handshake.session  = session;
            return  next();
        }
    });
  });
});

load("controllers")
.then("models")
.then("routes")
.into(app)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

load('sockets')
.into(io);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, function(){
	console.log("Ntalk no ar.");
});

server.listen(2000, function(){
	console.log("Socket no ar.");
});

module.exports = app;
