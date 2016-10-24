// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var morgan = require('morgan');
var messageRouter = require('./app/routes/message');

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; // set our port

var mongoose = require('mongoose');

var options = {
    user: "jaganttp",
    pass: "jaganttp",
    auth: {
        authdb: 'japp1'
    }
};

//mongoose.connect('mongodb://jaganttp:Jaganttp!1@ds019668.mlab.com:19668/japp1',


var db = mongoose.connect('ds019668.mlab.com', 'japp1', 19668, options,

    function (err) {
        if (err) throw err;


        var Message = require('./app/models/message');


        // REGISTER OUR ROUTES -------------------------------
        // =============================================================================

        // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
        app.get('/', function (req, res) {
            res.json({message: 'hooray! welcome to our SPARK READ MSGS api!'});
        });

        app.use('/api/message', messageRouter);


        // START THE SERVER
        // =============================================================================
        app.listen(port);
        console.log('Magic happens on port ' + port);


    });


