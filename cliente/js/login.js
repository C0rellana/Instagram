$(document).ready(function(){
  $("#submit").click(function(){
      $.post("/login",
      {
        correo: $("#correo").val(),
        password: $("#password").val()
      },
      function(data, status){
        if (typeof data.redirect == 'string') window.location = data.redirect;
        else {
          $(".error" ).text(data.status).show( "slow","linear" ).fadeOut();
        }
      });
  });
});