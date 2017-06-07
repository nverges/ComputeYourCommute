$(document).ready(function() {

	// On page load...
	$(function() {
		populateButtons(searchArray, 'searchButton', '#buttonsArea');
	})

	// Hold button types in array
	var searchArray = ['Dog', 'Cat', 'Bird'];

	// Fucnction to create and add buttons to the page
	function populateButtons(searchArray, classToAdd, areaToAddTo) {
		
		// empty div with buttons to avoid repeats
		$(areaToAddTo).empty();

		// Loop through array and create and append button for each element
		searchArray.forEach( function(element) {
			let gifButton = $('<a class="waves-effect waves-light btn-large">');
			gifButton.addClass(classToAdd);
			gifButton.attr('data-type', element);
			gifButton.text(element);
			$(areaToAddTo).append(gifButton);
		});
	}

	// On click event for every button
	$(document).on('click', '.searchButton', function() {
		// clear div after every new button press
		$('#searches').empty();
		// Hold data-type of each button in variable
		let type = $(this).data('type');

		// Set query URL to the giphy API address with the specific type
		let queryURL = 'http://api.giphy.com/v1/gifs/search?q=' + type 
			+ '&api_key=dc6zaTOxFJmzC&limit=10';

		// Giphy API call 
		$.ajax({
			url: queryURL,
			method: 'GET'
		}).done(function(response) {
			
			// For each gif in the response 
			response.data.forEach(function(element) {
				let cardDiv = $('<div class="card hoverable">');
				let rating = element.rating;
				let ratingDiv = $('<div class="card-content">');
				let p = $('<p>').text('Rating: ' + rating);
				// Append p onto ratingDiv
				ratingDiv.append(p);

				// Hold 'still' and 'animated' url's of the gif
				let animated = element.images.fixed_height.url;
				let still = element.images.fixed_height_still.url;

				// Create div's for image and set attributes
				let imageDiv = $('<div class="card-image">');
				let image = $('<img>');
				

				// Set attributes for image
				image.attr('src', still);
				image.attr('data-still', still);
				image.attr('data-animated', animated);
				image.attr('data-state', 'still');
				image.addClass('searchGif');

				// Append image onto imageDiv
				imageDiv.append(image);
				// Append imageDiv onto 'cardDiv'
				cardDiv.append(imageDiv);
				// Append rating onto 'cardDiv'
				cardDiv.append(ratingDiv);
				// ...then append 'cardDiv' onto div with id of 'searches'
				$('#searches').append(cardDiv);
			});
		})
	})

	// On-click event for clicking on image. Allows pausing and animating gif
	$(document).on('click', '.searchGif', function() {
		let state = $(this).attr('data-state');
		console.log('state: ' + state);
		console.log (this);

		// If current state is 'still', switch to animate or vice versa
		if (state === 'still') {
			$(this).attr('src', $(this).data('animated'));
			$(this).attr('data-state', 'animated');
		} else {
			$(this).attr('src', $(this).data('still'));
			$(this).attr('data-state', 'still');
		}

		console.log($(this).data('state'));
	})

	// On-click event for submit button. Creates new button
	$('#addSearch').on('click', function() {
		// Grab input value from 1st input tag
		let newSearch = $('#search-input').val().trim();

		if (newSearch === '') {
			return false;
		}

		// If button does not already exist
		if (searchArray.indexOf(newSearch) < 0) {
			// Add newSearch into searchArray
			searchArray.push(newSearch);

			// Re-populate buttons on screen
			populateButtons(searchArray, 'searchButton', '#buttonsArea');
		}

		// Clear input fields after button press
		// $(this).closest('form').find("input[type=text], textarea").val('');
		$('#search-input').val('');
		// Prevent button from re-loading page
		return false;

		
	})
});






 