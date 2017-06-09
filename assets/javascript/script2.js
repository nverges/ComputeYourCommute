$(document).ready(function() {

	//parallax 
	$('.parallax').parallax();

	//*******************************************
	//		      GLOBAL VARIABLES
	//*******************************************

	// Access Google Distance Matrix service
	const distanceService = new google.maps.DistanceMatrixService();

	// Create variables for calls to services
	const directionsService = new google.maps.DirectionsService();
	const directionsDisplay = new google.maps.DirectionsRenderer();

	// Address variables
	let homeAddress;
	let workAddress;

	// Travel info variables
	let travelDistance;
	let travelTime;

	// Card Info variables
	let dailyCommuteTime;
	let weeklyCommuteTime;
	let monthlyCommuteTime;
	let yearlyCommuteTime;
	let dailyDistance;
	let weeklyDistance;
	let monthlyDistance;
	let yearlyDistance;

	// Vehicle Info variables
	let vehicleYear;
	let vehicleMake;
	let vehicleModel;

	let mpgVal = 24.8; // Average MPG as of November 2016
	const gasPriceAvg = 2.36; // National average gas price as of 6/7/16 according to http://gasprices.aaa.com/

	// Use variables to hold averages
	let gasPriceDisplay = $(`<h5 id="gasPrice">National Average Gas Price: $${gasPriceAvg}</h5>`);
	let mpgDisplay = $(`<h5 id="mpgPrice">Your Vehicle's MPG: <span id="mpgVal"> ${mpgVal}</span></h5>`)


//************************************************************************

	//*********************************************
	//			COMPUTE BUTTON CLICK 
	//*********************************************

	$("#compute").on("click", function(event) {
		event.preventDefault();

		// Initializes Map
		createMap();

		// Limits cards on page to 4 at a time
		$("#results").empty();
		// Refreshes MPG display value
		$("#mpgVal").empty();

		// pull locations from text input in DOM
		homeAddress = $("#homeAddress").val().trim();
		workAddress = $("#workAddress").val().trim();	

		// Console logs addresses
		console.log('start: ', homeAddress);
		console.log('destination: ', workAddress);

		// Display gas price and average MPG
		$('.averages').append(gasPriceDisplay);
		$('.averages').append(mpgDisplay);		

		// Get directions from home to work and display
		calculateRoute();

		// Distance Matrix request object
		let matrixRequest = {
			origins: [homeAddress],//[homeAddress],
			destinations: [workAddress], //[workAddress],
			travelMode: 'DRIVING',
			unitSystem: google.maps.UnitSystem.IMPERIAL
		}

		// Distance Matrix request call. Gives us travel time and distance
		distanceService.getDistanceMatrix(matrixRequest, matrixCallBack);

		// Calls Edmunds API for MPG info
		// getCarDetails();

	});

//************************************************************************

	//*******************************************
	//				FUNCTIONS
	//*******************************************

	// Initializes Map 
	function createMap() {
		
		// Location where map will center its focus initially
		const centerPoint = new google.maps.LatLng(33.4484, -112.0740);

		// map options object
		const mapOptions = {
			zoom: 12,
			center: centerPoint
		};

		// Pushes directions to map
		$("#mapHeader").html("<h5>Your Daily Commute");
		const map = new google.maps.Map(document.getElementById('mapDisplay'), mapOptions);
		directionsDisplay.setMap(map);

		// Add shadow depth and hover affect to map 
		$('#mapDisplay').attr('class', 'z-depth-4');
	}


	// Uses Edmunds API to retrieve vehicle MPG data based on vehicle type
	function getCarDetails() {

		// Grabs values from input fields
		vehicleYear = $("#vehicleYear").val().trim();
		vehicleMake = $("#vehicleMake").val().trim();
		vehicleModel = $("#vehicleModel").val().trim();

		// URL info
		let apiKey = "dmvg55zmrywxx685fjba3t6c";
		const queryURL = `https://api.edmunds.com/api/vehicle/v2/${vehicleMake}/${vehicleModel}/${vehicleYear}/styles?view=full&fmt=json&api_key=${apiKey}`;
		// "https://api.edmunds.com/api/vehicle/v2/" + vehicleMake + "/" + vehicleModel + "/" + vehicleYear + "/styles?state=used&category=4dr+SUV&view=full&fmt=json&api_key=t5werjahd6rpgtxsxkcz6s5x";

		// Sends AJAX request to Edmunds API to retrieve MPG data
		$.ajax({
			url: queryURL,
			method: "GET"
		}).done(function(response) {

			// variable that holds MPG value
			mpgVal = response.styles[0].MPG.highway;

			$("#mpgVal").text(mpgVal);

			// console.logs
			console.log(response);
			console.log(response.styles[0].MPG.highway);
		});
	}


	// Distance Matrix callback function
	function matrixCallBack(result, status) {
		if (status == 'OK') {
			console.log(result);
			travelDistance = parseFloat(result.rows[0].elements[0].distance.text);
			travelTime = parseInt(result.rows[0].elements[0].duration.value); // returns travel time in seconds
			console.log('distance: ' + travelDistance);
			console.log('time: ' + travelTime);

			// Calculate commute time
			dailyCommuteTime = computeTime(travelTime*2);	// 2 trips a day 
			weeklyCommuteTime = computeTime(travelTime*10);	// 10 trips a week
			monthlyCommuteTime = computeTime(travelTime*44);// 44 trips a month
			yearlyCommuteTime = computeTime(travelTime*528);// 528 trips a year

			// Calculate commute distance
			dailyDistance = travelDistance*2;
			weeklyDistance = travelDistance*10;
			monthlyDistance = (travelDistance*44).toFixed(1); // round to 1st decimal place
			yearlyDistance = (travelDistance*528).toFixed(1);

			// Display cards with commute info
			cardDisplay();

		} else {
			alert('Matrix request unsuccessful: ' + status);
		}
	}


	// Takes in number of miles and miles per gallon as arguments to 
	// calculate the total cost of a commute
	function computeCost(miles, mpg) {

		// Number of gallons of gas needed for commute
		const gallons = miles/mpg;

		// return cost of commute rounded to 2 decimal places
		return (gallons * gasPriceAvg).toFixed(2);
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
		origin: homeAddress,
		destination: workAddress,
		travelMode: 'DRIVING'
		};

		// Creates call to directionsService
		directionsService.route(request, function(result, status) {

		// Sets directions on Map
		directionsDisplay.setDirections(result);

		// Console log
		console.log(result, status);

		});
	}


	// Displays seperate cards for each time frame with corresponding commute info
	function cardDisplay() {

		// commute array holding an object for each commute time frame(daily, weekly, monthly, yearly)
		let commute = [{	
			timeFrame: 'Daily', 
			commuteTime: `Time: ${dailyCommuteTime}`, 
			commuteDistance: `Distance: ${dailyDistance} miles`, 
			cost: `Cost: $${computeCost(dailyDistance, mpgVal)}`
		}, {
			timeFrame: 'Weekly',
			commuteTime: `Time: ${weeklyCommuteTime}`,
			commuteDistance: `Distance: ${weeklyDistance} miles`,
			cost: `Cost: $${computeCost(weeklyDistance, mpgVal)}`
		}, {
			timeFrame: 'Monthly',
			commuteTime: `Time: ${monthlyCommuteTime}`,
			commuteDistance: `Distance: ${monthlyDistance} miles`,
			cost: `Cost: $${computeCost(monthlyDistance, mpgVal)}`
		}, {
			timeFrame: 'Yearly',
			commuteTime: `Time: ${yearlyCommuteTime}`,
			commuteDistance: `Distance: ${yearlyDistance} miles`,
			cost: `Cost: $${computeCost(yearlyDistance, mpgVal)}`
		}];

		// Loops through commute object to create and append cards
		for (let i = 0; i < commute.length; i++) {
			let commuteObj = commute[i];
			let cardDiv = $('<div class="card hoverable center-align col s12 m6 l3">');
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


