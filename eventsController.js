//Node Utils_______________________
const request = require('request');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use( bodyParser.json() );       // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
var env;
fs.stat(".env/.env.js", function(err, stat) {
	if(err == null) {
		env = require("./.env/.env.js");
	} 
	else if(err.code == 'ENOENT') {
		env = {
			facebookAppId: process.env.facebookAppId,
			facebookAppSecret: process.env.facebookAppSecret
		}
	}
});
var access_token = env.facebookAppId + "|" + env.facebookAppSecret;
//_________________________________
//Firebase Setup___________________
var firebase = require("firebase");
var config = {
  apiKey: "AIzaSyByp6ZYTYrwQ4M0g4h2C1pDtyMUI08LA0g",
  authDomain: "nationaldata-fcd92.firebaseapp.com",
  databaseURL: "https://nationaldata-fcd92.firebaseio.com",
  storageBucket: "nationaldata-fcd92.appspot.com",
};
firebase.initializeApp(config);
var database = firebase.database();
//signInWithEmailAndPassword or createUserWithEmailAndPassword
firebase.auth().signInWithEmailAndPassword("kowalmax.s@gmail.com", "testtest").catch(function(error) {
	// Handle Errors here.
	console.log(error.code);
	console.log(error.message);
});
//_________________________________

router.get('/events/:lat/:lng', (req, res) => {
	res.send('working');
	console.log("working");
	var options = {        
	    url: 'https://api.yelp.com/v3/businesses/search?term=music&latitude=39.743805699999996&longitude=-104.9628995',
	    method: 'GET',
	    headers:{
	        Authorization: ' Bearer cUyNgaY2GZCVViu4jW0Eqsm66z0M4VdD9rV-aiVuzA3KFDjJhoQlB8fZ_R2MHHPD7b7FjPZkB7nmUGNkdtiMSIXV5KK7kbSmOPzKMCVq_YdgBf6SNijCJb30jo2YWXYx'            
	   }
	};

	request(options, function(error, response, body) {
		if (error) {
			console.log(error);
		}
		else if (JSON.parse(body)){
			JSON.parse(body).businesses.forEach(function(business) {
				getBusinessWebsiteFromYelp(business.url, business.name);
			});
		}
		else {
			console.log("failed to hit the yelp api");
		}
	});
	function getBusinessWebsiteFromYelp(yelpURL, businessName) {
		var options = {
			url: yelpURL,
			headers: {
				"user-agent": "Chrome/51.0.2704.103"
			}
		};
		request(options, function (error, response, body) {
			if (!error) {
				try {
					const dom = new JSDOM(body);
					let websiteURL;
					let urlSpan = dom.window.document.getElementsByClassName("biz-website")[0];
					if (urlSpan && urlSpan.children[1] && urlSpan.children[1].innerHTML) {
						websiteURL = urlSpan.children[1].innerHTML;
						websiteURL = processUrl(websiteURL);
						getFacebookPageFromWebsite(websiteURL);
					}
					else {
						console.log("yelp didn't have a url for " + businessName);
					}
				}
				catch (e) {
					console.log('jsdom error.');
				}
			}
			else {
				console.log(error);
			}
		});
	}
	function processUrl(businessURL) {
		if (businessURL.indexOf("www.") === -1 && businessURL.indexOf("http") === -1) {
			return "http://www." + businessURL;
		}
	}
	function getFacebookPageFromWebsite(businessWebsite) {
		var options = {
			url: businessWebsite,
			headers: {
				"user-agent": "Chrome/51.0.2704.103"
			}
		};
		request(options, function (error, response, body) {
			if (!error) {
				try {
					const dom = new JSDOM(body);
					let found = false;
					var aTags = dom.window.document.getElementsByTagName("a");
					for (let i = 0; i < aTags.length; i++) {
						if (aTags[i].getAttribute("href") && aTags[i].getAttribute("href").indexOf("facebook.com") !== -1) {
							getFacebookEvents(aTags[i].getAttribute("href"));
							found = true;
							break;
						}
					}
					if (!found) {
						console.log("failed to find a facebook link for " + options.url);
					}
				}
				catch(e) {
					console.log("jsdom error.");
				}
			}
			else {
				console.log("error loading business website: " + options.url);
			}
		});
	}
	function getFacebookEvents(pageURL) {
		//get the name from the facebook.com/
		let nameIndex = pageURL.indexOf("facebook.com/") + "facebook.com/".length;
		let name = pageURL.substring(nameIndex);
		name = name.split("/")[0];
		//send request for events
		var untilValue;
		let date = new Date();
		if (date.getMonth() === 12 || date.getMonth() === 11) {
			//set the until to year++/2/15
			untilValue = (date.getFullYear + 2) + "-1-15";
		}
		else {
			untilValue = date.getFullYear() + "-" + (date.getMonth() + 2) + "-15";  
		}
		let url = "https://graph.facebook.com/" + name + "/events?fields=is_cancelled,name,place,owner,description,start_time&until=" + untilValue + "&since=now&access_token=" + access_token;
		acquireEvents(url);
	}
	function acquireEvents(url) {
		console.log("acquiring events for " + url);
		request(url, function (error, response, body) {
			if (error) {
				console.log('error loading facebook events');
				console.log(error + " " + url);
			}
			else if (!JSON.parse(body) || !JSON.parse(body).data) {
				console.log("incorrect facebook url");
			}
			else {
				let events = JSON.parse(body).data;
				console.log("found " + events.length + " events for " + url);
				// events.forEach(function(event) {
				// 	request.post({url: "/events/new", formData: event}, function (error, response, body) {
				// 		console.log(response);
				// 	});
				// });
				if (JSON.parse(body).paging && JSON.parse(body).paging.next) {
					acquireEvents(JSON.parse(body).paging.next);
				}
			}
		});
	}
});

router.post('/events/new', (req, res) => {
	console.log(req.body);
	res.send({"status":"ought to save event"});
});

module.exports = router;
