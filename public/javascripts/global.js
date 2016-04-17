/* Angular module definitions */
var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $http) {

	$scope.loadvis = false;
	$scope.showdebug = false;
	$scope.debug = "";
	$scope.newClient = {};
	$scope.myWelcome = "";
	$scope.warning = "";
	$scope.getemptymap = function(markerpos,name) {
		if(markerpos == undefined || markerpos == null)
			$scope.warning ="No data point exists!";
		else
			$scope.warning ="";
		getemptymap(markerpos,name);
	};

	$scope.showRoute = function() {
		$scope.loadvis = true;
		//console.log("courier: " + $scope.newClient);
		//alert($scope.newClient._id);
		//showRoute($scope.newClient._id);

		$http.get("/coordinates?cid=" + $scope.newClient._id)
		.then(function(response) {
			console.log("ANGDATA: " + response.data);
			//alert(JSON.stringify(response.data) );
			if(response.data == undefined || response.data == null)
				$scope.warning ="No data point exists!";
			else if(response.data.length > 1)
				showroute(response.data);
			else
				$scope.warning ="";
			$scope.loadvis = false;
			$scope.debug = response.data;
			//$scope.myWelcome = response.data;
		});
		
 	};

	$scope.locateMe = function() {
		locateMe();
	};

	$scope.alert = function(msg) {
		alert(msg);
	};


	angular.element(document).ready(function () {
		$scope.loadvis = true;
		$http.get("/couriers")
		.then(function(response) {
			console.log("ANGDATA: " + response.data);
			//alert(JSON.stringify(response.data) );
			$scope.myWelcome = response.data;
			$scope.debug = response.data;
			$scope.newClient = $scope.myWelcome[0];
			getemptymap($scope.newClient.lastLocation,$scope.newClient.name);
			if(response.data == undefined || response.data == null)
				$scope.warning ="No data point exists!";
			else
				$scope.warning ="";
			$scope.loadvis = false;
		});
	});
});

/* Draw ampty map with a single marker */
function getemptymap(markerpos,name)
{
	console.log(markerpos);
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 3,
		center: markerpos,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});
  

	var marker=new google.maps.Marker({
		position:markerpos,
	});

	//Adding the Marker content to it
	var infowindow = new google.maps.InfoWindow({
		content: "<h3>Courier "+ name +" is here</h3>",
		//Settingup the maxwidth
  		maxWidth: 300
	});
  		//Event listener to trigger the marker content
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.open(map,marker);});

	marker.setMap(map);
}

/* Show route as a polyline */
var showroute = function(coordinates){
  var clat = 0;
  var clng = 0;
  var totlan =0;
  var totlng = 0;
  var latlngbounds = new google.maps.LatLngBounds();
  for(var i=0; i<coordinates.length; i++)
  {
     totlan+= coordinates[i].lat;
     totlng+= coordinates[i].lng;

    //bounds.extend(coordinates[i]);

  }
  totlan /= coordinates.length;
  totlng /= coordinates.length;

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: {lat: totlan, lng: totlng},
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  coordinates.forEach(function(ll){
   latlngbounds.extend(new google.maps.LatLng(ll.lat, ll.lng));
});

// for( var latLng of LatLngList)
//    latlngbounds.extend(latLng);

map.setCenter(latlngbounds.getCenter());
map.fitBounds(latlngbounds); 

/*
  var flightPlanCoordinates = [
    {lat: 37.772, lng: -122.214},
    {lat: 21.291, lng: -157.821},
    {lat: -18.142, lng: 178.431},
    {lat: -27.467, lng: 153.027}
  ];
  */
  var flightPlanCoordinates = coordinates;
var lineSymbol = {
  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
};

  
  var flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2,
  icons: [{
    icon: lineSymbol,
    offset: '100%',
    repeat:'35px',
  }],

  });

  flightPath.setMap(map);
}


/* Extra, functions to locate user and display it on the map */

//Function to locate the user
var locateMe = function(){
  	var map_element= $('#map');
    if (navigator.geolocation) {
       var position= navigator.geolocation.getCurrentPosition(loadMap);
    } else {
      map_element.innerHTML = "Geolocation is not supported by this browser.";
    }
};

var loadMap = function(position) {
  var latitude=position.coords.latitude;
  var longitude=position.coords.longitude;
  var myLatlng = new google.maps.LatLng(latitude, longitude);
     	//Initializing the options for the map
     	var myOptions = {
         center: myLatlng,
         zoom: 15,
         mapTypeId: google.maps.MapTypeId.ROADMAP,
      };
  		//Creating the map in teh DOM
      var map_element=document.getElementById("map");
      var map = new google.maps.Map(map_element,myOptions);
  		//Adding markers to it
      var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: 'You are here'
      });
  		//Adding the Marker content to it
      var infowindow = new google.maps.InfoWindow({
          content: "<h3>You are here :)</h3>",
        	//Settingup the maxwidth
          maxWidth: 300
      });
  		//Event listener to trigger the marker content
      google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);});
};

