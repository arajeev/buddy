/**
 * Welcome to Pebblebase!
 *
 * This is where you write your Firebase powered Pebble app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
require('./firebase');
Firebase.INTERNAL.forceWebSockets();
/*
  MAKE SURE TO REPLACE YOUR_FIREBASE WITH A LINK TO YOUR FIREBASE, OTHERWISE THIS WONT WORK
*/
var ref = new Firebase("https://brilliant-inferno-5787.firebaseio.com/");

var initialized = false;
var options = {};
var profileName = '';

Pebble.addEventListener("ready", function() {
  console.log("ready called!");
  initialized = true;
});


Pebble.addEventListener('showConfiguration', function(e) {
  // Show config page
  Pebble.openURL('https://shining-inferno-5807.firebaseapp.com/');
  console.log('opened URL');
});

Pebble.addEventListener("webviewclosed", function(e) {
  console.log("configuration closed");
  // webview closed
  //Using primitive JSON validity and non-empty check
  if (e.response.charAt(0) == "{" && e.response.slice(-1) == "}" && e.response.length > 5) {
    options = JSON.parse(decodeURIComponent(e.response));
    console.log("Options = " + JSON.stringify(options));
    profileName = options["name"];
  } else {
    console.log("Cancelled");
  }
});

function showMenu() {
  // We create a simple menu with a few options
  var menu = new UI.Menu({
    sections: [{
      items: [
        {
        title: 'View Data',
        subtitle: '(in Firebase)'
      },
      {
        title: 'Set a value',
        subtitle: '(in Firebase)'
      },
      
      {
        title: 'Push a value',
        subtitle: '(in Firebase)'
      },
      {
        title: 'Push a token',
        subtitle: '(in Firebase)'
      },
      {
        title: 'Delete data',
        subtitle: '(in Firebase)'
      }]
    }]
  });

  // When the user selects an option...
  menu.on('select', function(e) {
    // We use the title to perform operations
    switch (e.item.title) {
      case "View Data":
        // Show the data view window
        showData();
        break;
      case "Set a value":
        // Set a location in Firebase
        ref.child('set/value').set(true);
        break;
      case "Push a value":
        // Push the current time into a firebase "array"
        ref.child("push").push((new Date().toString()));
        break;
      case "Push a token":
        // Push the user's token
        var token = Pebble.getAccountToken();
        ref.child('users/' + token + '/name/').set(profileName);
        ref.child('users/second/name').set("token2");
        break;
      case "Delete data":
        // ... or remove all the data at the location
        ref.remove();
        break;
    }
  });

  // Finally make sure the menu is set to show.
  menu.show();
}

function showData() {
  // Create a new Pebble window
  var wind = new UI.Window();

  // Then create a textfield which will be updated by Firebase.
  var textfield = new UI.Text({
    position: new Vector2(0, 50),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: "Loading...",
    textAlign: 'center'
  });

  // Add the textfield to our window object
  wind.add(textfield);

  // Create a new Firebase ref which points to the last child of /push
  var recentPushRef = ref
      .child('push')
      .limitToLast(1);

  // Pull up the most recent time pushed into our Firebase ref.
  recentPushRef.on('child_added', function (datetime) {
    var text = datetime.val();
    textfield.text(text);
    wind.show();
  });

  /*
    We use a once event to determine if location exists
    i.e. has any data been written
  */
  recentPushRef.once('value', function (snapshot) {
    if (!snapshot.exists())
      textfield.text("No data, yet!");

    wind.show();
  });

  /*
  Make sure we're only getting updates from
  Firebase when the card is displayed, so we .off when the window hides
  */
  wind.on('hide', function () {
    ref.child('push').off('child_added');
  });
} 

// Make sure we show our main menu
showMenu();