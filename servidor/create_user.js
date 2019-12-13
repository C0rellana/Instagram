var mysql = require('mysql');
var crypto=require('crypto');

var con=mysql.createConnection({
  user:'root',
  password:'',
  database:'appweb' 
});

var username=process.argv[2];
var password=process.argv[3];

var salt=Math.round((new Date().valueOf()*Math.random()))+'';
var hashpassword=crypto.createHash('sha512').update(password).digest('hex');

con.connect(function(err){
	if(!err){
		console.log('Database is connected!');
	}
	else{
		console.log('Database is NOT connected!');	
	}
});

var sql='INSERT INTO user (username,password)  VALUES ?';
var values=[[username,hashpassword]];
con.query(sql,[values],function(err,result){
	if(err) console.log(err);
		console.log(result);
});

con.end();