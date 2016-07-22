// display events to screen based on objects in evArr
function dispEv(evArr, artist) {
  var name = artist.toUpperCase();
  var results = document.querySelector('#results');
  var div = document.createElement('div');
  div.classList.add('event');
  var header = document.createElement('h3');
  var text = document.createTextNode(name);
  header.appendChild(text);
  div.appendChild(header);
  results.appendChild(div);

  for (var i=0; i<=3; i++) {
    var ul = document.createElement('ul');
    var addFav = document.createElement('button');
    var buttonText = document.createTextNode('Add to calendar');
    addFav.classList.add('favorite-button');
    addFav.appendChild(buttonText);
    div.appendChild(ul);
    div.appendChild(addFav);
    // initListener(addFav, evArr[i]);

    for (var prop in evArr[i]) {
      if (prop === 'name') {
        var li = document.createElement('li');
        var liText = document.createTextNode((evArr[i])[prop]);
        li.appendChild(liText);
        ul.appendChild(li);
      }

      if (prop === 'formatted_datetime') {
        var li = document.createElement('li');
        var liText = document.createTextNode((evArr[i])[prop]);
        li.appendChild(liText);
        ul.appendChild(li);
      }

      if (prop === 'ticket_status' && evArr[i][prop] === 'available') {
        var li = document.createElement('li');
        var anc = document.createElement('a');
        var ancText = document.createTextNode('Buy Tickets Online');
        anc.appendChild(ancText);
        anc.setAttribute('href', evArr[i]['ticket_url']);
        anc.setAttribute('target', '_blank');
        li.appendChild(anc);
        ul.appendChild(li);
      } else if (prop === 'ticket_status' && evArr[i][prop] === 'unavalable') {
        var li = document.createElement('li');
        var liText = document.createTextNode('Tickets sold out');
        li.appendChild(liText);
        ul.appendChild(li);
      }

      if (prop === 'city') {
        var li = document.createElement('li');
        var liText = document.createTextNode((evArr[i])[prop] + ', ' + evArr[i]['region']);
        li.appendChild(liText);
        ul.appendChild(li);
      }
    }
  }
}
