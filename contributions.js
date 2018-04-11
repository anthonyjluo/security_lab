/********************************************************************************/
/*										*/
/*		contributions.js						*/
/*										*/
/*	Handle contributions							*/
/*										*/
/********************************************************************************/


/********************************************************************************/
/*										*/
/*	Imports 								*/
/*										*/
/********************************************************************************/

var db = require("./database.js");



/********************************************************************************/
/*										*/
/*	Hnadle Display Contributions page					*/
/*										*/
/********************************************************************************/

function displayContributions(req,res,next)
{
    displayContributions0(req,res,next,false);
}



function displayContributions0(req,res,next,sts)
{
   var userid = req.session.userId;
   var q = "SELECT * FROM Contributions WHERE userId = ?";
   db.query(q,[userid],function (e1,d1) { displayContributions1(req,res,next,sts,e1,d1); } );
}



function displayContributions1(req,res,next,sts,err,data)
{
   if (err) return next(err);

   var contrib = data.rows[0];
   if (sts == true) contrib.updateSuccess = true;
   return res.render("contributions",contrib);
}




/********************************************************************************/
/*										*/
/*	Handle Contributions Update Page					*/
/*										*/
/********************************************************************************/

function handleContributionsUpdate(req,res,next)
{
   // convert to numbers
   var preTax = Number(req.body.preTax);
   var afterTax = Number(req.body.afterTax);
   var roth = Number(req.body.roth);

   var userId = req.session.userId;

   //validate contributions
   if (isNaN(preTax) || isNaN(afterTax) || isNaN(roth) || preTax < 0 || afterTax < 0 || roth < 0) {
      return res.render("contributions", {
			updateError: "Invalid contribution percentages",
				  userId: userId
			 });
    }
   // Prevent more than 30% contributions
   if (preTax + afterTax + roth > 30) {
      return res.render("contributions", {
			updateError: "Contribution percentages cannot exceed 30 %",
				  userId: userId
			 });
    }
   var q = "UPDATE Contributions SET preTax = ?, afterTax = ?, roth = ?" + " WHERE userId = ?";
   db.query(q,[preTax.toString(), afterTax.toString(), roth.toString(), userId],
    function (e1,d1) { handleContributionsUpdate1(req,res,next,e1,d1); } );
}


function handleContributionsUpdate1(req,res,next,err,data)
{
   if (err) return next(err);

   return displayContributions0(req,res,next,true);
}




/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.displayContributions = displayContributions;
exports.handleContributionsUpdate = handleContributionsUpdate;




/* end of contributions.js */
