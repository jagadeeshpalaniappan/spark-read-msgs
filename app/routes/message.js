var express = require('express');
var unirest = require('unirest');

var Message = require('../models/message');

var headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': 'Bearer MmQ1Y2E4YTAtYThkNi00MWVlLTk1ZGYtMzU2OTFkOGIxMmE4ODIwNTZlOGQtOTMz'
};


var _filterMessages = function (allMsgs, lastMsg) {

    var foundLastMsg = false;

    var notStoredMsgs = [];
    for (var i = 0, len = allMsgs.length; i < len; i++) {
        var msg = allMsgs[i];
        var msgId = msg.id;
        msg.msgId = msgId;


        if (lastMsg) {

            if (msgId === lastMsg.msgId) {
                console.log("Found Last Msg: " + msgId);
                foundLastMsg = true;
            }

            if (!foundLastMsg) {
                notStoredMsgs.push(msg);
            }

        } else {

            //ALL MSGS are pushed --Since, no meesage present in DB
            notStoredMsgs.push(msg);
        }


    }


    return notStoredMsgs;


};


// ROUTES FOR OUR API
// =============================================================================

// create our messageRouter
var messageRouter = express.Router();

// middleware to use for all requests
messageRouter.use(function (req, res, next) {
    // do logging
    //console.log('Something is happening.');
    next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
messageRouter.get('/', function (req, res) {
    res.json({message: 'hooray! welcome to our SPARK READ MSGS api!'});
});


// on routes that end in /message
// ----------------------------------------------------
messageRouter.route('/message')

    // create a bear (accessed at POST http://localhost:8080/message)
    .post(function (httpReq, httpResp) {


        var msgRequest = httpReq.body;
        //console.log(msgRequest);

        var msgId = msgRequest.data.id;

        var allMsgEndPoint = 'https://api.ciscospark.com/v1/messages/';
        var requestBody = {
            roomId: "Y2lzY29zcGFyazovL3VzL1JPT00vNjVhZmYwNjAtOTZmMi0xMWU2LTg4ZWItNmQ5YmRhNzYwOWRl"
        };
        var endPoint = 'https://api.ciscospark.com/v1/messages/' + msgId;

        var Request = unirest.get();
        Request.headers(headers)
            .url(allMsgEndPoint)
            .query(requestBody)
            .send()
            .end(function (sparkApiMsgsReadResp) {
                //console.log('HTTP RESPONSE STATUS::'+response.status);
                if (sparkApiMsgsReadResp.status !== 200) {
                    console.log(sparkApiMsgsReadResp.status);
                    console.log(sparkApiMsgsReadResp.body);
                    httpResp.json({message: 'ERROR: WHILE GETTING ALL MSGS FROM SPARK API'});

                } else {

                    var allMsgs = sparkApiMsgsReadResp.body.items;

                    Message.findOne().sort({created: -1}).exec(function (err, lastMsg) {

                        if (err) {
                            httpResp.json({message: 'ERROR: WHILE GETTING last MSG FROM DB'});
                            throw err;

                        } else {

                            console.log("$$$$$$$$$$$ lastMsg:: $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
                            console.log(JSON.stringify(lastMsg));

                            var notStoredMsgs = _filterMessages(allMsgs, lastMsg);

                            console.log("notStoredMsgs:: ");
                            console.log(notStoredMsgs.length);

                            Message.insertMany(notStoredMsgs)
                                .then(function (msgsDocs) {
                                    //console.log(msgsDocs);
                                    httpResp.json({message: 'MESSAGES PUSHED SUCCESSFULLY IN DB'});

                                })
                                .catch(function (err) {
                                    /* Error handling */
                                    httpResp.json({message: 'BUlK MESSAGE PUSH -FAILURE!'});
                                    console.log(err);
                                });

                        }


                    });


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