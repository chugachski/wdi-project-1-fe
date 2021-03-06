console.log('main.js loaded');

var nav = navigator.geolocation; // get back nav object
var coords = {};
var evArr = [];
var map;
var addCal;
var infoWinArr = [];
var trackArr = [];
var isPlaying = false;
var msg = '';

var mapContainer = document.querySelector('#map');
var search = document.querySelector('#search-button');
var artist = document.querySelector('#artist-box');
var songsDiv = document.querySelector('#songs');
var songHead = document.querySelector('#song-header');
var songCont = document.querySelector('#song-container');
var form = document.querySelector('.form-group');
var viewB = document.querySelector('#view-cal');
var modal = document.querySelector('#modal');
var closeBtn = document.querySelector('#hide');
var innerContent = document.querySelector('.modal-body');
var doubleListen = false;

// var beURL = 'http://localhost:3000';
var beURL = 'https://peaceful-dawn-99409.herokuapp.com';

viewB.addEventListener('click', function(ev) {
  ev.preventDefault();

  $.ajax({
    url: beURL + '/events',
    dataType: 'json'
  }).done(function(response) {
    console.log(response);
    renderModal(response);
  })
})

// fill in modal body with details
function renderModal(dbResults) {
  innerContent.innerHTML = '';
  for (i=0; i<dbResults.length; i++) {
    var myEvent = document.createElement('div');
    var p1 = document.createElement('p');
    var p2 = document.createElement('p');
    var p3 = document.createElement('p');
    var remove = document.createElement('button');
    var p1Text = document.createTextNode(dbResults[i].artists + ' @ ' + dbResults[i].city + ', ' + dbResults[i].region);
    var p2Text = document.createTextNode(dbResults[i].formatted_datetime);
    var p3Text = document.createTextNode(dbResults[i].name);
    var remove = document.createElement('button');
    var btnText = document.createTextNode('Remove from calendar');

    remove.classList.add('btn');
    remove.classList.add('btn-secondary');
    remove.id = i;
    p1.classList.add('bold');
    myEvent.classList.add('saved-event');

    p1.appendChild(p1Text);
    p2.appendChild(p2Text);
    p3.appendChild(p3Text);
    remove.appendChild(btnText);

    myEvent.appendChild(p1);
    myEvent.appendChild(p2);
    myEvent.appendChild(p3);
    myEvent.appendChild(remove);
    // append to modal
    innerContent.appendChild(myEvent);

    initRemove(remove, dbResults[i].eventId);
  }
}

// adds ev listener to remove from cal button
// initiatates req to delete record from db
// appends success msg to modal body
function initRemove(button, ident) {
  button.addEventListener('click', function(ev) {
    console.log('remove btn clicked');
    console.log('DELETEID:', ident)
    data = {
      eventId: ident
    }

    $.ajax({
      url: beURL + '/events/' + ident,
      data: data,
      dataType: 'json',
      method: 'DELETE'
    }).done(function(response) {
      console.log(ident, 'has been removed');
      console.log(response);
      var message = document.createElement('p');
      var pText = document.createTextNode(response);
      message.classList.add('red');
      message.classList.add('bold');
      message.appendChild(pText);
      innerContent.appendChild(message);
    })
  })
}

// ev listener on search button that inits api call to bandplanner api
search.addEventListener('click', function(ev) {
  ev.preventDefault();

  // need to clear out markers on new search
  evArr = []; // clear out evArr
  msg.innerHTML = '';


  var artistReq = artist.value.toLowerCase();
  console.log('Search button clicked, INPUT:', artistReq);

  var data = {
    artist: artistReq
  }
  console.log(data)
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

// tells user if no upcoming events found
function noEvMsg(artist) {
  msg.innerHTML = '';
  msg = document.createElement('div');
  var par = document.createElement('p');
  var artistText = document.createTextNode('No upcoming events found for "' + artist + '"   :(   Try searching for Drake!');
  par.classList.add('bold');
  par.classList.add('red');
  par.appendChild(artistText);
  msg.appendChild(par);
  form.appendChild(msg);
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
    // clear out '#songCont'
    songCont.innerHTML = '';
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
  console.log('RANDARR:', randArr);

  addArtistHeader(tracks[0].artists);

  for (j=0; j<randArr.length; j++) {
    makeTrackDiv(tracks[randArr[j]]);
  }

  initSongListeners();
}

// adds headers to sidebar results from spotify req
function addArtistHeader(name) {
  // clear out #song-header div
  songHead.innerHTML = '';

  var h3 = document.createElement('h3');
  var h3Sub = document.createElement('h3');
  var headingText = document.createTextNode('Preview the ' + name + ' concert!');
  var headingTextTwo = document.createTextNode('Click an image to play:');

  h3.appendChild(headingText);
  h3Sub.appendChild(headingTextTwo);
  songHead.appendChild(h3);
  songHead.appendChild(h3Sub);
}

// adds album divs to sidebar
function makeTrackDiv(track) {


  // var playDiv = document.createElement('div');
  var h5 = document.createElement('h5');
  var contDiv = document.createElement('div');
  var songImg = document.createElement('img');
  var nameText = document.createTextNode(track.name);
  var audio = document.createElement('audio');

  contDiv.classList.add('alb-img');
  h5.appendChild(nameText);
  // playDiv.classList.add('track');
  audio.setAttribute('src', track.preview_url);
  songImg.setAttribute('src', track.image);
  songImg.classList.add('album');
  songImg.id = track.id;
  songImg.appendChild(audio);
  songCont.appendChild(h5);
  songCont.appendChild(contDiv);
  contDiv.appendChild(songImg);
  songsDiv.appendChild(songCont);
}


function initSongListeners() {
  if (doubleListen) {
    doubleListen.removeEventListener('click', arguments.callee);
  }

  // citation: uses Babajide Kale's technique
  // add ev listener to entire doc
  document.addEventListener('click', function(event) {
    // console.log('EV.target.id:', event.target.id);
    var songId = document.getElementById(event.target.id);
    console.log('songId.firstChild:', songId.firstChild);
    doubleListen = true;

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

// make an object with just the things I'm interested in
function makeTrackO(resp) {
  var trackObj = {};
  trackArr = [];
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
    scrollwheel: true,
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

// calls create marker once for each elem in arr up to 7 events
function callCreate(evArr) {
  for (var i=0; i<7; i++) {
    createMarker(evArr[i]);
  }
}

// clears markers from map on new search
function wipeMap() {
  mapContainer.innerHTML = '';
}

// close info windows upon clicking new marker
function closeWin() {
  for (var i=0; i<infoWinArr.length; i++) {
    infoWinArr[i].close();
  }
}

// create marker, infoWindow, add button for each call
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
    animation: google.maps.Animation.DROP,
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
