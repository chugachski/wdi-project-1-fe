# Full-Stack API project

## Links
 * https://chugachski.github.io/wdi-project-2-fe
 * https://peaceful-dawn-99409.herokuapp.com
 * https://github.com/chugachski/wdi-project-2-fe
 * https://github.com/chugachski/wdi-project-2-be

## Technologies:
 * HTML
 * CSS
 * JavaScript
 * Node
 * MongoDB
 * Bootstrap

## External APIs
* Geolocation API
* Google Maps API
* Bands in Town API
* Spotify API

## How it works:
When the user navigates to the index a Google map appears with a marker indicating their current location. Searching for a band or artist will pull up to 7 upcoming events for the band/artist and place markers representing the event coordinates on the map. Clicking a marker opens an info window with the pertinent event details and the option to save the event to the database. The event will only save if the event is unique.

Entering a search term also populate the sidebar with three random top tracks by the artist. Clicking an album image will play a clip of the track and clicking again pauses the playback.

The user may click the 'View My Calendar' button to view all saved events in a modal. Events can be removed from the database by pushing the button under an event.

## Comments
I would eventually like to play full songs but need to learn OAuth. I would also like to make the event disappear automatically from the modal when the remove button is clicked (currently, a message appears indicating successful removal). Last, there are some entries in the heroku database that I can't delete (in 'development mode' everything is deletable) that were there the first time I deployed. So, I want to find out how to wipe the heroku db.
