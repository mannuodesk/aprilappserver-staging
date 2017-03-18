var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ResponseMessage = require('./../models/ResponseMessages');
var UrlUtility = require('./../Utility/UrlUtility');
var Response = require('./../dto/APIResponse');

var editQuickReplyRoute = router.route('/editQuickReply');
var editTextCardAddBtnRoute = router.route('/editTextCardAddBtn');
var editGalleryCardAddBtnRoute = router.route('/editGalleryCardAddBtn');
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
editGalleryCardAddBtnRoute.post(function (req, res) {
    var response = new Response;
    var responseMessageId = req.body.responseMessageId;
    var object = req.body.object;
    var type = req.body.type;
    var cardId = req.body.cardId;

    if (type == 'url') {
        object._blockId = '';
    }
    ResponseMessage.findOne({ _id: responseMessageId }
        , function (err, responseMessage) {
            if (err)
                console.log(err);
            else {
                var galleryObj = {
                    'indexId': String,
                    'url': String,
                    'description': String,
                    'title': String,
                    'pictureUrl': String,
                    'cardAddButton': []
                }
                for (var i = 0; i < responseMessage.data.length; i++) {
                    if (responseMessage.data[i].indexId == cardId) {
                        galleryObj.indexId = responseMessage.data[i].indexId;
                        galleryObj.cardAddButton = responseMessage.data[i].cardAddButton;
                        galleryObj.url = responseMessage.data[i].url;
                        galleryObj.description = responseMessage.data[i].description;
                        galleryObj.title = responseMessage.data[i].title;
                        galleryObj.pictureUrl = responseMessage.data[i].pictureUrl;
                        break;
                    }
                }
                for (var j = 0; j < galleryObj.cardAddButton.length; j++) {
                    if (galleryObj.cardAddButton[j]._addButtonId == object._addButtonId) {
                        galleryObj.cardAddButton[j] = object
                    }
                }
                responseMessage.markModified('data');
                responseMessage.save(function (err) {
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                });
            }
        }
    );
});
editTextCardAddBtnRoute.post(function (req, res) {
    var response = new Response;
    var responseMessageId = req.body.responseMessageId;
    var object = req.body.object;
    var type = req.body.type;
    var cardType = req.body.responseMessageType;
    console.log(object);
    if (type == 'url') {
        object._blockId = '';
    }
    ResponseMessage.findOne({ _id: responseMessageId }
        , function (err, responseMessage) {
            if (err)
                console.log(err);
            else {
                if (cardType == 'text') {


                    for (var i = 0; i < responseMessage.data.cardAddButton.length; i++) {
                        if (responseMessage.data.cardAddButton[i]._addButtonId == object._addButtonId) {
                            responseMessage.data.cardAddButton[i] = object;
                            break;
                        }
                    }
                    responseMessage.markModified('data.cardAddButton');
                    responseMessage.save(function (err, model) {
                        console.log(model);
                        response.message = "Success";
                        response.code = 200;
                        res.json(response);
                    });
                }
                else {

                }
            }
        });
});
editQuickReplyRoute.post(function (req, res) {
    var btnName = req.body.buttonName;
    var responseMessageId = req.body.responseMessageId;
    var quickReplyId = req.body._quickReplyId;
    var _blockId = req.body._blockId;
    var response = new Response;
    var responseMessageUpdate = new ResponseMessage();
    ResponseMessage.findOne({ _id: responseMessageId }
        , function (err, responseMessage) {
            if (err)
                res.send(err);
            else {
                ResponseMessage.update(
                    { _id: responseMessageId, 'data.quickReplyBtns._addButtonId': quickReplyId },
                    {
                        '$set': {
                            'data.quickReplyBtns.$.buttonname': btnName,
                            'data.quickReplyBtns.$._blockId': _blockId,
                        }
                    },
                    function (err, numAffected) {
                        response.message = "Success";
                        response.code = 200;
                        res.json(response);
                    }
                );
            }
        });
});

module.exports = router;