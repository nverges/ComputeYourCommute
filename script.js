$(document).ready(function() {

	// Access Google Distance Matrix service
	const distanceService = new google.maps.DistanceMatrixService();
	// Access Geocoding service
	const geocoder = new google.maps.Geocoder();

	// creates variables for calls to services
	const directionsService = new google.maps.DirectionsService();
	const directionsDisplay = new google.maps.DirectionsRenderer();

	let hybridMileage;
	let sedanMileage;
	let truckMileage;

	let homeAdress;
	let workAddress;

	let travelDistance;
	let travelTime;

	$("#gasPriceDisplay").html("$$$$");

	// hard coded destinations
	const centerPoint = new google.maps.LatLng(33.4484, -112.0740);

	const mapOptions = {
	  zoom: 12,
	  center: centerPoint
	};

	// creates map and pushes directions to map
	const map = new google.maps.Map(document.getElementById('mapDisplay'), mapOptions);
	directionsDisplay.setMap(map);


	// click events on buttons 
	$("#hybrid").on("click", function() {
	  hybridMileage = 45;
	  console.log(hybridMileage);
	});

	$("#sedan").on("click", function () {
	  sedanMileage = 25;
	  console.log(sedanMileage);
	});

	$("#truck").on("click", function() {
	  truckMileage = 15;
	  console.log(truckMileage);
	});

	//****************************
	//	COMPUTE BUTTON CLICK 
	//****************************

	$("#compute").on("click", function(event) {
		event.preventDefault();

		// $("#gasPriceDisplay")
		// $("gallonsConsumedDisplay")
		// $("distanceTraveledDisplay")
		// pull locations from text input in DOM
		homeAdress = $("#homeAddress").val().trim();
		workAddress = $("#workAddress").val().trim();		// $("moneySpentDisplay")


		console.log('start: ', homeAdress);
		console.log('destination: ', workAddress);

		// Get directions from home to work and display
		calculateRoute();

		// Distance Matrix request object
		let matrixRequest = {
			origins: ['talking stick arena, phoenix, az'],//[homeAdress],
			destinations:['125 e commonwealth, chandler, az'], //[]workAddress],
			travelMode: 'DRIVING',
			unitSystem: google.maps.UnitSystem.IMPERIAL
		}

		distanceService.getDistanceMatrix(matrixRequest, matrixCallBack);
	});

	// Distance Matrix callback function
	function matrixCallBack(result, status) {
		if (status == 'OK') {
			console.log(result);
			travelDistance = result.rows[0].elements[0].distance.text;
			travelTime = result.rows[0].elements[0].duration.text;
			console.log('distance: ' + travelDistance);
			console.log('time: ' + travelTime);

			cardDisplay();

		} else {
			alert('Matrix request unsuccessful: ' + status);
		}
	}

	// Call back function for home adrress geocode request
	function homeGeoCallBack(result, status) {
		if (status == 'OK') {
			homeAddress = result[0].geometry.location;
			console.log('homeAddress: ' + homeAddress);
			console.log(homeAdress);

			// Get geocode for work address
			geocoder.geocode({address: workAddress}, workGeoCallBack);
		} else {
			alert('Home geocode was not successful for the following reason: ' + status);
		}
	}

	function workGeoCallBack(result, status) {
		if (status == 'OK') {
			console.log('workAddress: ' + workAddress);
			workAddress = result[0].geometry.location;
			console.log('workAddress: ' + workAddress);

			// calculateRoute();
		} else {
			alert(' Work geocode was not successful for the following reason: ' + status);
		}
	}

	// performs directions request 
	function calculateRoute() {

	  let request = {
	    origin: "talking stick arena, phoenix, az",
	    destination: "125 e commonwealth ave, chandler, az",
	    travelMode: 'DRIVING'
	  };

	  directionsService.route(request, function(result, status) {

	    console.log(result, status);

	  directionsDisplay.setDirections(result);

	  });
	}

	function cardDisplay() {
		for (let i = 0; i < 4; i++) {
			let cardDiv = $('<div class="card hoverable center-align col s3">');
			let time = ["Daily", "Weekly", "Monthly", "Yearly"];
			let timeDiv = $('<div class="card-content">');
			let p = $('<p>').text(time[i]);
			// Append p onto ratingDiv
			timeDiv.append(p);

			// Create div's for image and set attributes
			let imageDiv = $('<div class="card-image">');
			let image = $('<img>');

			let infoDiv = $('<div class="commuteInfo">');
			infoDiv.attr("id", "infoCard-" + (i+1));
			infoDiv.append(`<p>Travel time: ${travelTime}`);


			// Append timeDiv onto 'cardDiv'
			cardDiv.append(timeDiv);
			// Append infoDiv onto 'cardDiv'
			cardDiv.append(infoDiv);

			// ...then append 'cardDiv' onto div with id of 'results'
			$('#results').append(cardDiv);
		};
	}
});


