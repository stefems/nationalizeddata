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
