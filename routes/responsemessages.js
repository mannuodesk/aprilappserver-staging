var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ResponseMessage = require('./../models/ResponseMessages');
var UrlUtility = require('./../Utility/UrlUtility');
var Response = require('./../dto/APIResponse');
var Block = require('./../models/Block');
var uuid = require('node-uuid');

//GET home page. 
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

var postResponseMessageRoute = router.route('/addResponseMessage');
var getAllResponseMessagesRoute = router.route('/getAllResponseMessages');
var getAllResponseMessagesOnBlockRoute = router.route('/getAllResponseMessagesOnBlock/:blockId');
var updateTitleRoute = router.route('/updateTitle');
var updateDescriptionRoute = router.route('/updateDescription/:responseMessageId/:indexId/:descriptionText');
var updateArticleRoute = router.route('/updateArticle')
var updateUrlRoute = router.route('/updateUrl');
var deleteResponseMessageRoute = router.route('/deleteResponseMessage/:responseMessageId');
var deleteAddButtonRoute = router.route('/deleteAddButton/:responseMessageId/:addButtonId/:type');
var deleteQuickReplyRoute = router.route('/deleteQuickReply/:responseMessageId/:_quickReplyId');
var addAddButtonRoute = router.route('/addAddButton');
var addGalleryCardRoute = router.route('/addGalleryCard');
var addTextRandomRoute = router.route('/addTextRandom/:responseMessageId/:count');
var deleteGalleryCardRoute = router.route('/deleteGalleryCard/:responseMessageId/:galleryCardId');
var addQuickReplyRoute = router.route('/addQuickReply');
var sortingOfResponseMessagesRoute = router.route('/sortingOfResponseMessages');
var updateRandomTitleRoute = router.route('/updateRandomTitle');
var deleteRandomTitleRoute = router.route('/deleteRandomText/:responseMessageId/:indexId');
var deleteOneGalleryCardRoute = router.route('/deleteOneGalleryCard/:responseMessageId/:indexId');
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
deleteOneGalleryCardRoute.get(function (req, res) {
    var response = new Response();
    ResponseMessage.findByIdAndUpdate(
        req.params.responseMessageId,
        { $pull: { 'data': { indexId: req.params.indexId } } },
        { safe: true, upsert: true },
        function (err, model) {
            if (err)
                console.log(err);
            else {
                var flag = true;
                for (var i = 0; i < model.data.length; i++) {
                    if (model.data[i].indexId != req.params.indexId) {
                        if (model.data[i].title == "") {
                            flag = false;
                            break;
                        }
                        else {
                            flag = true;
                        }
                    }
                }
                if (model.data.length == 0 || model.data.length == 1) {
                    flag = false;
                }
                model.isCompleted = flag;
                model.markModified('anything');
                model.save(function (err) {
                    updateBlockStatusIsCompleted(model._blockId);
                    response.data = flag;
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                });
            }
        });
});
deleteRandomTitleRoute.get(function (req, res) {
    var responseMessageId = req.params.responseMessageId;
    var indexId = req.params.indexId;
    var response = new Response();
    ResponseMessage.findOne({ _id: responseMessageId }
        , function (err, responseMessage) {
            if (err)
                res.send(err);
            else {
                ResponseMessage.findByIdAndUpdate(
                    responseMessageId,
                    { $pull: { 'data.randomText': { indexId: indexId } } },
                    { safe: true, upsert: true },
                    function (err, model) {
                        if (err)
                            console.log(err);
                        else {
                            if (model.data.randomText.length <= 2) {
                                model.isCompleted = false;
                                model.save(function (err) {
                                    response.message = "Success";
                                    response.code = 200;
                                    res.json(response);
                                });
                            }
                            else {
                                var flag = false;
                                var count = 0;
                                model.data.randomText.shift();
                                for (var i = 1; i < model.data.randomText.length; i++) {
                                    if (model.data.randomText[i].text == '') {
                                        flag = true;
                                        count = count + 1;
                                    }
                                }
                                if (flag == false) {
                                    model.isCompleted = true;
                                    model.save(function (err) {
                                        updateBlockStatusIsCompleted(model._blockId);
                                        response.data = true;
                                        response.message = "Success";
                                        response.code = 200;
                                        res.json(response);
                                    });
                                }
                                else {
                                    if (count == 1) {
                                        model.isCompleted = true;
                                        model.save(function (err) {
                                            updateBlockStatusIsCompleted(model._blockId);
                                            response.data = true;
                                            response.message = "Success";
                                            response.code = 200;
                                            res.json(response);
                                        });
                                    }
                                    else {
                                        model.isCompleted = false;
                                        model.save(function (err) {
                                            response.message = "Success";
                                            response.code = 200;
                                            res.json(response);
                                        });
                                    }

                                }
                            }
                        }
                    });
            }
        });
});
updateRandomTitleRoute.post(function (req, res) {
    var responseMessageId = req.body.responseMessageId;
    var indexId = req.body.indexId;
    var titleText = req.body.titleText;
    console.log(titleText);
    var response = new Response();
    ResponseMessage.findOne({ _id: responseMessageId }
        , function (err, responseMessage) {
            if (err)
                res.send(err);
            else {
                for (var i = 0; i < responseMessage.data.randomText.length; i++) {
                    if (responseMessage.data.randomText[i].indexId == indexId) {
                        responseMessage.data.randomText[i].text = titleText;
                    }
                }
                responseMessage.markModified('data.randomText');
                responseMessage.save(function (err, model) {
                    if (titleText != "" && model.data.randomText.length > 0) {
                        var flag = false;
                        for (var i = 1; i < model.data.randomText.length; i++) {
                            if (model.data.randomText[i].text == '') {
                                flag = true;
                            }
                        }
                        if (flag == false) {
                            model.isCompleted = true;
                            model.save(function (err) {
                                updateBlockStatusIsCompleted(model._blockId);
                                response.data = true;
                                response.message = "Success";
                                response.code = 200;
                                res.json(response);
                            });
                        }
                        else {
                            model.isCompleted = false;
                            model.save(function (err) {
                                response.message = "Success";
                                response.code = 200;
                                res.json(response);
                            });
                        }
                    }
                    else {
                        model.isCompleted = false;
                        model.save(function (err) {
                            response.message = "Success";
                            response.code = 200;
                            res.json(response);
                        });
                    }
                    console.log(model.data.randomText);
                });
            }
        });
});
addTextRandomRoute.get(function (req, res) {
    var responseMessageId = req.params.responseMessageId;
    var count = req.params.count;
    var response = new Response();
    var text = "";
    var obj = {
        'indexId': uuid.v4(),
        'text': ''
    };
    ResponseMessage.findByIdAndUpdate(
        responseMessageId,
        { $push: { "data.randomText": obj } },
        { safe: true, upsert: true },
        function (err, model) {
            if (err)
                console.log(err);
            else {
                model.isCompleted = false;
                model.save(function (err) {
                    updateBlockStatusIsCompleted(model._blockId);
                    response.data = true;
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                });
            }
        }
    );
});
deleteGalleryCardRoute.get(function (req, res) {
    var responseMessageId = req.params.responseMessageId;
    var galleryCardId = req.params.galleryCardId;
    var response = new Response();
    ResponseMessage.findByIdAndUpdate(
        responseMessageId,
        { $pull: { 'data': { _addButtonId: galleryCardId } } },
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
});
sortingOfResponseMessagesRoute.post(function (req, res) {
    var oldIndex = req.body.oldIndex;
    var newIndex = req.body.newIndex;
    var response = new Response();
    var groupId = req.body.groupId;
    ResponseMessage.findOne({ _id: groupId })
        .exec(function (err, responseMessage) {
            if (err)
                res.send(err);
            else {
                if (responseMessage != null) {
                    responseMessage.order = newIndex;
                    responseMessage.save(function (err, responseMessageModel) {
                        ResponseMessage.find({}, null, { sort: { 'order': 'ascending' } }, function (err, responseMessages) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                var count = 0;
                                if (responseMessages.length != 0) {
                                    if (newIndex < oldIndex) {
                                        for (var i = 0; i < responseMessages.length; i++) {
                                            if (newIndex < responseMessages[i].order && oldIndex >= responseMessages[i].order) {
                                                responseMessages[i].order = responseMessages[i].order + 1;
                                                responseMessages[i].save(function (err) {
                                                    count = count + 1;
                                                    if (responseMessages.length == count) {
                                                        response.message = "Success";
                                                        response.code = 200;
                                                        res.json(response);
                                                    }
                                                });
                                            }
                                            else if (responseMessages[i].order == newIndex && responseMessages[i]._id != groupId) {
                                                responseMessages[i].order = responseMessages[i].order + 1;
                                                responseMessages[i].save(function (err) {
                                                    count = count + 1;
                                                    if (responseMessages.length == count) {
                                                        response.message = "Success";
                                                        response.code = 200;
                                                        res.json(response);
                                                    }
                                                });
                                            }
                                            else {
                                                count = count + 1;
                                                if (responseMessages.length == count) {
                                                    response.message = "Success";
                                                    response.code = 200;
                                                    res.json(response);
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        for (var i = 0; i < responseMessages.length; i++) {
                                            if (oldIndex <= responseMessages[i].order && newIndex > responseMessages[i].order) {
                                                responseMessages[i].order = responseMessages[i].order - 1;
                                                responseMessages[i].save(function (err) {
                                                    count = count + 1;
                                                    if (responseMessages.length == count) {
                                                        response.message = "Success";
                                                        response.code = 200;
                                                        res.json(response);
                                                    }
                                                });
                                            }
                                            else if (responseMessages[i].order == newIndex && responseMessages[i]._id != groupId) {
                                                responseMessages[i].order = responseMessages[i].order - 1;
                                                responseMessages[i].save(function (err) {
                                                    count = count + 1;
                                                    if (responseMessages.length == count) {
                                                        response.message = "Success";
                                                        response.code = 200;
                                                        res.json(response);
                                                    }
                                                });
                                            }
                                            else {
                                                count = count + 1;
                                                if (responseMessages.length == count) {
                                                    response.message = "Success";
                                                    response.code = 200;
                                                    res.json(response);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    });
                }
            }
        });

});
deleteQuickReplyRoute.get(function (req, res) {
    var responseMessageId = req.params.responseMessageId;
    var addButtonId = req.params._quickReplyId;
    var response = new Response();
    ResponseMessage.findByIdAndUpdate(
        responseMessageId,
        { $pull: { 'data.quickReplyBtns': { _addButtonId: addButtonId } } },
        { safe: true, upsert: true },
        function (err, model) {
            if (err)
                console.log(err);
            else {
                console.log(model.data.quickReplyBtns);
                if (model.data.quickReplyBtns.length == 0 || model.data.quickReplyBtns.length == 1) {
                    console.log(model);
                    model.isCompleted = false;
                    model.save(function (err) {
                        updateBlockStatusIsCompleted(model._blockId);
                        response.message = "Success";
                        response.code = 200;
                        res.json(response);
                    });
                }
                else {
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                }
            }
        }
    );
});
deleteAddButtonRoute.get(function (req, res) {
    var responseMessageId = req.params.responseMessageId;
    var addButtonId = req.params.addButtonId;
    var type = req.params.type;
    var response = new Response();
    var resmesId = responseMessageId.slice(1);
    if (type == 'gallery') {
        ResponseMessage.findOne({ _id: resmesId }
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
                        if (responseMessage.data[i].indexId == responseMessageId) {
                            galleryObj.indexId = responseMessage.data[i].indexId;
                            galleryObj.cardAddButton = responseMessage.data[i].cardAddButton;
                            galleryObj.url = responseMessage.data[i].url;
                            galleryObj.description = responseMessage.data[i].description;
                            galleryObj.title = responseMessage.data[i].title;
                            galleryObj.pictureUrl = responseMessage.data[i].pictureUrl;
                            for (var j = 0; j < responseMessage.data[i].cardAddButton.length; j++) {
                                if (responseMessage.data[i].cardAddButton[j]._addButtonId == addButtonId) {
                                    console.log('slicing');
                                    responseMessage.data[i].cardAddButton.splice(j, 1);
                                }
                            }
                            break;
                        }
                    }
                    console.log(galleryObj.cardAddButton);
                    for (var j = 0; j < galleryObj.cardAddButton.length; j++) {
                        if (galleryObj.cardAddButton[j]._addButtonId == addButtonId) {
                            console.log('slicing');
                            galleryObj.cardAddButton.splice(j, 1);
                        }
                    }
                    console.log(galleryObj.cardAddButton);
                    responseMessage.markModified('data');
                    responseMessage.save(function (err) {
                        response.message = "Success";
                        response.code = 200;
                        res.json(response);
                    });
                }
            });
    }
    else {
        ResponseMessage.findByIdAndUpdate(
            responseMessageId,
            { $pull: { 'data.cardAddButton': { _addButtonId: addButtonId } } },
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
deleteResponseMessageRoute.get(function (req, res) {
    var responseMessageId = req.params.responseMessageId;
    var response = new Response();
    var count = 0;
    ResponseMessage.findOne({ _id: responseMessageId }
        , function (err, responseMessage) {
            if (err)
                res.send(err);
            else {
                var statusFlag = true;
                var _blockId = responseMessage._blockId;
                responseMessage.remove();
                ResponseMessage.find({ '_blockId': responseMessage._blockId }, null, { sort: { 'order': 'ascending' } }, function (err, groups) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        if (groups.length != 0) {
                            for (var i = 0; i < groups.length; i++) {
                                console.log(groups[i].order);
                                if ((i + 1) == groups[i].order) {

                                }
                                else {
                                    groups[i].order = groups[i].order - 1;
                                    groups[i].save(function (err) {
                                        if (err) {

                                        }
                                        else {
                                            count = count + 1;
                                            console.log('Updated');
                                        }
                                    })
                                }
                                if (groups[i].isCompleted == true && statusFlag == true) {
                                    statusFlag = true;
                                }
                                else {
                                    statusFlag = false;
                                }
                                if (i == count) {
                                    updateBlockStatusIsCompleted(responseMessage._blockId);
                                    response.message = "Success";
                                    response.code = 200;
                                    response.data = responseMessage;
                                    res.json(response);
                                }
                            }
                        }
                        else {
                            updateBlockStatusIsCompleted(responseMessage._blockId);
                            response.message = "No Response Message Exists";
                            response.code = 400;
                            response.data = null;
                            res.json(response);
                        }
                    }
                });
            }
        });
})
addQuickReplyRoute.post(function (req, res) {
    var responseMessageId = req.body.responseMessageId;
    var btnName = req.body.buttonName;
    var blockId = req.body._blockId;
    var count = req.body.count;
    var response = new Response();
    var obj = {
        'buttonname': btnName,
        '_blockId': blockId,
        '_addButtonId': 'quickreply' + count + responseMessageId
    }

    ResponseMessage.findByIdAndUpdate(
        responseMessageId,
        { $push: { "data.quickReplyBtns": obj } },
        { safe: true, upsert: true },
        function (err, model) {
            if (err)
                console.log(err);
            else {
                model.isCompleted = true;
                model.save(function (err) {
                    updateBlockStatusIsCompleted(model._blockId);
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                });
            }
        }
    );

});
addAddButtonRoute.post(function (req, res) {
    var responseMessageId = req.body.responseMessageId;
    var obj = req.body.data;
    var type = req.body.type
    var index = req.body.index;
    console.log(responseMessageId);
    var response = new Response();
    var id = "addbutton" + index + responseMessageId;
    var resmesId = responseMessageId.slice(1);
    obj._addButtonId = id;
    if (type == "text") {
        ResponseMessage.findByIdAndUpdate(
            responseMessageId,
            { $push: { "data.cardAddButton": obj } },
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
    else {

        ResponseMessage.findOne({ _id: resmesId }
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
                        if (responseMessage.data[i].indexId == responseMessageId) {
                            galleryObj.indexId = responseMessage.data[i].indexId;
                            galleryObj.cardAddButton = responseMessage.data[i].cardAddButton;
                            galleryObj.url = responseMessage.data[i].url;
                            galleryObj.description = responseMessage.data[i].description;
                            galleryObj.title = responseMessage.data[i].title;
                            galleryObj.pictureUrl = responseMessage.data[i].pictureUrl;
                            responseMessage.data[i].cardAddButton.push(obj);
                            console.log(responseMessage.data[i]);
                            break;
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
    }

});
addGalleryCardRoute.post(function (req, res) {
    var responseMessageId = req.body.responseMessageId;
    console.log(responseMessageId);
    var response = new Response();
    var obj = req.body.data;
    console.log(obj);
    obj.indexId = obj.indexId + responseMessageId;
    ResponseMessage.findByIdAndUpdate(
        responseMessageId,
        { $push: { "data": obj } },
        { safe: true, upsert: true },
        function (err, model) {
            if (err)
                console.log(err);
            else {
                ResponseMessage.update({ _id: responseMessageId }, { 'isCompleted': false }, {}, function (err, user) {
                    if (err) {
                        res.json(err);
                    }
                    else {
                        updateBlockStatusIsCompleted(model._blockId);
                        response.data = false;
                        response.message = "Success";
                        response.code = 200;
                        res.json(response);
                    }
                });
            }
        }
    );
});
updateUrlRoute.post(function (req, res) {
    var responseMessageId = req.body.responseMessageId;
    var indexId = req.body.indexId;
    var urlText = req.body.urlText;
    var response = new Response();
    ResponseMessage.findOne({ _id: responseMessageId }
        , function (err, responseMessage) {
            if (err)
                res.send(err);
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
                    if (responseMessage.data[i].indexId == indexId) {
                        galleryObj.indexId = responseMessage.data[i].indexId;
                        galleryObj.cardAddButton = responseMessage.data[i].cardAddButton;
                        galleryObj.url = responseMessage.data[i].url;
                        galleryObj.description = responseMessage.data[i].description;
                        galleryObj.title = responseMessage.data[i].title;
                        galleryObj.pictureUrl = responseMessage.data[i].pictureUrl;
                        responseMessage.data[i].url = urlText;
                        break;
                    }
                }
                galleryObj.url = urlText;
                console.log(galleryObj);
                responseMessage.markModified('data');
                responseMessage.save(function (err) {
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                });
            }
        });
});
updateDescriptionRoute.get(function (req, res) {
    var responseMessageId = req.params.responseMessageId;
    var descriptionText = req.params.descriptionText;
    var indexId = req.params.indexId;
    var response = new Response();
    ResponseMessage.findOne({ _id: responseMessageId }
        , function (err, responseMessage) {
            if (err)
                res.send(err);
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
                    if (responseMessage.data[i].indexId == indexId) {
                        galleryObj.indexId = responseMessage.data[i].indexId;
                        galleryObj.cardAddButton = responseMessage.data[i].cardAddButton;
                        galleryObj.url = responseMessage.data[i].url;
                        galleryObj.description = responseMessage.data[i].description;
                        galleryObj.title = responseMessage.data[i].title;
                        galleryObj.pictureUrl = responseMessage.data[i].pictureUrl;
                        responseMessage.data[i].description = descriptionText;
                        console.log(responseMessage.data[i]);
                        break;
                    }
                }
                galleryObj.description = descriptionText;
                console.log(galleryObj);
                responseMessage.markModified('data');
                responseMessage.save(function (err) {
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                });
            }
        });
});
updateArticleRoute.post(function (req, res) {
    var responseMessageId = req.body.responseMessageId;
    var articleText = req.body.text;
    console.log(articleText);
    var response = new Response();
    ResponseMessage.findOne({ _id: responseMessageId }
        , function (err, dumm) {
            if (err)
                res.send(err);
            else {
                if (articleText != "" && dumm.data.text !== undefined) {
                    ResponseMessage.update({ _id: responseMessageId }, { 'data.articleText': articleText, 'isCompleted': true }, {}, function (err, user) {
                        if (err) {
                            res.json(err);
                        }
                        else {
                            updateBlockStatusIsCompleted(dumm._blockId);
                            response.data = true;
                            response.message = "Success";
                            response.code = 200;
                            res.json(response);
                        }
                    });
                }
                else {
                    ResponseMessage.update({ _id: responseMessageId }, { 'data.articleText': articleText, 'isCompleted': false }, {}, function (err, user) {
                        if (err) {
                            res.json(err);
                        }
                        else {
                            response.data = false;
                            response.message = "Success";
                            response.code = 200;
                            res.json(response);
                        }
                    });
                }
            }
        });
});
updateTitleRoute.post(function (req, res) {
    var responseMessageId = req.body.responseMessageId;
    var indexId = req.body.indexId;
    var type = req.body.type;
    var titleText = req.body.titleText;
    var response = new Response();
    ResponseMessage.findOne({ _id: responseMessageId }
        , function (err, responseMessage) {
            if (err)
                res.send(err);
            else {
                if (type == 'gallery') {
                    var galleryObj = {
                        'indexId': String,
                        'url': String,
                        'description': String,
                        'title': String,
                        'pictureUrl': String,
                        'cardAddButton': []
                    }
                    var flag = true;
                    for (var i = 0; i < responseMessage.data.length; i++) {
                        if (responseMessage.data[i].indexId == indexId) {
                            galleryObj.indexId = responseMessage.data[i].indexId;
                            galleryObj.cardAddButton = responseMessage.data[i].cardAddButton;
                            galleryObj.url = responseMessage.data[i].url;
                            galleryObj.description = responseMessage.data[i].description;
                            galleryObj.title = responseMessage.data[i].title;
                            galleryObj.pictureUrl = responseMessage.data[i].pictureUrl;
                            responseMessage.data[i].title = titleText;
                            console.log(responseMessage.data[i]);
                            break;
                        }
                    }
                    galleryObj.title = titleText;
                    for (var i = 0; i < responseMessage.data.length; i++) {
                        if (responseMessage.data[i].title == '') {
                            flag = false;
                        }
                    }
                    responseMessage.markModified('data');
                    responseMessage.save(function (err) {
                        if (flag == true) {
                            ResponseMessage.update({ _id: responseMessageId }, { 'isCompleted': flag }, {}, function (err, user) {
                                if (err) {
                                    res.json(err);
                                }
                                else {
                                    updateBlockStatusIsCompleted(responseMessage._blockId);
                                    response.data = flag;
                                    response.message = "Success";
                                    response.code = 200;
                                    res.json(response);
                                }
                            });
                        } else {
                            ResponseMessage.update({ _id: responseMessageId }, { 'isCompleted': flag }, {}, function (err, user) {
                                if (err) {
                                    res.json(err);
                                }
                                else {
                                    response.data = flag;
                                    response.message = "Success";
                                    response.code = 200;
                                    res.json(response);
                                }
                            });
                        }
                    });
                }
                else if (type == 'article') {
                    if (titleText != "" && responseMessage.data.articleText != "") {
                        ResponseMessage.update({ _id: responseMessage._doc._id }, { 'data.text': titleText, 'isCompleted': true }, {}, function (err, user) {
                            if (err) {
                                res.json(err);
                            }
                            else {
                                updateBlockStatusIsCompleted(responseMessage._blockId);
                                response.data = true;
                                response.message = "Success";
                                response.code = 200;
                                res.json(response);

                            }
                        });
                    }
                    else {
                        ResponseMessage.update({ _id: responseMessage._doc._id }, { 'data.text': titleText, 'isCompleted': false }, {}, function (err, user) {
                            if (err) {
                                res.json(err);
                            }
                            else {
                                response.data = false;
                                response.message = "Success";
                                response.code = 200;
                                res.json(response);

                            }
                        });
                    }

                }
                else {
                    ResponseMessage.update({ _id: responseMessage._id }, { 'data.text': titleText, isCompleted: true }, {}, function (err, user) {
                        if (err) {
                            res.json(err);
                        }
                        else {
                            updateBlockStatusIsCompleted(responseMessage._blockId);
                            response.message = "Success";
                            response.code = 200;
                            res.json(response);
                        }
                    });
                }
            }
        });
});
getAllResponseMessagesOnBlockRoute.get(function (req, res) {
    var blockId = req.params.blockId;
    var response = new Response();
    ResponseMessage.find({ _blockId: blockId }, function (err, responseMessages) {
        if (err) {
            res.send(err);
        }
        else {
            response.data = responseMessages;
            response.message = "Success";
            response.code = 200;
            res.json(response);
        }
    });
});
postResponseMessageRoute.post(function (req, res) {
    // Create a new instance of the Beer model
    var responseMessage = new ResponseMessage();
    var response = new Response();
    var date = new Date();
    // Set the beer properties that came from the POST data
    ResponseMessage.find({ '_blockId': req.body._blockId }, null, { sort: { '_id': -1 } }, function (err, groups) {
        if (err) {
            res.send(err);
        }
        else {
            var order = 0;
            for (var i = 0; i < groups.length; i++) {
                if (order < groups[i].order) {
                    order = groups[i].order;
                }
            }
            responseMessage.data = req.body.data;
            responseMessage.type = req.body.type;
            responseMessage._blockId = req.body._blockId;
            responseMessage.createdOnUTC = date;
            responseMessage.updatedOnUTC = date;
            responseMessage.isDeleted = false;
            responseMessage.order = order + 1;
            responseMessage.isCompleted = false;
            // Save the beer and check for errors
            responseMessage.save(function (err) {
                if (err) {
                    res.send(err);
                }
                else {
                    if (responseMessage.type == 'gallery') {
                        var galleryObj = responseMessage.data[0];
                        galleryObj.indexId = responseMessage.data[0].indexId + responseMessage._id;
                        ResponseMessage.findByIdAndUpdate(
                            responseMessage._id,
                            { $pull: { 'data': { indexId: 1 } } },
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
                                                setBlockCompletion(responseMessage._blockId, false)
                                                response.data = responseMessage;
                                                response.message = "Success: New Created";
                                                response.code = 200;
                                                res.json(response);
                                            }
                                        }
                                    );
                                }
                            }
                        );
                    }
                    else {
                        setBlockCompletion(responseMessage._blockId, false)
                        response.data = responseMessage;
                        response.message = "Success: New Created";
                        response.code = 200;
                        res.json(response);
                    }
                }
            });
        }
    });
});
getAllResponseMessagesRoute.get(function (req, res) {
    // Create a new instance of the Beer model
    var response = new Response();
    // Save the beer and check for errors

    ResponseMessage.find({}, null, { sort: { '_id': -1 } }, function (err, responseMessages) {
        if (err) {
            res.send(err);
        }
        else {
            response.message = "Success";
            response.code = 200;
            response.data = responseMessages;
            res.json(response);
        }
    });
});
function updateBlockStatusIsCompleted(_blockId) {
    var count = 0;
    ResponseMessage.find({ _blockId: _blockId }
        , function (err, responseMessage) {
            if (err)
                res.send(err);
            else {
                if (responseMessage.length != 0) {
                    for (var i = 0; i < responseMessage.length; i++) {
                        if (responseMessage[i].isCompleted == true) {
                            count = count + 1;
                        }
                        else {
                            setBlockCompletion(responseMessage[i]._blockId, false);
                            break;
                        }
                    }
                    if (responseMessage.length == count) {
                        setBlockCompletion(_blockId, true);
                    }
                }


                else {
                    setBlockCompletion(_blockId, true);
                }
            }
        });
}
function setBlockCompletion(_blockId, status) {
    Block.findByIdAndUpdate(
        _blockId,
        { 'isCompleted': status },
        { safe: true, upsert: true },
        function (err, model) {
            if (err)
                console.log(err);
            else {
                console.log(model);
            }
        });
}
module.exports = router;