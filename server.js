//DOCS
//http://www.seeques.com/22919199/transfer-files-to-dropbox-from-node-js-without-browser-based-oauth-authentication.html
	

//External SAL configuration file 
var dboxconfig = require('./config/dboxconfig.js');
var Dropbox = require("dropbox");
var crypto = require("crypto");
var humanize = require("humanize");
var numeral = require("numeral");
var sliced = require("sliced");
var moment = require("moment");
var DBXServer = new Dropbox.AuthDriver.NodeServer(8191);
var client = new Dropbox.Client({key: dboxconfig.Appkey,secret: dboxconfig.Appsecret});
var LIMIT = 5;
var TotalFiles = 0;
var FileTypes = [];
var FileSize = [];
var output = {};
var StartTime ="";

//Debug
var DEBUG = dboxconfig.debug;

//Generate cookie secret hash
//http://stackoverflow.com/questions/9407892/how-to-generate-random-sha1-hash-to-use-as-id-in-node-js 
var current_date = (new Date()).valueOf().toString();
var random = Math.random().toString();
var CookieSecretHash = crypto.createHash('sha1').update(current_date + random).digest('hex');

//Setup Express3
var express = require('express');
var app = express();
var engine = require('ejs-locals');
app.engine('ejs', engine);
app.configure(function() {
	  app.set('port', dboxconfig.port);
	  app.set('views', __dirname + '/views');
	  app.set('view engine', 'ejs');
	  app.use(express.favicon());
	  app.use(express.logger('dev'));
	  app.use(express.bodyParser());
	  app.use(express.methodOverride());
	  app.use(express.cookieParser(CookieSecretHash));
	  app.use(express.session());
	  app.use(app.router);
	  app.use(express.static(__dirname + '/public'));
});
app.configure('development', function(){
	  app.use(express.errorHandler());
});
app.get('/', function(req, res) {
      res.render('index.ejs', {});
});
app.get('/all', function(req,res){
	if (DEBUG) { console.log("Checking if user has already authenticated?"); }
	if (client.isAuthenticated()) {
			if (DEBUG) { console.log("user already authenticated ..... skip oauth"); }
			NextSteps(res,client);
    }
	else {
		if (DEBUG) { console.log("Start authentication"); }
		client.authDriver(DBXServer);
		client.authenticate(function(error, client) {
		  if (error) {
			  if (DEBUG) { console.log("Error: Authenticate with dropbox"); }
			 console.log(error);
			 return;
		   }
		  else {
			  if (DEBUG) { console.log("Authentication success"); }
			  NextSteps(res,client);
		  }
	    });
	}
}); 
//TODO: Handle 404
//TODO: Logout


//Start server
var server = require('http').createServer(app);
server.listen(dboxconfig.port);
if (DEBUG) { console.log("Express3 running on %d in %s mode",dboxconfig.port,dboxconfig.environment); }

/////////////////////////////////////////////
// FUNCTIONS
/////////////////////////////////////////////
var  TN = function (when,format){
    if ((when == "now") && (format == "valueof")){
        return (moment().valueOf());
    }
    else if ((when == "now") && (format == "unix")){
    	return (moment().unix());
    }
    else {
    	console.log("Error");
    }
};


function NextSteps (res,client) {
	var entries = [];
    //Get user info
	client.getAccountInfo(function(error, accountInfo) {
     if (error) {
		    return showError(error);  // Something went wrong.
     }
     output.name = accountInfo.name;
     if (DEBUG) {console.log("Name: ", output.name);}
     });
	//Find all files
	if (DEBUG) {StartTime = TN("now","unix"); console.log("Time Now:",StartTime);}
	GetAllFiles(null,client,function(){DisplayInfo(res)});
};


function GetAllFiles(metadata,client,callback){
    var i=0;
    var ii=0;
    client.pullChanges(metadata,function(error,metadata){
        if (error)
        {
        	if (DEBUG) { console.log ("Error: pullChanges"); }      
            return showError(error);  // Something went wrong.
        }
        
        
        //What was returned back?
        //if (DEBUG){
        	//metadata.changes.forEach(function(entry) {
            	//console.log("#### ");
        		//for (var key in entry.stat) {
        			//console.log(key,": ", entry.stat[key]);
        		//};	
        	//});
        //}
        
        //TODO: Handle files getting deleted while processing
        metadata.changes.forEach(function(file) {
        if ((file.stat.isFolder) || (/(^|.\/)\.+[^\/\.]/g).test(file.stat.path)) {
        		//Ignore hidden files and directories
        		//console.log("IGNORE >>>",file.stat.path);
        		i++;
        }
       else {
    	        // Handle mimeType
    	        if (!(FileTypes.hasOwnProperty(file.stat.mimeType))) {
    	        	FileTypes[file.stat.mimeType] = 1; //default
                }
                else {
                	FileTypes[file.stat.mimeType]++;
                }
    	        //Handle file size
    	        FileSize[file.stat.path] = file.stat.size;
    	        //Total processed
    	   		ii++;
        }
       });
       if (DEBUG) { console.log("#Total Files:", metadata.changes.length, " #Ignore:",i, " #Add:",ii); } 
       TotalFiles += ii; 
       if (DEBUG) { console.log("More files?", metadata.shouldPullAgain); }
       if((metadata.shouldPullAgain) &&(!metadata.shouldBackOff)) {
    	   if (DEBUG) { console.log("recursive: calling pullChanges ..."); } 
    	   GetAllFiles(metadata,client,callback);
    	}
       else { 
    	   if (DEBUG) { console.log("gathered all files ..."); } 
    	   callback();
       } 
	 });  //end pullChanges    
};


function DisplayInfo(res){
	if (DEBUG) {EndTime = TN("now","unix"); console.log("Time Now:",EndTime); console.log("Processing Time:", EndTime-StartTime, "(seconds)");}
	if (DEBUG) { console.log("### Total Files:", TotalFiles); }
	//Sort file types
	var SortedFileTypes = SortedKeys(FileTypes,"numbers");
	//Sort files by size
	var SortedFileSize = SortedKeys(FileSize,"filesize");
	//Send values to rendering engine
	res.render('all.ejs', {FileTypes: JSON.stringify(SortedFileTypes),FileSize: JSON.stringify(SortedFileSize),output:output});
}

//http://stackoverflow.com/questions/5199901/how-to-sort-an-associative-array-by-its-values-in-javascript
function SortedKeys(ArraytoSort,special) {
	var tuples = [];
	
	for (var key in ArraytoSort) { tuples.push([key, ArraytoSort[key]]); }
	tuples.sort(function(a, b) {
	    a = a[1];
	    b = b[1];
	    return a > b ? -1 : (a < b ? 1 : 0);
	});
	// Update values
	for (var i = 0; i < tuples.length; i++) {
	    if (special == 'filesize') {
	          tuples[i][1] = humanize.filesize(tuples[i][1]); }
	    if (special == 'numbers') {
	          tuples[i][1] = numeral(tuples[i][1]).format('0,0');}
	}
	
	//for (var i = 0; i < tuples.length; i++) {
		//var key = tuples[i][0];
	    //var value = tuples[i][1];
	    //console.log(key, "===>", value); 
	//}
	
	return (sliced(tuples,0,LIMIT));
}


//https://github.com/dropbox/dropbox-js/blob/stable/guides/getting_started.md
var showError = function(error) {
	  switch (error.status) {
	  case Dropbox.ApiError.INVALID_TOKEN:
	    // If you're using dropbox.js, the only cause behind this error is that
	    // the user token expired.
	    // Get the user through the authentication flow again.
		console.log("ERROR: Invalid Token");  
	    break;

	  case Dropbox.ApiError.NOT_FOUND:
	    // The file or folder you tried to access is not in the user's Dropbox.
	    // Handling this error is specific to your application.
		console.log("ERROR: Api Error");
	    break;

	  case Dropbox.ApiError.OVER_QUOTA:
	    // The user is over their Dropbox quota.
	    // Tell them their Dropbox is full. Refreshing the page won't help.
		console.log("ERROR: Over Quota");
		break;

	  case Dropbox.ApiError.RATE_LIMITED:
	    // Too many API requests. Tell the user to try again later.
	    // Long-term, optimize your code to use fewer API calls.
		console.log("ERROR: Rate Limited");
	    break;

	  case Dropbox.ApiError.NETWORK_ERROR:
	    // An error occurred at the XMLHttpRequest layer.
	    // Most likely, the user's network connection is down.
	    // API calls will not succeed until the user gets back online.
		console.log("ERROR: Network Error");
	    break;

	  case Dropbox.ApiError.INVALID_PARAM:
		   console.log("ERROR: Invalid Param");
		   break;
		   
	  case Dropbox.ApiError.OAUTH_ERROR:
		   console.log("ERROR: Oauth error");
		   break;
		   
	  case Dropbox.ApiError.INVALID_METHOD:
		  console.log("ERROR: Invalid method");
		  break;
		  
	  default:
	    // Caused by a bug in dropbox.js, in your application, or in Dropbox.
	    // Tell the user an error occurred, ask them to refresh the page.
		console.log("ERROR: something unanticipated!")  
	  }
	};
