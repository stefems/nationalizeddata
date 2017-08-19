/*
====================
Node Utils
====================
*/
// var Promise = require('q').Promise;
const request = require('request');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
//====================

/*
====================
Init Firebase
====================
*/
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
//====================


 /*
 ====================
 Init Google Maps
 ====================
 */
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyAC4bVTmV7z7rkLOVmXgxlRBsuYOqaAvQU'
}); 

// googleMapsClient.placesNearby({
//       language: 'en',
//       location: [-33.865, 151.038],
//       rankby: 'distance',
//       minprice: 1,
//       maxprice: 4,
//       opennow: true,
//       type: 'restaurant'
//     }, function(error, response) {
//     	let place_id = result.place_id;
//     	request("https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyAC4bVTmV7z7rkLOVmXgxlRBsuYOqaAvQU&placeid=" + place_id, function(error, response, body) {
// 			if (error) {
// 				console.log("error");
// 				console.log(error);
// 			}
// 			else if (JSON.parse(body).result) {
// 				console.log("body");
// 				console.log(JSON.parse(body).result.website);
// 			}
// 			else {
// 				console.log("no body");
// 				// console.log(response);
// 			}
// 		});
// });

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
		console.log("html");
	}
});

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
						console.log(aTags[i].getAttribute("href"));
						found = true;
						break;
					}
				}
				if (!found) {
					console.log("failed to find a facebook link for " + options.url);
				}
			}
			catch(e) {
				console.log(e);
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

// //CREATE PAGES
// database.ref("pages").set({
// 	new: "new"
// });

// //CREATE ONE EVENT
// database.ref("events/a").set({
// 	name: "a"
// });

// //READ ONCE
// database.ref("pages").once("value").then(function(snapshot) {
// 	console.log(snapshot.val());
// });

//1. Get location from user

//2. Use Maps API to search for companies for each subject

//3. Get results' websites

//4. Scrape each site for a facebook page
