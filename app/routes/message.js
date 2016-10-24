var express = require('express');
var unirest = require('unirest');

var Message = require('../models/message');
var messageCtrl = require('../controllers/message');


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



// on routes that end in /message
// ----------------------------------------------------
messageRouter.route('/')
    .post(messageCtrl.postMsgs)
    .get(messageCtrl.getMsgs);


// on routes that end in /message/:msgId
// ----------------------------------------------------
messageRouter.route('/:msgId')
    .get(messageCtrl.getMsgById)
    .put(messageCtrl.updateMsgById)
    .delete(messageCtrl.deleteMsgById);


module.exports = messageRouter;