var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ResponseMessage = require('./../models/ResponseMessages');
var UrlUtility = require('./../Utility/UrlUtility');
var Response = require('./../dto/APIResponse');

var editQuickReplyRoute = router.route('/editQuickReply/:buttonName/:responseMessageId/:_quickReplyId');
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
editGalleryCardAddBtnRoute.post(function(req, res){
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
                    console.log(galleryObj);
                    ResponseMessage.findByIdAndUpdate(
                        responseMessage._id,
                        { $pull: { 'data': { indexId: cardId } } },
                        { safe: true, upsert: true },
                        function (err, model) {
                            if (err)
                                console.log(err);
                            else {
                                ResponseMessage.findByIdAndUpdate(
                                    responseMessage._id,
                                    { $push: { "data": galleryObj } },
                                    { safe: true, upsert: true },
                                    function (err, model) {
                                        if (err)
                                            console.log(err);
                                        else {
                                            response.message = "Success";
                                            response.code = 200;
                                            res.json(response);
                                        }
                                    }
                                );
                            }
                        });
                }
            });

     /*ResponseMessage.findOne({ _id: responseMessageId }
        , function (err, responseMessage) {
            if (err)
                console.log(err);
            else {
                for (var i = 0; i < responseMessage.data.length; i++) {
                    if (responseMessage.data[i].indexId == cardId) {
                        for(var j = 0; j< responseMessage.data[i].cardAddButton.length; j++){
                            if(responseMessage.data[i].cardAddButton[j]._addButtonId = object._addButtonId){
                                responseMessage.data[i].cardAddButton[j] = object;
                                break;
                            }
                        }
                    }
                }
                responseMessage.markModified('data');
                responseMessage.save(function (err, model) {
                    console.log(model);
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                });
            }
     });*/
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
                if(cardType == 'text'){

                
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
                else{
                    
                }
            }
        });
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
                    { _id: responseMessageId, 'data.quickReplyBtns._addButtonId': quickReplyId },
                    {
                        '$set': {
                            'data.quickReplyBtns.$.buttonname': btnName
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