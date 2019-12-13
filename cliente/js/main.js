var IP='http://10.0.175.158:80';

var socket = io.connect(IP, {'forceNew' : true});
var arregloDatos;

socket.on('imagenes', function(datos){
    arregloDatos = datos;
    document.getElementById('prueba').innerHTML = '';
    for(var i = 0; i < datos.length; i++){
        
        document.getElementById('prueba').innerHTML += ("<center><p>"+datos[i].NombreUsuario + "</p></center>");
        document.getElementById('prueba').innerHTML += ("<img src='img/"+ datos[i].NombreImagen+"'>");

        for(var k = 0; k < datos[i].Tags.length; k++){
            document.getElementById('prueba').innerHTML += ("<center><a href=/tags?tag="+datos[i].Tags[k]+">#"+datos[i].Tags[k] + "</a></center>");
        }
        
        document.getElementById('prueba').innerHTML += ("<hr>");
        
    } 
     
});

/*
Logica socket:

    1. Enviar al servidor un json tipo:
        {
            nombreImagen : 'asafasf.jpg',
            tasg : ['hola', 'mundo', 'tag']
        }

    2. Insertar esos datos en la BD

    3. Emitir a todos los usuarios un JSON con todas las imagenes
*/

var app = angular.module('Cliente', ['ngFileUpload']);
var nombreImagen;
var tagsImagen;


app.controller('ImagenesController', function($scope, $http) {

    $scope.arregloImagenes;



})

app.controller('FormularioController', function($scope, Upload, $window, $http){
    $scope.file;
    $scope.tags;
    var vectorDeTags;

    $scope.subir = function(archivo){
        Upload.upload({
            url:'/upload',
            data : { file : $scope.file }
        }).then(function(resp){
            if(resp.data.error_code === 0){ //validate success
                    nombreImagen = resp.config.data.file.name;
                    //$window.alert('La imagen ' + resp.config.data.file.name + '  Fue subida con éxito');
                } else {
                    $window.alert('an error occured');
            }
            nombreImagen = resp.config.data.file.name;
                    console.log('Nombre imagen => ' + nombreImagen);
            $scope.emitirJSONAlServidor(nombreImagen, tagsImagen);
        });

    };

    $scope.enviarFormulario = function(){
        //con string.trim() elimino los espacios
        vectorDeTags = $scope.tags;
        vectorDeTags = vectorDeTags.split(",");

        for(var i = 0; i < vectorDeTags.length; i++){
            vectorDeTags[i] = vectorDeTags[i].trim();
        }
        
        tagsImagen = vectorDeTags;
        $http.post('/recibirTags', {tags: vectorDeTags}).
        success(function(data, status, headers, config) {
            console.log('respuesta, pero en este caso el POST no devuelve nada :-)');
            
        }).
        error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
          });
        $scope.subir($scope.file);
        console.log('Tags imagen => ' + tagsImagen);
    };


     $scope.enviarRegistro = function(){
        
        Registros = $scope.Registro;
        console.log("REGISTROS: ",Registros);

        $http.post('/N',{DATA: Registros} ).
        success(function(data, status, headers, config) {
            console.log('USUARIO CREADO');
            
        }).
        error(function(data, status, headers, config) {
             
            // called asynchronously if an error occurs
            // or server returns response with an error status.
          });
    };
    
    $scope.emitirJSONAlServidor = function(imagen, tags){
        console.log('EMITIENDO DATOS AL SERVIDOR');
        console.log(imagen);
        console.log(tags);

        // var mensajeAlServidor = {
        //     NombreImagen : imagen,
        //     tagsImage : tags
        // };

        socket.emit('nuevaImagen', {});
    };

});

