var mysql = require('mysql');
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

/*
Secuencia de Inserción
1. function  insert_Imagen (NombreOriginal,nombreImagen,usuario,tagsDeImagen)
2. function  insert_Tags(Tags,ID_img)
3. function  insert_Tags_Img(ID_tag,ID_img)
*/


/* ------------------- FUNCIONES ----------------------*/

//FUNCION QUE INSERTA EN LA TABLA "TAG-IMG" los ID'S ENVIADOS DESDE LA FUNCION INSERTAR TAGS.
function insert_Tags_Img(ID_tag,ID_img) {
     
    var query = connection.query('INSERT INTO tag_img(ID_Imagen,ID_Hashtag) VALUES(?,?)', [ID_img,ID_tag], function(error, result){
     	if(error){
        	throw error;
     	}else{
    	}
 	 });

}


//FUNCION QUE INSERTA LOS TAGS A LA BD MEDIANTE UN FOR PARA RECORRER EL VECTOR 'TAGS'
function  insert_Tags(Tags,ID_img) {

   for (var i = Tags.length - 1; i >= 0; i--) {
      var query = connection.query('INSERT INTO tags(ID,Nombre) VALUES(?,?)', ['',Tags[i]], function(error, result){
         if(error){
            throw error;
         }else{
            var ID_tag=result.insertId; //Obtengo el ultimo valor del campo ID ingresado.
            insert_Tags_Img(ID_tag,ID_img); 
         }
      });

   };
}


// FUNCION INSERTAR IMAGEN

 function insert_Imagen (NombreOriginal,nombreImagen,usuario,tagsDeImagen) {
      var query = connection.query('INSERT INTO imagenes(ID,Nombre,Ruta,ID_Usuario) VALUES(?,?,?,?)', ['',NombreOriginal,nombreImagen,usuario], function(error, result){
         if(error){
            throw error;
         }else{
            var ID_img=result.insertId; //OBTENEMOS EL ID AUTOINCREMENTO DE LA IMAGEN INSERTADA A LA BD.
            insert_Tags(tagsDeImagen,ID_img); // LLAMADO A FUNCION INSERTAR TAGS.
       
         }
      });
  }



//FUNCION PARA CREAR USUARIO.

function CrearUsuario(DATA, Callback) {    
  
      //COMPROBAR SI YA EXISTE EL USUARIO ANTES DE REGISTRAR.

      var sql='SELECT Nombre from users WHERE Correo = ?';
      var values=[[DATA.Correo]];
      
      connection.query(sql,[values],function(err,result){
          if(err) console.log(err);
          else if(result.length>0){ 
             respuesta=true;
             Callback(respuesta);
             
          }
          else{ // SI NO SE ENCUENTRA ENTONCES SE REGISTRA

              var query = connection.query('INSERT INTO users(Nombre,Correo,Contraseña,Tipo) VALUES(?,?,?,?)', [DATA.Nombre,DATA.Correo,DATA.password,'1'], function(error, result){
               if(error){
                  throw error;
               }else{
                  respuesta=false;
                  Callback(respuesta);
                  
                  
               }
              });
          }
      });
}


//BORRAR LA IMAGEN SEGUN NOMBRE
function BorrarImagen(NombreImagen, Callback) {     
  
      //COMPROBAR SI YA EXISTE EL USUARIO ANTES DE REGISTRAR.

      var sql1='SELECT id from imagenes WHERE Ruta = ?';
      var sql2='delete from tag_img WHERE ID_Imagen = ?';
      
      
      var values1=[[NombreImagen]];
      
      connection.query(sql1,[values1],function(err,result){
        console.log(result[0].id);
          if(err){
           // console.log(result);
            respuesta="Error1";
            Callback(respuesta);         
          }
          else{
                  connection.query(sql2,[result[0].id],function(err,result){ //aqui estoy editando
                    if(err){
                      respuesta="Error2";
                      Callback(respuesta);         
                    }
                    else{
                      
                      respuesta="se ha eliminado correctamente";
                      Callback(respuesta);
                    }
                });
          }
      });
}



/*-Exportar Funciones-*/


exports.insert_Imagen = insert_Imagen; //Exportamos la función
exports.CrearUsuario = CrearUsuario; 
exports.BorrarImagen = BorrarImagen; 

