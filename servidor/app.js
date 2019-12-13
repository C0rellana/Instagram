  var IP='10.0.175.158';
  var PORT='80';
  var express = require('express'); 
  var app = express(); 
  var bodyParser = require('body-parser');
  var multer = require('multer');    
  var jsonParse=bodyParser.json();
  var mysql = require('mysql');
  var server = require('http').Server(app);
  var io = require('socket.io')(server);
  var users = require('./users');
  var urlencodedParser = bodyParser.urlencoded({ extended: false });
  var session = require('express-session');
  var funcion = require('./funciones');

  // Directorio estatico donde estan las imagenes "/img"
  app.use('/img', express.static(__dirname + '/Public/uploads'));
  app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

  //Variables globales necesarias.
  var tagsDeImagen;
  var jsonImagenes = [];



  var auth = function(req, res, next) {
    if (req.session && req.session.correo)
      return next();
    else
      return res.status(401).redirect('/login');
    
  };

  var auth1 = function(req, res, next) {
    if (req.session && req.session.correo)
      return next();
    else
      return res.redirect('/login');
    
  };

  //Conexion a la Base de Datos

  var connection = mysql.createConnection({
     host: 'localhost',
     user: 'root',
     password: '',
     database: 'appweb',
     port: 3306
  });

  connection.connect(function(error){
     if(error){
        throw error;
     }else{
        console.log('Conexion a la BD correcta.');
     }
  });
        


  //*-------------- Seccion Codigo Administrador--------------* 

  var authAdmin = function(req, res, next) {

    if (req.session && req.session.correo){
        var sql='SELECT tipo from users WHERE Correo = ?';
        var values=[[req.session.correo]];

        connection.query(sql,[values],function(err,result){
            console.log("tipo:",result[0].tipo);
            if (result[0].tipo==2) {

                return next();
            }
            else{
              return res.status(401).redirect('/login');
            };
        });
    }
    
    else{ 
      return res.status(401).redirect('/login');

    };        
  };

  app.get('/BorrarImagen',authAdmin,urlencodedParser, function(req,res){
      console.log(req.query.imagen);
      funcion.BorrarImagen(req.query.imagen,function(respuesta){

        BorrarImgJson(req.query.imagen); // Borrar la imagen del json 

        res.redirect('ADMIN_VER');
      }); 
  
  }); 

  function BorrarImgJson(IMAGEN){
    for (var i = 0; i<jsonImagenes.length;i++) {
      console.log(jsonImagenes[i].NombreImagen);
      if(jsonImagenes[i].NombreImagen==IMAGEN){
        jsonImagenes.splice(i, 1);     
      }
      else{
      }
    };
  };

  app.get('/ADMIN_VER',authAdmin, function(req,res){
    res.redirect('ADMIN/AD_VER.html');
  }); 

  app.get('/Mostrar',authAdmin,function(req,res){
   
      connection.query('SELECT imagenes.ID as ID, users.Nombre as NOMBRE, imagenes.Ruta as RUTA,`tags`.`nombre`as TAG FROM Imagenes INNER JOIN tag_img ON imagenes.ID= tag_img.ID_Imagen INNER JOIN tags ON tag_img.ID_Hashtag=tags.ID INNER JOIN users ON imagenes.ID_Usuario=users.ID_Usuario ORDER BY imagenes.Fecha DESC' ,function(err, rows, fields){
      var tags_img = [];
      var i=0;
      var k=0;
      var contador=0;
      var JsonMostrar=[];

      while(i< rows.length){
        tags_img.push(rows[i].TAG)
        var ID_actual= rows[i].ID;

        while(k<rows.length){           
           if (rows[i].ID==rows[k].ID){ 
              if (tags_img.indexOf(rows[k].TAG) ==-1) {//si el tag no existe se ingresa
                tags_img.push(rows[k].TAG)
                contador=contador+1;
              }
          }

          k=k+1;
        }
        k=0;
      
        var data = { NombreUsuario: rows[i].NOMBRE, NombreImagen: rows[i].RUTA, Tags: tags_img }
        tags_img = []; //restablecer arreglo de tags
        JsonMostrar.push(data); //guardar data en el resultado.

        i=i+1+contador;
        contador=0;
      }
      //console.log(JsonMostrar);
      res.json(JsonMostrar);
    });
    
  });



  /*------------------RUTAS PRINCIPALES-----------------------*/


  app.get('/',auth,function(req,res){
          //SuperConsulta();
          res.redirect('menu.html');
  }); 


  app.get('/registro',function(req,res){
    res.redirect('registro.html')

  }); 

  app.post('/login',urlencodedParser,function(req,res){
    users.findUser(req,res);
  });


  app.get('/login',function(req,res){
    res.redirect('login.html')

  }); 

  app.get('/logout', function(req, res){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
      req.session.destroy(function(){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
          res.redirect('/');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
      });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
  });   


  app.get('/tags',auth,jsonParse,function(req,res){
    var tag=[[req.query.tag]];
    res.redirect('tags.html?valor='+tag);
  });   

  app.get('/mostrar_tags',auth,jsonParse,function(req,res){
      var sql='SELECT `imagenes`.`Ruta`,`tags`.`nombre` FROM Imagenes INNER JOIN tag_img ON imagenes.ID= tag_img.ID_Imagen INNER JOIN tags ON tag_img.ID_Hashtag=tags.ID where tags.Nombre=?'
      var values=[[req.query.valor]];
      connection.query(sql,[values],function(err,result){
        res.json(result);
      });
  });    


    /** Configuraciones MULTER y UPLOAD**/

    app.use(express.static('../cliente'));
    app.use(bodyParser.json());  

    var storage = multer.diskStorage({ //CONFIGURACIONES DE MULTER ( DESTINO DE IMAGEN  Y NOMBRE DE ARCHIVO)

        destination: function (req, file, cb) {
            cb(null, './Public/uploads');
        },
        filename: function (req, file, cb) {

          var datetimestamp = Date.now();
          NombreOriginal =file.originalname; // NOMBRE ORIGINAL DEL ARCHIVO SUBIDO
          nombreImagen = file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
          

          //INSERTANDO EL USUARIO DE SESION
          var sql='SELECT ID_Usuario, Nombre from users WHERE Correo = ?';
          var values=[[req.session.correo]];

          connection.query(sql,[values],function(err,result){
            console.log("ID:",result[0].ID_Usuario);
            usuario=result[0].ID_Usuario;
            var nombreUser = result[0].Nombre;

            cb(null,nombreImagen); // SE LE ASIGNA EL NUEVO nombreImagen AL ARCHIVO

            funcion.insert_Imagen(NombreOriginal,nombreImagen,usuario,tagsDeImagen); //LLAMADO A FUNCION INSERTAR-IMAGEN
      
            var nuevoJSON = {
              NombreUsuario : nombreUser,
              NombreImagen : nombreImagen,
              Tags : tagsDeImagen
            };

            jsonImagenes.unshift(nuevoJSON);

         
           });

        }

    });



    var upload = multer({ //Otras configuraciones de MULTER
                    storage: storage
                }).single('file');
    

    //METODO POST PARA RECIBIR LA IMAGEN DEL FORM.
    app.post('/upload',auth1, function(req, res) {
        upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
             res.json({error_code:0,err_desc:null});
        });
    });


    //METODO POST PARA RECIBIR LOS TAGS DESDE EL FORM
    app.post('/recibirTags',auth1, function(req, res){

        tagsDeImagen = req.body.tags;
    });
       

    app.post('/registrar',urlencodedParser, function(req, res){

      funcion.CrearUsuario(req.body,function(respuesta){

           console.log("la respuesta es : ", respuesta);
          if (respuesta) {
            //console.log("Fracaso");
            res.redirect('/registro');
      
          }else{
            //console.log("Exito");
            res.redirect('/login');
          }

        })

    });


//SUPER CONSULTA
function SuperConsulta () {
  connection.query('SELECT imagenes.ID as ID, users.Nombre as NOMBRE, imagenes.Ruta as RUTA,`tags`.`nombre`as TAG FROM Imagenes INNER JOIN tag_img ON imagenes.ID= tag_img.ID_Imagen INNER JOIN tags ON tag_img.ID_Hashtag=tags.ID INNER JOIN users ON imagenes.ID_Usuario=users.ID_Usuario ORDER BY imagenes.Fecha DESC' ,function(err, rows, fields){
  var resultado = [];
  var tags_img = [];
  var i=0;
  var k=0;
  var contador=0;

  while(i< rows.length){
    tags_img.push(rows[i].TAG)
    var ID_actual= rows[i].ID;

    while(k<rows.length){           
       if (rows[i].ID==rows[k].ID){ 
          if (tags_img.indexOf(rows[k].TAG) ==-1) {//si el tag no existe se ingresa
            tags_img.push(rows[k].TAG)
            contador=contador+1;
          }
      }

      k=k+1;
    }
    k=0;
  
    var data = { NombreUsuario: rows[i].NOMBRE, NombreImagen: rows[i].RUTA, Tags: tags_img }
    tags_img = []; //restablecer arreglo de tags
    jsonImagenes.push(data); //guardar data en el resultado.

    i=i+1+contador;
    contador=0;
  }

});
}

SuperConsulta();

//FIN SUPER CONSULTA


// SOCKET ---- Escuchando en el servidor el evento connection

io.on('connection',function(socket){
    socket.emit('imagenes', jsonImagenes); 

    socket.on('nuevaImagen', function(data){
        io.sockets.emit('imagenes', jsonImagenes);
        //console.log(jsonImagenes);
    });
});

server.listen(PORT,IP, function(){
        console.log('Servidor Corriendo en: ', PORT,IP);
  });
