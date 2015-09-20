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
var status = '';
var lat = 0.0;
var lon = 0.0;

var id = null;
var token = Pebble.getAccountToken();

// Create a Card with title and subtitle
var card = new UI.Card({
  title:'Nobody',
  subtitle:'nearby...'
});

// Create a card for the second view
var secondCard = new UI.Card({
  title:'Status',
  subtitle:''
});

// Create bools for which card to display
var cardShow = true;
var secondCardShow = !cardShow;

card.banner("images/happy_s.png");

// Display the Card
if (cardShow) {
  card.show();
  secondCard.hide();
} else {
  secondCard.show();
  card.hide();
}
        

var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 0, 
  timeout: 5000
};

function locationSuccess(pos) {
  console.log('Location changed!');
  console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
  
  ref.child('users/' + token + '/lat/').set(pos.coords.latitude);
  ref.child('users/' + token + '/lon/').set(pos.coords.longitude);
  lat = pos.coords.latitude;
  lon = pos.coords.longitude;
  
  ref.child('users').once("value", function(snapshot) {
    var matched = false;
    snapshot.forEach(function(data) {
      
      if (data.key() != token) {
        matched = true;
        var otherName = data.child('name').val();
        var otherStatus = data.child('status').val();
        var otherLat = data.child('lat').val();
        var otherLon = data.child('lon').val();
        
        var latdiff = 0.0;
        var londiff = 0.0;
        if (otherLat > lat) {
          latdiff = otherLat - lat;
        } else {
          latdiff = lat - otherLat;
        }
        
        if (otherLon > lon) {
          londiff = otherLon - lon;
        } else {
          londiff = lon - otherLon;
        }
        
          console.log('londiff: ' + londiff);
          console.log('latdiff: ' + latdiff);
        
        if ((latdiff + londiff < 0.0001) && (otherName != null)) {
          // We are close enough to announce the other person
          if (cardShow) {
            card.title('You found ' + otherName);
            card.subtitle('');
            card.banner('images/super_happy.png');
            card.on('click', 'select', function(e) {
              if (otherStatus != null) {
                secondCard.title(otherStatus);
                secondCard.subtitle('');
                secondCard.banner('images/happy_s.png');
                secondCardShow = true;
                cardShow = !secondCardShow;
                secondCard.show();
                card.hide();
              }
            });
          } else {
            secondCard.title(otherStatus);
            secondCard.banner('images/happy_s.png');
            secondCard.on('click', 'back', function(e) {
              if (otherName != null) {
                card.title('You found ' + otherName);
                card.banner('images/super_happy.png');
                cardShow = true;
                secondCardShow = !cardShow;
                card.show();
                secondCard.hide();
              }
            });
          }
        }
      }
    });
    if (!matched) {
      card.title('Nobody');
      card.subtitle('nearby...');
      card.banner('images/happy_s.png');
      card.show();
      cardShow = true;
      secondCard.hide();
      secondCardShow = !cardShow;
      }
    console.log('matched is: ' + matched)
  });
}

function locationError(err) {
  console.log('location error (' + err.code + '): ' + err.message);
}

  // Pull up the most recent time pushed into our Firebase ref.
  var usersRef = ref.child('users');
  usersRef.child(token).once('value', function(snapshot) {
    if (snapshot.val() != null) {
      profileName = snapshot.child('name').val();
      lat = snapshot.child('lat').val();
      lon = snapshot.child('lon').val();
      console.log('firebase returned my name: ' + profileName);
    }
  });

id = navigator.geolocation.watchPosition(locationSuccess, locationError, locationOptions);

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
    status = options["status"];
    ref.child('users/' + token + '/name/').set(profileName);
        ref.child('users/' + token + '/status/').set(profileName);
  } else {
    console.log("Cancelled");
  }
});