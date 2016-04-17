var express = require('express');
var routes = require('./routes/index');
var path = require('path');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.get('/index.html', function(req, res) {
        res.sendfile('./index.html'); //test
});

app.use('/', routes); //main webpage here


module.exports = app;
