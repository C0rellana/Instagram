var mysql      = require('mysql');
var crypto=require('crypto');

var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'appweb',
    debug    :  false
});

exports.findUser= function(req,res) {   
    pool.getConnection(function(err,connection){
        if (err) {
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }
        if(!req.body.password || !req.body.correo) return res.json({"code" : 100, "status" : "Por favor ingrese datos"});
        else{
            var pwd=req.body.password;
            var hashpassword=crypto.createHash('sha512').update(pwd).digest('hex');
            var correo=req.body.correo;
            var sql='SELECT contraseña from users WHERE correo = ?';
            var values=[[correo]];
            
            //console.log('connected as id ' + connection.threadId);
            
            connection.query(sql,[values],function(err,result){
                if(err) console.log(err);
                else if(result.length>0){
                    if(result[0].contraseña == pwd){

                        
                        var sess=req.session;
                        sess.correo=correo;

                        var sql='SELECT tipo from users WHERE Correo = ?';
                        var values=[[correo]];

                        connection.query(sql,[values],function(err,result){
                            console.log("tipo:",result[0].tipo);
                            if (result[0].tipo==1) {
                                //console.log("usuario normal");
                                res.redirect('/');
                                
                            }
                            else{
                                //console.log('ADMIN');
                               res.redirect('/ADMIN_VER'); 
                            
                            }   
                        });

                    }
                    else{
                    res.redirect('/login');
                    }
                }
                else{
                    res.redirect('/login');
                }
            });
            connection.on('error', function(err) {      
                  res.redirect('/login');
                  return;    
            });
            }
        });
}
