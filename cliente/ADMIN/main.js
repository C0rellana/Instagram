var app = angular.module('ADMIN_VER', []);
var X ;

app.controller('MostrarController', function($scope, $http) {
    $http.get("/Mostrar").then(function (response) {
        $scope.arregloImagenes = response.data;
    });


     $scope.subir = function(archivo){
        Upload.upload({
            url: '/upload',
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

});




