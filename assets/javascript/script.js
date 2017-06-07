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
	const gasPriceAvg = 2.36; // National average gas price as of 6/7/16 according to http://gasprices.aaa.com/

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
			travelDistance = parseFloat(result.rows[0].elements[0].distance.text);
			travelTime = parseInt(result.rows[0].elements[0].duration.value); // returns travel time in seconds
			console.log('distance: ' + travelDistance);
			console.log('time: ' + travelTime);

			// calculate commute time
			let dailyCommuteTime = computeTime(travelTime*2);	// 2 trips a day 
			let weeklyCommuteTime = computeTime(travelTime*10);	// 10 trips a week
			let monthlyCommuteTime = computeTime(travelTime*44);// 44 trips a month
			let yearlyCommuteTime = computeTime(travelTime*528);// 528 trips a year

			// Display cards with commute info
			cardDisplay(dailyCommuteTime, weeklyCommuteTime, monthlyCommuteTime, yearlyCommuteTime);

		} else {
			alert('Matrix request unsuccessful: ' + status);
		}
	}

	// Converts seconds into days, hours and minutes
	function computeTime(seconds) {

		// A day contains 60 * 60 * 24 = 86400 seconds
		const secondsDay = 86400;
		// An hour contains 60 * 60 = 3600 seconds
		const secondsHour = 3600;
		// A minute contains 60 seconds
		const secondsMin = 60;

		let remaining = seconds;

		// Calculate the number of days
		const days = Math.floor(remaining/secondsDay);
		// Seconds remaining
		remaining = remaining % secondsDay;

		// Calculate hours
		const hours = Math.floor(remaining/secondsHour);
		remaining = remaining % secondsHour;

		// Calculate minutes
		const minutes = Math.floor(remaining/secondsMin);
		remaining = remaining % secondsMin;

		// If commute is shorter than a day...
		if (days === 0) {
			// ... and shorter than an hour
			if (hours === 0) {
				// return just minutes
				return `${minutes} mins`; 
			}
			// ... at least an hour with no minutes
			if (minutes === 0) {
				// return just hours
				return `${hours} hours`;
			}
			// return hours and minutes
			return `${hours} hours ${minutes} mins`;
		}

		// If commute is at least a day with no hours...
		if (hours === 0) {
			// ... and no minutes either
			if (minutes === 0) {
				// return just day(s)
				return `${days} days`;
			}
			// return day(s) and minutes
			return `${days} days ${minutes} mins`;
		}

		// If commute is at least a day and an hour but no minutes
		if (minutes === 0) {
			// return day(s) and hour(s)
			return `${days} days ${hours} hours`;
		}

		// If commute time day(s), hour(s), and minutes
		return `${days} days ${hours} hours ${minutes} mins`;
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

	// Takes commute time arguments for each time frame and displays seperate 
	// cards for each time frame with corresponding commute info
	function cardDisplay(dailyTime, weeklyTime, monthlyTime, yearlyTime) {

		// commute array holding an object for each commute time frame(daily, weekly, monthly, yearly)
		let commute = [{	
			timeFrame: 'Daily', 
			commuteTime: `Time: ${dailyTime}`, 
			commuteDistance: `Distance: ${travelDistance*2} miles`, 
			cost: 'Cost: $$$$'
		}, {
			timeFrame: 'Weekly',
			commuteTime: `Time: ${weeklyTime}`,
			commuteDistance: `Distance: ${travelDistance*10} miles`,
			cost: 'Cost: $$$$'
		}, {
			timeFrame: 'Monthly',
			commuteTime: `Time: ${monthlyTime}`,
			commuteDistance: `Distance: ${travelDistance*44} miles`,
			cost: 'Cost: $$$$'
		}, {
			timeFrame: 'Yearly',
			commuteTime: `Time: ${yearlyTime}`,
			commuteDistance: `Distance: ${travelDistance*532} miles`,
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
			infoDiv.append(`<p>${commuteObj.commuteTime}`);
			infoDiv.append(`<p>${commuteObj.commuteDistance}`);
			infoDiv.append(`<p>${commuteObj.cost}`);

	
			// Append commuteDiv onto 'cardDiv'
			cardDiv.append(commuteDiv);
			// Append infoDiv onto 'cardDiv'
			cardDiv.append(infoDiv);

			// ...then append 'cardDiv' onto div with id of 'results'
			$('#results').append(cardDiv);
		};
	}
});


