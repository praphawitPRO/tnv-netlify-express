var mysql = require('mysql');

var connection = mysql.createConnection({
	host:'tnv-db.czkq9l6gxyfz.ap-southeast-1.rds.amazonaws.com',
	user:'tnv-readonly',
	password:'F*XsVY7Tgxb6ZX^XR0',
	database:'tnv'
});

connection.connect(function(error){
	if(!!error) {
		console.log(error);
	} else {
		console.log('Connected..!');
	}
});

module.exports = connection;