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

// create our messageCtrl
var messageCtrl = {};


// on routes that end in /message
// ----------------------------------------------------
messageCtrl.postMsgs = function (httpReq, httpResp) {


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


};


messageCtrl.getMsgs = function (req, res) {
    Message.find(function (err, message) {
        if (err)
            res.send(err);

        res.json(message);
    });
};

messageCtrl.getMsgById = function (req, res) {
    Message.findById(req.params.msgId, function (err, bear) {
        if (err)
            res.send(err);
        res.json(bear);
    });
};


messageCtrl.updateMsgById = function (req, res) {
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
};


messageCtrl.deleteMsgById = function (req, res) {
    Message.remove({
        _id: req.params.msgId
    }, function (err, bear) {
        if (err)
            res.send(err);

        res.json({message: 'Successfully deleted'});
    });
};





module.exports = messageCtrl;