/********************************************************************************/
/*										*/
/*	Main Server for Security Lab						*/
/*										*/
/********************************************************************************/

/********************************************************************************/
/*										*/
/*	Imports 								*/
/*										*/
/********************************************************************************/

var express = require("express");
var favicon = require("serve-favicon");
var bodyParser = require("body-parser");
var session = require("express-session");

var consolidate = require("consolidate"); // Templating library adapter for Express
var swig = require("swig");
var http = require("http");
var marked = require("marked");

var logger = require("morgan");

var config = require("./config.js");
var sessionmanager = require("./session.js");
var profile = require("./profile.js");
var contributions = require("./contributions.js");
var benefits = require("./benefits.js");
var allocations = require("./allocations.js");
var memos = require("./memos.js");
var csrf = require('csurf');


/********************************************************************************/
/*										*/
/*	Setup routing using express						*/
/*										*/
/********************************************************************************/

function setup()
{
   var app = express();

   app.disable("x-powered-by");
   app.use(favicon(__dirname + "/app/assets/favicon.ico"));

   app.use(bodyParser.json());
   app.use(bodyParser.urlencoded({ extended: false }));
   //app.use(expressSanitized());
   app.use(session({ secret: config.COOKIE_SECRET,
		     saveUninitialized: true,
		     resave: true }));
   app.use(csrf());
    app.use(function (req, res, next) {
      res.locals.csrfToken = req.csrfToken();;
      next();
    });
   // Register templating engine
   app.engine(".html", consolidate.swig);
   app.set("view engine", "html");
   app.set("views", __dirname + "/app/views");

   app.use(express.static(__dirname + "/app/assets"));
   
   app.use(logger('combined'));
   
   // intialize marked library
   marked.setOptions({ });
   app.locals.marked = marked;

   var isAdmin = sessionmanager.isAdminUserMiddleware;
   app.get("/", sessionmanager.displayWelcomePage);

   app.get("/login", sessionmanager.displayLoginPage);
   app.post("/login", sessionmanager.handleLoginRequest);

   app.get("/signup", sessionmanager.displaySignupPage);
   app.post("/signup", sessionmanager.handleSignup);

   // Logout page
   app.get("/logout", sessionmanager.displayLogoutPage);

   // Handle redirect for learning resources link
   app.get("/tutorial", function(req, res, next) {
	      return res.render("tutorial/a1");
	    });
   app.get("/tutorial/:page", function(req, res, next) {
	      return res.render("tutorial/" + req.params.page);
	    });

   // anything below here requires login
   app.use(sessionmanager.isLoggedInMiddleware);

   // The main page of the app
   app.get("/dashboard", sessionmanager.displayWelcomePage);

   // Profile page
   app.get("/profile", profile.displayProfile);
   app.post("/profile", profile.handleProfileUpdate);

    // Contributions Page
   app.get("/contributions", contributions.displayContributions);
   app.post("/contributions", contributions.handleContributionsUpdate);

   // Allocations Page
   app.get("/allocations/:userId", allocations.displayAllocations);

   // Memos Page
   app.get("/memos", memos.displayMemos);
   app.post("/memos", memos.addMemos);

   // Handle redirect for learning resources link
   app.get("/learn", function(req, res, next) {
          if (req.query.url != "https://www.khanacademy.org/economics-finance-domain/core-finance/investment-vehicles-tutorial/ira-401ks/v/traditional-iras") {
               res.status(404);
               return res.render("error-template", {'error': '404 Error'});
          }
	      return res.redirect(req.query.url);
   });
   app.use(isAdmin);
   // Benefits Page
   app.get("/benefits", benefits.displayBenefits);
   app.post("/benefits", benefits.updateBenefits);

   // Error handling middleware
   app.use(errorHandler);

   // Template system setup
   swig.setDefaults({
	 autoescape: false
    });

   var port = config.PORT;
   var server = app.listen(port);

   console.log("Listening on " + port);
}




/********************************************************************************/
/*										*/
/*	Handle errors								*/
/*										*/
/********************************************************************************/

function errorHandler(err,req,res,next)
{
   console.log(err.message);
   console.log(err.stack);
   res.status(500);
   res.render("error-template", { error : err } );
}



/********************************************************************************/
/*										*/
/*	Main program								*/
/*										*/
/********************************************************************************/

setup();




/* end of server.js */
