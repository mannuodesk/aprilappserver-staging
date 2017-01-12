var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var ResponseMessage = require('./../models/ResponseMessages');
var UrlUtility = require('./../Utility/UrlUtility');
var Response = require('./../dto/APIResponse');

//GET home page. 
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

var postResponseMessageRoute = router.route('/addResponseMessage');
var getAllResponseMessagesRoute = router.route('/getAllResponseMessages');
var getAllResponseMessagesOnBlockRoute = router.route('/getAllResponseMessagesOnBlock/:blockId');
var updateTitleRoute = router.route('/updateTitle/:responseMessageId/:indexId/:type/:titleText');
var updateDescriptionRoute = router.route('/updateDescription/:responseMessageId/:indexId/:descriptionText');
var updateArticleRoute = router.route('/updateArticle')
var updateUrlRoute = router.route('/updateUrl/:responseMessageId/:indexId/:urlText');
var deleteResponseMessageRoute = router.route('/deleteResponseMessage/:responseMessageId');
var deleteAddButtonRoute = router.route('/deleteAddButton/:responseMessageId/:addButtonId/:type');
var deleteQuickReplyRoute = router.route('/deleteQuickReply/:responseMessageId/:_quickReplyId');
var addAddButtonRoute = router.route('/addAddButton');
var addGalleryCardRoute = router.route('/addGalleryCard');
var addTextRandomRoute = router.route('/addTextRandom/:responseMessageId/:count');
var deleteGalleryCardRoute = router.route('/deleteGalleryCard/:responseMessageId/:galleryCardId');
var addQuickReplyRoute = router.route('/addQuickReply/:responseMessageId/:buttonName/:_blockId/:count');
var sortingOfResponseMessagesRoute = router.route('/sortingOfResponseMessages');
var updateRandomTitleRoute = router.route('/updateRandomTitle/:responseMessageId/:indexId/:titleText');
var deleteRandomTitleRoute = router.route('/deleteRandomText/:responseMessageId/:indexId');
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
                            response.message = "Success";
                            response.code = 200;
                            res.json(response);
                        }
                    });
            }
        });
});
updateRandomTitleRoute.get(function (req, res) {
    var responseMessageId = req.params.responseMessageId;
    var indexId = req.params.indexId;
    var titleText = req.params.titleText;
    console.log(titleText);
    var response = new Response();
    ResponseMessage.findOne({ _id: responseMessageId }
        , function (err, responseMessage) {
            if (err)
                res.send(err);
            else {
                console.log(responseMessage.data.randomText);
                ResponseMessage.findByIdAndUpdate(
                    responseMessageId,
                    { $pull: { 'data.randomText': { indexId: indexId } } },
                    { safe: true, upsert: true },
                    function (err, model) {
                        if (err)
                            console.log(err);
                        else {
                            var obj = {
                                'indexId': indexId + 1,
                                'text': titleText
                            };
                            ResponseMessage.findByIdAndUpdate(
                                responseMessageId,
                                { $push: { "data.randomText": obj } },
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
});
addTextRandomRoute.get(function (req, res) {
    var responseMessageId = req.params.responseMessageId;
    var count = req.params.count;
    var response = new Response();
    var text = "";
    var obj = {
        'indexId': count,
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
                response.message = "Success";
                response.code = 200;
                res.json(response);
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
    ResponseMessage.find({ _id: groupId }, function (err, groups) {
        if (err) {
            res.send(err);
        }
        else {
            if (groups.length != 0) {
                console.log(groups[0]._doc._blockId);
                ResponseMessage.find({ _blockId: groups[0]._doc._blockId }, function (err, gr) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        var ID = "";
                        if (gr.length != 0) {
                            for (var i = 0; i < gr.length; i++) {
                                if (gr[i].order == newIndex) {
                                    ID = gr[i]._id;
                                    break;
                                }
                            }
                            ResponseMessage.update({ _id: ID }, { order: oldIndex }, {}, function (err, group) {
                                if (err) {
                                    res.send(err);
                                }
                                else {
                                    ResponseMessage.update({ _id: groupId }, { order: newIndex }, {}, function (err, group) {
                                        if (err) {
                                            res.json(err);
                                        }
                                        else {
                                            response.message = "Success";
                                            response.code = 200;
                                            res.json(response);
                                        }
                                    });
                                }
                            });
                        }
                    }
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
                response.message = "Success";
                response.code = 200;
                res.json(response);
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
                            break;
                        }
                    }
                    for (var j = 0; j < galleryObj.cardAddButton.length; j++) {
                        if (galleryObj.cardAddButton[j]._addButtonId == addButtonId) {
                            galleryObj.cardAddButton.splice(j);
                        }
                    }
                    console.log(galleryObj);
                    ResponseMessage.findByIdAndUpdate(
                        responseMessage._id,
                        { $pull: { 'data': { indexId: responseMessageId } } },
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
                                if (i == count) {
                                    response.message = "Success";
                                    response.code = 200;
                                    response.data = responseMessage;
                                    res.json(response);
                                }
                            }
                        }
                        else {
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
addQuickReplyRoute.get(function (req, res) {
    var responseMessageId = req.params.responseMessageId;
    var btnName = req.params.buttonName;
    var blockId = req.params._blockId;
    var count = req.params.count;
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
                response.message = "Success";
                response.code = 200;
                res.json(response);
            }
        }
    );

});
/*
addQuickReplyRoute.get(function (req, res) {
    var responseMessageId = req.params.responseMessageId;
    var btnName = req.params.buttonName;
    var blockId = req.params._blockId;
    var count = req.params.count;
    var response = new Response();
    var obj = {
        'buttonname':btnName,
        '_blockId':blockId,
        '_addButtonId':'quickreply' + count + responseMessageId
    }
    ResponseMessage.findOne({ _id: responseMessageId }
        , function (err, responseMessage) {
            if (err)
                res.send(err);
            else {
                var arrary = [];
                arrary = responseMessage.data.quickReplyBtns;
                ResponseMessage.findByIdAndUpdate(
                    responseMessage._id,
                    { "data.quickReplyBtns": arrary },
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
});*/
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
                            break;
                        }
                    }
                    galleryObj.cardAddButton.push(obj);
                    console.log(galleryObj);
                    ResponseMessage.findByIdAndUpdate(
                        responseMessage._id,
                        { $pull: { 'data': { indexId: responseMessageId } } },
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
                        }
                    );

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
                response.message = "Success";
                response.code = 200;
                res.json(response);
            }
        }
    );
});
updateUrlRoute.get(function (req, res) {
    var responseMessageId = req.params.responseMessageId;
    var indexId = req.params.indexId;
    var urlText = req.params.urlText;
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
                        break;
                    }
                }
                galleryObj.url = urlText;
                console.log(galleryObj);
                ResponseMessage.findByIdAndUpdate(
                    responseMessage._id,
                    { $pull: { 'data': { indexId: indexId } } },
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
                    }
                );
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
                        break;
                    }
                }
                galleryObj.description = descriptionText;
                console.log(galleryObj);
                ResponseMessage.findByIdAndUpdate(
                    responseMessage._id,
                    { $pull: { 'data': { indexId: indexId } } },
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
                    }
                );
            }
        });
});
updateArticleRoute.post(function (req, res) {
    var responseMessageId = req.body.responseMessageId;
    var articleText = req.body.text;
    console.log(articleText);
    var response = new Response();
    ResponseMessage.update({ _id: responseMessageId }, { 'data.articleText': articleText }, {}, function (err, user) {
        if (err) {
            res.json(err);
        }
        else {
            console.log(user);
            response.message = "Success";
            response.code = 200;
            res.json(response);
        }
    });
});
updateTitleRoute.get(function (req, res) {
    var responseMessageId = req.params.responseMessageId;
    var indexId = req.params.indexId;
    var type = req.params.type;
    var titleText = req.params.titleText;
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
                    for (var i = 0; i < responseMessage.data.length; i++) {
                        if (responseMessage.data[i].indexId == indexId) {
                            galleryObj.indexId = responseMessage.data[i].indexId;
                            galleryObj.cardAddButton = responseMessage.data[i].cardAddButton;
                            galleryObj.url = responseMessage.data[i].url;
                            galleryObj.description = responseMessage.data[i].description;
                            galleryObj.title = responseMessage.data[i].title;
                            galleryObj.pictureUrl = responseMessage.data[i].pictureUrl;
                            break;
                        }
                    }
                    galleryObj.title = titleText;
                    console.log(galleryObj);
                    ResponseMessage.findByIdAndUpdate(
                        responseMessage._id,
                        { $pull: { 'data': { indexId: indexId } } },
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
                        }
                    );
                }
                else {
                    ResponseMessage.update({ _id: responseMessage._doc._id }, { 'data.text': titleText }, {}, function (err, user) {
                        if (err) {
                            res.json(err);
                        }
                        else {
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
module.exports = router;


