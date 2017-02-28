module.exports	= function(io) {
	var	crypto	=	require('crypto')
	var	sockets	= io.sockets;
	var onlines = {}
	sockets.on('connection', function (client) {
		var	session	= client.handshake.session
		, usuario =	session.usuario;

		onlines[usuario.email] = usuario.email
		
		for(var email in onlines){
			console.log("online "+ email+" sala: "+session.sala)
			client.emit("notify-onlines", email)
			client.broadcast.emit("notify-onlines", email)
		}
		
		client.on('send-server', function (msg) {
			console.log("Enviando ao servidor "+session.sala)

			var	sala =	session.sala
			, data = {email: usuario.email,	sala: sala};
			msg	= "<b>"+usuario.nome+":</b>	"+msg+"<br>";
			client.broadcast.emit('new-message', data);
			sockets.in(sala).emit('send-client', msg);
		});
		
		client.on('join', function(sala) {

			console.log("sala existe"+sala)
			if(!sala) {
				console.log("Criando sala"+sala)
				var	timestamp =	new Date().toString()
				, md5 = crypto.createHash('md5');
				sala = md5.update(timestamp).digest('hex');
			}
			session.sala =	sala;
			client.join(sala);
		});

		client.on('disconnect',	function() {
			console.log("Desconectado"+usuario.email)
			var sala = session.sala
			var msg = "<b>"+usuario.nome+"</b> saiu"
			client.broadcast.emit("notify-offlines", msg)
			sockets.in(sala).emit("send-client", msg)
			delete onlines[usuario.email];
			client.leave(sala);

		});
	});

}