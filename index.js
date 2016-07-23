console.log('main.js loaded');

var nav = navigator.geolocation; // get back nav object
var coords = {};
var evArr = [];
var map;
var mapContainer = document.querySelector('#map');
var search = document.querySelector('#search-button');
var artist = document.querySelector('#artist-box');
var beURL = 'http://localhost:3000';
// var beURL = 'https://peaceful-dawn-99409.herokuapp.com';
var addCal;
var infoWinArr = [];
var trackArr = [];
var songsDiv = document.querySelector('#songs');
var form = document.querySelector('#form');
var isPlaying = false;

// ev listener on search button that inits api call to bandplanner api
search.addEventListener('click', function(e) {
  e.preventDefault();

  // need to clear out markers
  evArr = []; // clear out evArr

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
    if (response.length) {
      makeEventO(response);
      wipeMap();
      initMap(coords.lat, coords.lon);
      callCreate(evArr);
      spotifyId(data);
    } else {
      console.log('No events found for artist:', artistReq);
      noEvMsg(artistReq);
    }
  }); // end ajax
});

function noEvMsg(artist) {
  msg = document.createElement('div');
  artistText = document.createTextNode('No upcoming events found for' + artist + '. Try searching for Drake!');
  msg.appendChild(artistText);
  form.appendChild(msg)
}

// get back an artist id
function spotifyId(data) {
  $.ajax({
    url: beURL + '/artist/id',
    data: data,
    method: 'POST',
    dataType: 'json'
  }).done(function(response) {
    // console.log('SPOTIFY id resp:', response);
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
    makeTrackO(response);
    console.log('TRACK ARR:', trackArr);
    callTrack(trackArr);

  })
}

// call makeTrackDiv with 3 random top songs
function callTrack(tracks) {
  var randArr = [];

    while (randArr.length < 3) {
      var idx = Math.floor(Math.random() * tracks.length);
      if (!randArr.includes(idx)) { // only add if num is unique
        randArr.push(idx);
      }
    }

  // console.log('RANDARR:', randArr);

  addArtistHeader(tracks[0].artists);

  for (j=0; j<randArr.length; j++) {
    makeTrackDiv(tracks[randArr[j]]);
  }
  initSongListeners();
}

function addArtistHeader(name) {
  var h3 = document.createElement('h3');
  var h5 = document.createElement('h5');
  var h3Sub = document.createElement('h3');
  var headingText = document.createTextNode('Preview the ' + name + ' concert!');
  var headingTextTwo = document.createTextNode('Click an image to play:');
  var artistText = document.createTextNode(name);

  h3.appendChild(headingText);
  h3Sub.appendChild(headingTextTwo);
  h5.appendChild(artistText);
  songsDiv.appendChild(h3);
  songsDiv.appendChild(h3Sub);
}

function makeTrackDiv(track) {
  var playDiv = document.createElement('div');
  var h5 = document.createElement('h5');
  var songImg = document.createElement('img');
  var nameText = document.createTextNode(track.name);
  var audio = document.createElement('audio');

  h5.appendChild(nameText);
  playDiv.classList.add('track');
  audio.setAttribute('src', track.preview_url);
  songImg.setAttribute('src', track.image);
  songImg.id = track.id;
  songImg.appendChild(audio);
  playDiv.appendChild(h5);
  playDiv.appendChild(songImg);
  songsDiv.appendChild(playDiv);
}

// citation: uses Babajide Kale's technique
function initSongListeners() {
  // add ev listener to entire doc
  document.addEventListener('click', function(event) {
    // console.log('EV OBJ:', event);
    var songId = document.getElementById(event.target.id)
    // console.log('songId.firstChild:', songId.firstChild);
    // console.log('songId:', songId);
    if (event.target.id) {
      if (isPlaying === false) {
        songId.firstChild.play();
        isPlaying = true;
        console.log('Playing track...')
      } else if (isPlaying === true) {
        songId.firstChild.pause();
        isPlaying = false;
        console.log('Track paused.')
      }
    }
  })
}
// end citation

function makeTrackO(resp) {
  var trackObj = {};
  for (var i=0; i<resp.tracks.length; i++) {

    for (prop in resp.tracks[i]) {
      if (prop === 'artists') {
        trackObj['artists'] = resp.tracks[i].artists[0].name;
      }
      if (prop === 'name') {
        trackObj['name'] = resp.tracks[i].name;
      }
      if (prop === 'preview_url') {
        trackObj['preview_url'] = resp.tracks[i].preview_url;
      }
      if (prop === 'popularity') {
        trackObj['popularity'] = resp.tracks[i].popularity;
      }
      if (prop === 'album') {
        trackObj['image'] = resp.tracks[i].album.images[1].url;
        trackObj['id'] = resp.tracks[i].album.id;
      }
      // trackObj['id'] = Math.floor(Math.random() * 1000);
    }
  trackArr.push(trackObj);
  trackObj = {}; // clear out the old contents
  }
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
      if (prop === 'id') {
        evObj['eventId'] = resp[i][prop];
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

  var image = 'azure_marker.png';
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
  for (var i=0; i<7; i++) {
    createMarker(evArr[i]);
  }
}

function wipeMap() {
  mapContainer.innerHTML = '';
}

function closeWin() {
  for (var i=0; i<infoWinArr.length; i++) {
    infoWinArr[i].close();
  }
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

function auto() {
  $(function() {
    var autoChoices = [
      'Tedeschi Trucks Band',
      'Drake',
      'Adele',
      'Heartless Bastards',
      'Billy Idol',
      'Billy Joel',
      'Steely Dan',
      'Norah Jones',
      'Alabama Shakes',
      'Sia',
      'Flogging Molly',
      'Flight of the Conchords',
      'Goo Goo Dolls',
      'Bonnie Rait',
      'Wilco',
      'Kenny G',
      'Alice in Chains',
      'M83',
      'Modest Mouse',
      'The Lumineers',
      'Wierd Al Yankovic'
    ];
    $('#artist-box').autocomplete({
      source: autoChoices,
      minLength: 3,
    });
  });
}
