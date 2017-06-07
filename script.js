$(document).ready(function() {

	// Access Google Distance Matrix service
	const distanceService = new google.maps.DistanceMatrixService();

	// create variables for calls to services
	const directionsService = new google.maps.DirectionsService();
	const directionsDisplay = new google.maps.DirectionsRenderer();

	let hybridMileage;
	let sedanMileage;
	let truckMileage;

	let homeAdress;
	let workAddress;

	let travelDistance;
	let travelTime;

	const mpgAverage = 24.8; // Average MPG as of November 2016
	const gasPriceAvg = 2.364; // National average gas price as of 6/7/16 according to http://gasprices.aaa.com/

	// Display current average gas price
	$("#gasPriceDisplay").html(`$${gasPriceAvg}`);

	//******************************************
	//				MAP CREATION
	//******************************************

	// Location where map will center its focus initially
	const centerPoint = new google.maps.LatLng(33.4484, -112.0740);
	// map options object
	const mapOptions = {
	  zoom: 12,
	  center: centerPoint
	};

	// creates map and pushes directions to map
	const map = new google.maps.Map(document.getElementById('mapDisplay'), mapOptions);
	directionsDisplay.setMap(map);

	//*************************************************************

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

	//*********************************************
	//			COMPUTE BUTTON CLICK 
	//*********************************************

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

		// Distance Matrix request call. Gives us travel time and distance
		distanceService.getDistanceMatrix(matrixRequest, matrixCallBack);
	});
	//************************************************************************


	//*******************************************
	//				FUNCTIONS
	//*******************************************

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

	// performs directions request and displays it on map
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

	// Dislays seperate cards for each time frame with corresponding commute info
	function cardDisplay() {

		// commute array holding an object for each commute time frame(daily, weekly, monthly, yearly)
		let commute = [{	
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

		for (let i = 0; i < commute.length; i++) {
			let commuteObj = commute[i];
			let cardDiv = $('<div class="card hoverable center-align col s3">');
			cardDiv.attr('id', `cardNum-${i+1}`);
			let commuteDiv = $('<div class="card-content">');
			commuteDiv.append(`<p>${commuteObj.timeFrame}`);


			let infoDiv = $('<div class="commuteInfo">');
			infoDiv.attr('id', `cardInfo-${i+1}`);
			infoDiv.append(`<p>${commuteObj.travelTime}`);
			infoDiv.append(`<p>${commuteObj.travelDistance}`);
			infoDiv.append(`<p>${commuteObj.cost}`);

			// for (let x = 1; x < 4; x++) {
			//   infoDiv.append(`<p>${commute[i][x]}`);
			// }

			// commute.forEach(function(element) {
			// 	let p = $('<p>').text(commute[i][element]);
			// 	// Append p onto ratingDiv
			// 	commuteDiv.append(p);
			// });
	
			// Append commuteDiv onto 'cardDiv'
			cardDiv.append(commuteDiv);
			// Append infoDiv onto 'cardDiv'
			cardDiv.append(infoDiv);

			// ...then append 'cardDiv' onto div with id of 'results'
			$('#results').append(cardDiv);
		};
	}
});


