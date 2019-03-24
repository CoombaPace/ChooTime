// ============================== //
//      INITIALIZE FIREBASE
// ============================== //

var config = {
    apiKey: "AIzaSyDYFfVmVFHNBSyZ9nQ0JneVsz8ZIU_rShA",
    authDomain: "traintime-221fc.firebaseapp.com",
    databaseURL: "https://traintime-221fc.firebaseio.com",
    projectId: "traintime-221fc",
    storageBucket: "traintime-221fc.appspot.com",
    messagingSenderId: "320378087072"
  };
  firebase.initializeApp(config);
  
  var database = firebase.database(); 
  
  function displayMsg(msg) {
	console.log("display error message");
	console.log(msg);
	$("#msg2user").text(msg);
  }

// ============================== //
//          GLOBALS
// ============================== //

var interval    = "";
var timer = 60;
var trainList   = [];

// ============================== //
//          FUNCTIONS
// ============================== //

function newTrainRow(train, i) {

    // First Time (pushed back 1 year to make sure it comes before current time)
    var firstTimeConverted = moment(train.firstTrainTime, "HH:mm").subtract(1, "years");
        
	// Current Time
	var currentTime = moment();
  
	// Difference between the times
	var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
  
	// Time apart (remainder)
	var tRemainder = diffTime % train.trainFrequency;
  
	// Minute Until Train
	var tMinutesTillTrain = train.trainFrequency - tRemainder;
  
	// Next Train
	var nextTrain = moment().add(tMinutesTillTrain, "minutes");
    
	var nextArrival = moment().diff(moment(train.firstTrainTime, "X"), "minutes");
	console.log(nextArrival);
  
	// Create the new row
	var newRow = $(`<tr id=' ${train.trainKey}'>`).append(
	  $("<td>").text(train.trainName).addClass("name"),
	  $("<td>").text(train.trainDestination).addClass("destination"),
	  $("<td>").text(train.trainFrequency).addClass('frequency'),
	  $("<td>").text(moment(nextTrain).format("HH:mm")).addClass("nextTrain"),
	  $("<td>").text(tMinutesTillTrain).addClass("minutesTil"),
	  $("<td class='delete'>").html(`<button type='button' data-id='${train.trainKey}' class='close' aria-label='Close'><span aria-hidden='true'>&times;</span></button>`)
	);
  
	// Append the new row to the table
	$("#train-table > tbody").append(newRow);
  }
  
function newSchedule() {
	$("#train-table > tbody").empty(); // empties out the html
	console.log("newSchedule");
	// render our trains to the page
	for (var i = 0; i < trainList.length; i++) {
	  console.log(trainList[i]);
	  newTrainRow(trainList[i], i);
	}
  };

function newArrival() {
	newSchedule();
	timer = 60;
	clearInterval(interval);
	interval = setInterval(updateCountdown, 1000);
  };

function updateCountdown() {
	timer--;
	if (timer <= 0) {
	  newArrival();
	}
  };

  function findObjectIndexByKey(array, key, value) {
	for (var i = 0; i < array.length; i++) {
	  if (array[i][key] === value) {
		return array[i];
	  }
	}
	return null;
  };

  function updateTrainArr() {
	console.log("update Train Arr");
  };

// ============================== //
//         MAIN PROCESSES
// ============================== //

  //  Tells Submit button, on click do this...
  $("#submitBtn").on("click", function (event) {
	event.preventDefault();
  
	// Grab new train info form from
	var trainName = $("#train-name-input").val().trim();
	var trainDestination = $("#destination-input").val().trim();
	var firstTrainTime = moment($("#first-train-time-input").val().trim(), "HH:mm").format("X");
	var trainFrequency = $("#frequency-input").val().trim();
  
	// var to hold our new train's data
	var newTrain = {
	  trainName: trainName,
	  trainDestination: trainDestination,
	  firstTrainTime: firstTrainTime,
	  trainFrequency: trainFrequency
	};
  
	// Uploads train data to the database
	database.ref().push(newTrain);
  
	// Clears all of the text-boxes
	$("#train-name-input").val("");
	$("#destination-input").val("");
	$("#first-train-time-input").val("");
	$("#frequency-input").val("");
  });
  
  
  // Firebase event for adding train to the database and a row in the html when a user adds an entry 
  database.ref().on("child_added", function (childSnapshot) {
    
	// Store everything into a variable.
	var trainName = childSnapshot.val().trainName;
	var trainDestination = childSnapshot.val().trainDestination;
	var firstTrainTime = childSnapshot.val().firstTrainTime;
	var trainFrequency = childSnapshot.val().trainFrequency;
	var trainKey = childSnapshot.key;
  
	var newTrain = {
	  trainName: trainName,
	  trainDestination: trainDestination,
	  firstTrainTime: firstTrainTime,
	  trainFrequency: trainFrequency,
	  trainKey: trainKey
	};
  
	
	trainList.push(newTrain);
  
	newTrainRow(newTrain, trainList.length);
  
	clearInterval(interval);
	interval = setInterval(updateCountdown, 1000);
	// If any errors are experienced, log them to console.
  }, function (errorObject) {
	console.log(`The read failed: ${errorObject.code}`);
  });
  
  $("#train-table").on("click", ".close", function (event) {
	if (confirm("Do you really want to delete?")) {
	  var key = $(this).attr("data-id");
	  database.ref(key).remove();
	}
  });
  
  
  //=============================================================//
  //        Delete train from FBdb, the row, and the array
  //=============================================================//

  database.ref().on("child_removed", function (childSnapshot) {
	console.log("on child remove");
	console.log(childSnapshot.key);
  
	// Remove the row from the table
	$("#" + childSnapshot.key).remove();
  
	// Remove the data from the array
	var trainI = findObjectIndexByKey(trainList, 'trainKey', childSnapshot.key);
	trainList.slice(trainI, 1);
  }, function (errorObject) {
	console.log("The remove failed: " + errorObject.code);
  });