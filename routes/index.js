var coordinates = null;
var couriers = [];

var express = require('express');
var router = express.Router();
//var fs = require('../public/javascripts/global.js');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test'); //lets work on test db for now.

var courierSchema = mongoose.Schema({
	name: String,
	lastLocation: {lat:Number, lng:Number} // lastLocation : { type : Array , "default" : [] }
});

courierSchema.methods.getLastLocation = function () {
	var desc = this.name
	? "courier name is " + this.name
	: "I don't have a name";
	desc += "\n Last Location:(" + this.lastLocation.lat + "::" + this.lastLocation.lng + ")";
	console.log(desc);
}

var routeSchema = mongoose.Schema({
	_courierId   : { type: String, ref: 'Courier' },
	createdAt    : String,
	lastLocation : {lat:Number, lng:Number}
});
  
var Route  = mongoose.model('Route', routeSchema);
var Courier = mongoose.model('Courier', courierSchema);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	// we're connected!
	console.log("Connected!");
});

/* get index page */
router.get('/', function(req, res, next) {
	couriers = [];
	res.render('index', { title: 'courier tracker' });
  
	var fluffy = new Courier({ name: 'roshan', lastLocation: {lat:10,lng:10} });
	fluffy.getLastLocation(); // "Meow name is fluffy"

  
	Courier.find(function (err, kittens) {
		if (err) return console.error(err);
		console.log(kittens +  ".." + JSON.stringify(kittens));
		console.log(kittens.length);
		arr = [];
		for (var i = 0;i<kittens.length;i++){
			console.log(kittens[i].name + " " + kittens[i].lastLocation);
			arr.push(kittens[i].lastLocation);
			couriers.push(kittens[i]);
      		}

		coordinates = arr[0];
		//console.log(kit + " " + kit.name + " " +  JSON.stringify(kit)  );
		//kit.getLastLocation();
	});
});

router.get('/endpoint', function(req, res, next) {
	res.send("Testing endpoint");
	console.log("Testing endpoint");
});

//some related import for /post
var bodyParser = require('body-parser')
router.use( bodyParser.json() );      
router.use(bodyParser.urlencoded({  
	extended: true
})); 

router.post('/', function(request, response){
	console.log(request.body.user.name);
	console.log(request.body.user.lat + " " + request.body.user.lng);
	var courierId = null;
	var lastloc = {lat:request.body.user.lat,lng:request.body.user.lng};
	Courier.findOneAndUpdate({name: request.body.user.name},
			{ lastLocation: lastloc },
			{new: true, passRawResult:true, upsert:true }, function (err, tank,result) {
		if (err) {console.log("ERROR!!!"); return handleError(err); }
		courierId = tank._id;

		console.log("RES: " + result._id + " " + tank._id);
		console.log(tank.name + " " + tank.lastLocation);

		if(courierId !=null)
		{
			console.log(courierId);
			var fluffy = new Route({ _courierId: courierId, createdAt: new Date().toISOString(), lastLocation: lastloc });
        
			fluffy.save(function (err, fluffy) {
				if (err) return console.error(err);
				console.log(fluffy);
			});
        	}
        	else{
          		console.log("NULL ID");
		}

	//redirect instead of sending page info
	response.redirect(request.get('referer'));

	}); 
	//response.render('index', { title: 'courier tracker' });
});

var moment = require('moment')

router.get('/coordinates', function(req, res, next) {
	console.log("COOORD: " + coordinates );
	var today = moment().startOf('day').toDate()
	var tomorrow = moment(today).add(1, 'days').toDate()
	console.log("TODD" + today + "||| " +today.toISOString() + "\n" + tomorrow + "|||| " +tomorrow.toISOString() );
  
	console.log("!!cid:" + req.query.cid);
	Route.find({$query: { '_courierId': req.query.cid, createdAt: { $gte: today.toISOString(), $lt: tomorrow.toISOString() }}, 
			$orderby: { createdAt: 1 } },function (err, kittens) {
		if (err) return console.error(err);
		console.log(kittens +  ".." + JSON.stringify(kittens));
		console.log(kittens.length);
		arr = [];
		for (var i = 0;i<kittens.length;i++){
 			console.log(kittens[i]._id + " " + kittens[i].lastLocation);
			arr.push(kittens[i].lastLocation);
		}

       		coordinates = arr;
        	//console.log(kit + " " + kit.name + " " +  JSON.stringify(kit)  );
        	//kit.getLastLocation();
        	res.send(coordinates);
	});
  
    
});

router.get('/lastlocation', function(req, res, next) {
	//we already fetched this information during first /GET request, just send it
	console.log( "LASTLOCATION: " + coordinates);
	res.send(coordinates);
});

router.get('/couriers', function(req, res, next) {
	//we already fetched this information during first /GET request, just send it
	console.log("COURIERS: " + couriers);
	res.send(couriers);
});


module.exports = router;

