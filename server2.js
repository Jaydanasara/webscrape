// Dependencies
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express

var db = require("./models");
var PORT = 3000;

var app = express();

app.use(express.static("public"));
app.use("/assets", express.static("assets"));
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");



var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/prosports";

mongoose.connect(MONGODB_URI);


// database get route

app.get("/", function (req, res) {

  db.newsinfo.find({})
    .then(function (dbnewsinfo) {
      res.render("index", { newsinfo: dbnewsinfo });
    })
    .catch(function (err) {
      res.json.apply(err);

    });
});

// Scrape route

app.get("/scrape", function (req, res) {
 
  axios.get("https://www.prosportsdaily.com/").then(function (response) {
   
    var $ = cheerio.load(response.data);

   
    $(".unstyled a").each(function (i, element) {

      if (element.nextSibling.next) {
       
        var result = {};

        result.title = element.children[0].data;


        result.url = "https://www.prosportsdaily.com" + element.attribs.href;

        

        result.summary = element.nextSibling.next.childNodes[2].data;

        console.log(result.title)
        db.newsinfo.create(result)
        .then(function (dbnewsinfo) {
     
          console.log(dbnewsinfo);
        })
        .catch(function (err) {
         
          console.log(err);
        });
      }
      

    });

    res.send("Search Complete");
  });

});


// veiw comment route

app.get("/comments/:id", function (req, res) {
  
  db.newsinfo.findOne({ _id: req.params.id })

    .populate("note")
    .then(function (dbnewsinfo) {
      
      res.render("comments-page", dbnewsinfo);
      console.log (dbnewsinfo);
    })
    .catch(function (err) {
      
      res.json(err);
    });
});

// leave a comment route

app.get("/:id", function (req, res) {
  db.newsinfo.findOne({ _id: req.params.id })
    .then(function (dbnewsinfo) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.render("single-quote", dbnewsinfo);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err)

    });
});

// create comment route

app.post("/newsinfo/:id", function (req, res) {
  
  db.Note.create(req.body)
    .then(function (dbNote) {
     
      return db.newsinfo.findOneAndUpdate({ _id: req.params.id },{ $push: { note: dbNote._id } }, { new: true });
      
    })
    .then(function (dbnewsinfo) {
      
      res.json(dbnewsinfo);
    })
    .catch(function (err) {
     
      res.json(err);
    });
});

// delete comment route

app.get("/delete/:id", function(req, res) {
  // Remove a note using the objectID
  db.Note.remove({ _id: req.params.id })
    
    .then (function(error, removed) {
      // Log any errors from mongojs
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        console.log(removed);
        res.send(removed);
      }
    }
  );
});













// app.get("/newsinfo/:title", function (req, res) {
//   // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
//   db.Note.find({ note: dbNote.title })
//     // ..and populate all of the notes associated with it

//     .then(function (dbNote) {
//       // If we were able to successfully find an Article with the given id, send it back to the client
//       res.render("comments-page", dbNote);
//     })
//     .catch(function (err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });











// Listen on port 3000
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
})