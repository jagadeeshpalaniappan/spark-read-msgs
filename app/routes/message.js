var express = require('express');
var unirest = require('unirest');

var Message = require('../models/message');

var headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': 'Bearer MmQ1Y2E4YTAtYThkNi00MWVlLTk1ZGYtMzU2OTFkOGIxMmE4ODIwNTZlOGQtOTMz'
};


// ROUTES FOR OUR API
// =============================================================================

// create our messageRouter
var messageRouter = express.Router();

// middleware to use for all requests
messageRouter.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');
    next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
messageRouter.get('/', function (req, res) {
    res.json({message: 'hooray! welcome to our api!'});
});

// on routes that end in /message
// ----------------------------------------------------
messageRouter.route('/message')

    // create a bear (accessed at POST http://localhost:8080/message)
    .post(function (req, res) {


        var tmpRqst = {
            "id": "Y2lzY29zcGFyazovL3VzL1dFQkhPT0svZjRlNjA1NjAtNjYwMi00ZmIwLWEyNWEtOTQ5ODgxNjA5NDk3",
            "name": "Guild Chat to http://requestb.in/1jw0w3x1",
            "resource": "messages",
            "event": "created",
            "filter": "roomId=Y2lzY29zcGFyazovL3VzL1JPT00vY2RlMWRkNDAtMmYwZC0xMWU1LWJhOWMtN2I2NTU2ZDIyMDdi",
            "data": {
                "id": "Y2lzY29zcGFyazovL3VzL01FU1NBR0UvOGFlZDc2MjAtOTZmOS0xMWU2LTliZTAtYWI0OGM2MWZlZDJj",
                "roomId": "Y2lzY29zcGFyazovL3VzL1JPT00vY2RlMWRkNDAtMmYwZC0xMWU1LWJhOWMtN2I2NTU2ZDIyMDdi",
                "personId": "Y2lzY29zcGFyazovL3VzL1BFT1BMRS9lM2EyNjA4OC1hNmRiLTQxZjgtOTliMC1hNTEyMzkyYzAwOTg",
                "personEmail": "person@example.com",
                "created": "2015-12-04T17:33:56.767Z"
            }
        };

        tmpRqst = req.body;
        console.log(tmpRqst);

        var msgId = tmpRqst.data.id;

        var allMsgEndPoint = 'https://api.ciscospark.com/v1/messages/';
        var requestBody = {
            roomId: "Y2lzY29zcGFyazovL3VzL1JPT00vNjVhZmYwNjAtOTZmMi0xMWU2LTg4ZWItNmQ5YmRhNzYwOWRl"
        };
        var endPoint = 'https://api.ciscospark.com/v1/messages/'+ msgId;

        var Request = unirest.get();
        Request.headers(headers)
            .url(allMsgEndPoint)
            .query(requestBody)
            .send()
            .end(function (response) {
                //console.log('HTTP RESPONSE STATUS::'+response.status);
                if (response.status !== 200) {
                    console.log(response.status);
                    console.log(response.body);
                } else {


                    //var json = JSON.parse(response.body);
                    //console.log(response.body);

                    var allMsgs = response.body.items;


                    var updatedMsgs = [];
                    for (var i = 0, len = allMsgs.length; i < len; i++) {
                        var msg = allMsgs[i];
                        var msgId = msg.id;
                        msg.msgId = msgId;
                        updatedMsgs.push(msg);
                    }

                    console.log(updatedMsgs);



                    Message.insertMany(updatedMsgs)
                        .then(function(msgsDocs) {
                            //console.log(msgsDocs);


                            res.json({message: 'Message Inserted!'});

                        })
                        .catch(function(err) {
                            /* Error handling */
                            console.log(err);
                        });



                    /*
                     var bear = new Message();		// create a new instance of the Message model
                     bear.name = req.body.name;  // set the message name (comes from the request)

                     bear.save(function (err) {
                     if (err)
                     res.send(err);

                     res.json({message: 'Message created!'});
                     });
                     */


                }
            });


    })

    // get all the message (accessed at GET http://localhost:8080/api/message)
    .get(function (req, res) {
        Message.find(function (err, message) {
            if (err)
                res.send(err);

            res.json(message);
        });
    });

// on routes that end in /message/:msgId
// ----------------------------------------------------
messageRouter.route('/message/:msgId')

    // get the bear with that id
    .get(function (req, res) {
        Message.findById(req.params.msgId, function (err, bear) {
            if (err)
                res.send(err);
            res.json(bear);
        });
    })

    // update the bear with this id
    .put(function (req, res) {
        Message.findById(req.params.msgId, function (err, bear) {

            if (err)
                res.send(err);

            bear.name = req.body.name;
            bear.save(function (err) {
                if (err)
                    res.send(err);

                res.json({message: 'Message updated!'});
            });

        });
    })

    // delete the bear with this id
    .delete(function (req, res) {
        Message.remove({
            _id: req.params.msgId
        }, function (err, bear) {
            if (err)
                res.send(err);

            res.json({message: 'Successfully deleted'});
        });
    });


module.exports = messageRouter;