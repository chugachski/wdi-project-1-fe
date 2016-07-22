console.log('main.js loaded');

var nav = navigator.geolocation; // get back nav object
var coords = {};
var evArr = [];
var map;
var search = document.querySelector('#search-button');
var artist = document.querySelector('#artist-box');
var beURL = 'http://localhost:3000';
var addCal;
var infoWinArr = [];


// ev listener on search button that inits api call to bandplanner api
search.addEventListener('click', function(e) {
  e.preventDefault();

  // need to clear out markers
  // need to clear out evArr
  evArr = [];

  var artistReq = artist.value.toLowerCase();
  console.log('Search button clicked, INPUT:', artistReq);

  var data = {
    artist: artistReq
  }

  $.ajax({
    url: beURL + '/planner/search',
    data: data,
    method: 'POST',
    dataType: 'json'
  }).done(function(response) {
    console.log('BANDS events resp:', response);
    makeEventO(response);
    callCreate(evArr);
    spotifyId(data);
  }); // end ajax
});

// get back an artist id
function spotifyId(data) {
  $.ajax({
    url: beURL + '/artist/id',
    data: data,
    method: 'POST',
    dataType: 'json'
  }).done(function(response) {
    console.log('SPOTIFY id resp:', response);
    var id = response.artists.items[0].id
    spotifyReq(id);
  }); // end ajax
}

// get back artist top tracks
// https://api.spotify.com/v1/artists/{id}/top-tracks
function spotifyReq(artistId) {
  var data = {
    id: artistId
  }

  $.ajax({
    url: beURL + '/artist/name',
    method: 'POST',
    data: data,
    dataType: 'json'
  }).done(function(response) {
    console.log('SPOTIFY top tracks resp:', response);
  })
}

// make an object containing only relevant data and push to evArr
function makeEventO(resp) {
  var evObj = {};
  for (var i=0; i<resp.length; i++) {

    for (var prop in resp[i]) {

      if (prop === 'venue') {
        evObj['name'] = resp[i].venue.name;
        evObj['city'] = resp[i].venue.city;
        evObj['region'] =resp[i].venue.region;
        evObj['latitude'] = parseFloat(resp[i].venue.latitude);
        evObj['longitude'] = parseFloat(resp[i].venue.longitude);
      }
      if (prop === 'artists') { // might have to rework if multiple artists
        evObj['artists'] = resp[i][prop][0].name;
      }
      if (prop === 'formatted_datetime') {
        evObj['formatted_datetime'] = resp[i][prop];
      }
      if (prop === 'ticket_status') {
        evObj['ticket_status'] = resp[i][prop];
      }
      if (prop === 'ticket_url') {
        evObj['ticket_url'] = resp[i][prop];
      }
    }
    evArr.push(evObj);
    evObj = {}; // clear out the old contents
  }
  console.log('eventArr:', evArr);
  return evArr;
}

// use geolocation to locate position of user
nav.getCurrentPosition(function(position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;

  coords['lat'] = lat;
  coords['lon'] = lon;

  console.log('USER LAT: ' + coords.lat + ' DEG');
  console.log('USER LON: ' + coords.lon + ' DEG');

  initMap(coords.lat, coords.lon);
});

// init the google map with marker for user
function initMap(lat, lon) {

  var pos = {lat: parseFloat(lat), lng: parseFloat(lon)};
  var contentStr = '<div id="home">' +
    '<p><b>Your Current Location</b></p>' +
    '<p>' + (parseFloat(lat)).toFixed(2) + ' &deg N</p>' +
    '<p>' + (parseFloat(lon)).toFixed(2) + ' &deg W</p>';

  map = new google.maps.Map(document.querySelector('#map'), {
    center: {lat: 39.8, lng: -98.6},
    scrollwheel: false,
    zoom: 4
  });
  console.log()

  var image = '/images/azure_marker.png';
  var marker = new google.maps.Marker({
    position: pos,
    map: map,
    icon: image
  });

  marker.addListener('click', function() {
    var infoWin = new google.maps.InfoWindow ({
      content: contentStr,
      position: pos
    })

    closeWin();
    infoWin.open(map, this);
    infoWinArr.push(infoWin);
  })
}

function callCreate(evArr) {
    for (var i=0; i<5; i++) {
      createMarker(evArr[i]);
    }
}

function closeWin() {
  for (var i=0; i<infoWinArr.length; i++) {
    infoWinArr[i].close();
  }
}

function clearMarkers() {

}

function createMarker(event) {
  var pos = {lat: event.latitude, lng: event.longitude};
  var contentStr = '<div id="content">' +
    '<p><b>' + event.artists + ' @ ' + event.city + ', ' + event.region + '</b></p>' +
    '<p>' + event.formatted_datetime + '</p>' +
    '<p>' + event.name + '</p>' +
    '<button id="add-cal">Add to Calendar</button>' +
    '</div>'

  var marker = new google.maps.Marker({
    position: pos,
    map: map
  })

  var infoWin = new google.maps.InfoWindow ({
    content: contentStr,
    position: pos
  })

  marker.addListener('click', function() {
    // console.log('infoWindow', infoWindow);
    closeWin();
    infoWin.open(map, this);
    infoWinArr.push(infoWin);

    // add to cal
    addCal = document.querySelector('#add-cal');
    addCal.addEventListener('click', function() {
        $.ajax({
          url: beURL + '/events/new',
          data: event,
          method: 'POST',
          dataType: 'json'
        }).done(function(response) {
          console.log(response);
        }) // end ajax
    })
  })
}



