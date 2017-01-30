var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ResponseMessage = require('./../models/ResponseMessages');
var UrlUtility = require('./../Utility/UrlUtility');
var Response = require('./../dto/APIResponse');

var editQuickReplyRoute = router.route('/editQuickReply/:buttonName/:responseMessageId/:_quickReplyId');
var utility = new UrlUtility(
    {
    });
var url = utility.getURL();
mongoose.connect(url, function (err, db) {
    if (err) {
        console.log("Failed to Connect to MongoDB");
    }
    else {
        console.log("Successfully Connected");
    }
});

editQuickReplyRoute.get(function (req, res) {
    var btnName = req.params.buttonName;
    var responseMessageId = req.params.responseMessageId;
    var quickReplyId = req.params._quickReplyId;
    var response = new Response;
    var responseMessageUpdate = new ResponseMessage();
    ResponseMessage.findOne({ _id: responseMessageId }
        , function (err, responseMessage) {
            if (err)
                res.send(err);
            else {
                ResponseMessage.update(
                    {_id: responseMessageId, 'data.quickReplyBtns._addButtonId': quickReplyId}, 
                    {'$set': {
                        'data.quickReplyBtns.$.buttonname': btnName          
                    }},
                    function(err, numAffected) {
response.message = "Success";
                    response.code = 200;
                    res.json(response);
                    }
                );
                /*
                responseMessageUpdate = responseMessage;
                var responseMessageData = responseMessage.data;
                for (var i = 0; i < responseMessageData.quickReplyBtns.length; i++) {
                    if(responseMessageData.quickReplyBtns[i]._addButtonId == quickReplyId){
                        responseMessageData.quickReplyBtns[i].buttonname = btnName;
                        break;
                    }
                }
                responseMessageUpdate.data = responseMessageData;
                responseMessage.up
                responseMessageUpdate.save(function(err, model){
                    console.log(model);
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                });*/
            }
        });
});

module.exports = router;