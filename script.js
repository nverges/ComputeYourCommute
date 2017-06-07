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
			travelDistance = parseInt(result.rows[0].elements[0].distance.text);
			travelTime = parseInt(result.rows[0].elements[0].duration.text); // can use duration.value for seconds
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

		let time = [{	
			timeFrame: 'Daily', 
			travelTime: `Travel time: ${travelTime*2}`, 
			travelDistance: `Travel Distance: ${travelDistance*2}`, 
			cost: 'Cost: $$$$'
		}, {
			timeFrame: 'Weekly',
			travelTime: `Travel time: ${travelTime*10}`,
			travelDistance: `Travel Distance: ${travelDistance*10}`,
			cost: 'Cost: $$$$'
		}, {
			timeFrame: 'Monthly',
			travelTime: `Travel time: ${travelTime*44}`,
			travelDistance: `Travel Distance: ${travelDistance*44}`,
			cost: 'Cost: $$$$'
		}, {
			timeFrame: 'Yearly',
			travelTime: `Travel time: ${travelTime*532}`,
			travelDistance: `Travel Distance: ${travelDistance*532}`,
			cost: 'Cost: $$$$'
		}];

		for (let i = 0; i < 4; i++) {
			let timeobj = time[i];
			let cardDiv = $('<div class="card hoverable center-align col s3">');
			let timeDiv = $('<div class="card-content">');
			timeDiv.append(`<p>${timeobj.timeFrame}`);


			let infoDiv = $('<div class="commuteInfo">');
			infoDiv.attr("id", "infoCard-" + (i+1));
			infoDiv.append(`<p>${timeobj.travelTime}`);
			infoDiv.append(`<p>${timeobj.travelDistance}`);
			infoDiv.append(`<p>${timeobj.cost}`);

			// for (let x = 1; x < 4; x++) {
			//   infoDiv.append(`<p>${time[i][x]}`);
			// }

			// time.forEach(function(element) {
			// 	let p = $('<p>').text(time[i][element]);
			// 	// Append p onto ratingDiv
			// 	timeDiv.append(p);
			// });
	
			// Append timeDiv onto 'cardDiv'
			cardDiv.append(timeDiv);
			// Append infoDiv onto 'cardDiv'
			cardDiv.append(infoDiv);

			// ...then append 'cardDiv' onto div with id of 'results'
			$('#results').append(cardDiv);
		};
	}
});


