

// Scrape button function ajax call

$(function () {
  $(".scrape").on("click", function (event) {
    
    $.ajax({
      method: "GET",
      url: "/scrape"
    })
      
      .then(function (data) {

        location.reload()

      });
  });

});



$(document).on("click", ".deletecomment", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "GET",
    url: "/delete/" + thisId
  

  }).then(

    function() {

      console.log("rows deleted  ");

      // Reload the page to get the updated list

      location.reload();

    }

  );

});












// save comment button ajax call
$(document).on("click", "#savenote", function () {
  
  var thisId = $(this).attr("data-id");
  var thistitle = $(this).attr("name")
  
  $.ajax({
    method: "POST",
    url: "/newsinfo/" + thisId,
    data: {
      title: thistitle,
      
      body: $("#bodyinput").val()
    }
  })
    
    .then(function (data) {
      
      console.log(data);
      
      $("#notes").empty();
    });

  
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
