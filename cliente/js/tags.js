
function getQueryVariable(variable) {
    // Estoy asumiendo que query es window.location.search.substring(1);
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0; i < vars.length; i++) {
        var pair = vars[i].split("="); 
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return false;
};

var valor=(getQueryVariable('valor'));
var conten_type;

var app = angular.module('myApp', []);
app.controller('customersCtrl', function($scope, $http) {
   $scope.nombreTag =valor;
	
    $http.get("/mostrar_tags?valor="+valor)
    .then(function (response) {$scope.baseD = response.data;
      console.log($scope.baseD);

    });
}); 

