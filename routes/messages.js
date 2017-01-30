var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var UrlUtility = require('./../Utility/UrlUtility');
var Response = require('./../dto/APIResponse');
var BookmarkMessages = require('./../models/BookmarkMessages');
var ConversationMessages = require('./../models/ConversationMessages');
var Conversation = require('./../models/Conversation');
var ResponseMessages = require('./../models/ResponseMessages');
var events = require('events');
var EventEmitter = events.EventEmitter;

//GET home page. 
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

var bookmarkMessageRoute = router.route('/bookmarkMessage');
var getAllBookMarkMessagesRoute = router.route('/getAllBookMarkMessages/:_userId');
var deleteBookMarkMessagesRoute = router.route('/deleteBookMarkMessages/:_bookmarkMessageId');
var chatHistoryRoute = router.route('/chatHistory/:conversationId/:conversationMessageId');
var utility = new UrlUtility(
    {
    });
// Connection URL. This is where your mongodb server is running.
var url = utility.getURL();
mongoose.connect(url, function (err, db) {
    if (err) {
        console.log("Failed to Connect to MongoDB");
    }
    else {
        console.log("Successfully Connected");
    }
});
/*chatHistoryRoute.get(function (req, res) {
    var response = new Response();
    var conversationId = req.params.conversationId;
    var conversationMessageId = req.params.conversationMessageId;
    var perPage = 20;
    var conversationObj = {
        'conversationMessageId': '',
        'id': '',
        'type': '',
        'data': Object,
        'name': ''
    }
    Conversation.findOne({ _id: conversationId }
        , function (err, conversation) {
            if (err)
                console.log(err);
            else {

                console.log(conversation);
                if (conversationMessageId != -1) {
                    ConversationMessages.find({ '_conversationId': conversationId }, null, { sort: { 'createdOnUTC': 'ascending' } }, function (err, conversationMessages) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            var array = [];
                            for (var i = 0; i < conversationMessages.length; i++) {
                                if (conversationMessages[i]._id == conversationMessageId) {
                                    array = conversationMessages.slice(i + 1, conversationMessages.length);
                                }
                            }
                            if (array.length > 20) {
                                array = array.slice(Math.max(array.length - 20, 1))
                            }
                            for (var i = 0; i < array.length; i++) {
                                conversationObj = {
                                    'conversationMessageId': '',
                                    'id': '',
                                    'type': '',
                                    'data': Object,
                                    'name': ''
                                }
                                if (array[i].messageType == 'text') {
                                    conversationObj.conversationMessageId = array[i]._id;
                                    conversationObj.messageType = array[i].messageType;
                                    conversationObj.messageText = array[i].messageText;
                                    conversationObj.name = conversation.username1;
                                }
                                else {
                                    conversationObj.conversationMessageId = array[i]._id;
                                    conversationObj.id = array[i].messageData.id;
                                    conversationObj.type = array[i].messageData.type;
                                    conversationObj.data = array[i].messageData.data;
                                    conversationObj.messageType = array[i].messageType;
                                    conversationObj.name = conversation.username2;
                                }
                                array[i] = conversationObj;
                            }
                            response.message = "Success";
                            response.code = 200;
                            response.data = array;
                            res.json(response);
                        }
                    });
                }
                else {
                    ConversationMessages.find({ '_conversationId': conversationId }, null, { sort: { 'createdOnUTC': 'ascending' } }, function (err, conversationMessages) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            var array = [];
                            if (conversationMessages.length > 20) {
                                array = conversationMessages.slice(Math.max(conversationMessages.length - 20, 1));
                            }
                            
                            for (var i = 0; i < array.length; i++) {
                                console.log(array[i]._messageFromUserId);
                                conversationObj = {
                                    'conversationMessageId': '',
                                    'id': '',
                                    'type': '',
                                    'data': Object,
                                    'name': '',
                                    'messageType': '',
                                    'messageText': ''
                                }
                                if (array[i].messageType == 'text' || array[i].messageType == 'block') {
                                    conversationObj.conversationMessageId = array[i]._id;
                                    conversationObj.messageType = array[i].messageType;
                                    conversationObj.messageText = array[i].messageText;
                                    conversationObj.name = conversation.username1;
                                }
                                else {
                                    conversationObj.conversationMessageId = array[i]._id;
                                    conversationObj.id = array[i].messageData.id;
                                    conversationObj.type = array[i].messageData.type;
                                    conversationObj.data = array[i].messageData.data;
                                    conversationObj.messageType = array[i].messageType;
                                    conversationObj.name = conversation.username2;
                                }
                                array[i] = conversationObj;
                            }
                            response.message = "Success";
                            response.code = 200;
                            response.data = array;
                            res.json(response);
                        }
                    })/*.limit(perPage).skip(perPage * 0);
                }
            }
        }).populate('_user1Id');
});*/
chatHistoryRoute.get(function (req, res) {
    var response = new Response();
    var conversationId = req.params.conversationId;
    var conversationMessageId = req.params.conversationMessageId;
    var perPage = 20;
    var conversationObj = {
        'conversationMessageId': '',
        'id': '',
        'type': '',
        'data': Object,
        'name': ''
    }
    Conversation.findOne({ _id: conversationId }
        , function (err, conversation) {
            if (err)
                console.log(err);
            else {

                console.log(conversation);
                if (conversationMessageId != -1) {
                    ConversationMessages.find({ '_conversationId': conversationId }, null, { sort: { 'createdOnUTC': 'descending' } }, function (err, conversationMessages) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            var array = [];
                            for (var i = 0; i < conversationMessages.length; i++) {
                                if (conversationMessages[i]._id == conversationMessageId) {
                                    array = conversationMessages.slice(i + 1, conversationMessages.length);
                                }
                            }
                            if (array.length > 20) {
                                array = array.slice(0, 19);
                            }
                            for (var i = 0; i < array.length; i++) {
                                conversationObj = {
                                    'conversationMessageId': '',
                                    'id': '',
                                    'type': '',
                                    'data': Object,
                                    'name': ''
                                }
                                if (array[i].messageType == 'text') {
                                    conversationObj.conversationMessageId = array[i]._id;
                                    conversationObj.messageType = array[i].messageType;
                                    conversationObj.messageText = array[i].messageText;
                                    conversationObj.name = conversation.username1;
                                }
                                else {
                                    conversationObj.conversationMessageId = array[i]._id;
                                    conversationObj.id = array[i].messageData.id;
                                    conversationObj.type = array[i].messageData.type;
                                    conversationObj.data = array[i].messageData.data;
                                    conversationObj.messageType = array[i].messageType;
                                    conversationObj.name = conversation.username2;
                                }
                                array[i] = conversationObj;
                            }
                            response.message = "Success";
                            response.code = 200;
                            response.data = array;
                            res.json(response);
                        }
                    });
                }
                else {
                    ConversationMessages.find({ '_conversationId': conversationId }, null, { sort: { 'createdOnUTC': 'descending' } }, function (err, conversationMessages) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            var array = conversationMessages;
                            for (var i = 0; i < array.length; i++) {
                                console.log(array[i]._messageFromUserId);
                                conversationObj = {
                                    'conversationMessageId': '',
                                    'id': '',
                                    'type': '',
                                    'data': Object,
                                    'name': '',
                                    'messageType': '',
                                    'messageText': ''
                                }
                                if (array[i].messageType == 'text' || array[i].messageType == 'block') {
                                    conversationObj.conversationMessageId = array[i]._id;
                                    conversationObj.messageType = array[i].messageType;
                                    conversationObj.messageText = array[i].messageText;
                                    conversationObj.name = conversation.username1;
                                }
                                else {
                                    conversationObj.conversationMessageId = array[i]._id;
                                    conversationObj.id = array[i].messageData.id;
                                    conversationObj.type = array[i].messageData.type;
                                    conversationObj.data = array[i].messageData.data;
                                    conversationObj.messageType = array[i].messageType;
                                    conversationObj.name = conversation.username2;
                                }
                                array[i] = conversationObj;
                            }
                            response.message = "Success";
                            response.code = 200;
                            response.data = array;
                            res.json(response);
                        }
                    }).limit(perPage).skip(perPage * 0);
                }
            }
        }).populate('_user1Id');
});
deleteBookMarkMessagesRoute.get(function (req, res) {
    var response = new Response();
    var _bookmarkMessageId = req.params._bookmarkMessageId;
    BookmarkMessages.findOne({ _id: _bookmarkMessageId })
        .exec(function (err, bookmarkMessage) {
            if (err)
                res.send(err);
            else {
                if (bookmarkMessage != null) {
                    bookmarkMessage.remove();
                    response.message = "Success";
                    response.code = 200;
                    response.data = bookmarkMessage;
                    res.json(response);
                }
                else {
                    response.message = "No bookmark message Exists";
                    response.code = 400;
                    response.data = null;
                    res.json(response);
                }
            }
        });
});

getAllBookMarkMessagesRoute.get(function (req, res) {
    var date = new Date();
    var _userId = req.params._userId;
    var response = new Response();
    var obj = {
        text: String,
        cardAddButton: [],
        quickReplyButton: []
    };
    var responseMessageData = new Object();
    var responseArray = [];
    var loopCount = 0;
    var flowController = new EventEmitter();
    var responseMessageArray = [];
    BookmarkMessages.find({ '_userId': _userId }, null, { sort: { '_id': -1 } }, function (err, bookmarkMessages) {
        if (err) {
            res.send(err);
        }
        else {
            if (bookmarkMessages.length != 0) {

                var temp = Object;
                //for (var bookmarkMessage in bookmarkMessages) {
                flowController.on('doWork', function (i) {
                    if (i >= bookmarkMessages.length) {
                        flowController.emit('finished');
                        return;
                    }
                    ResponseMessages.find({ '_id': bookmarkMessages[i]._messageId }, null, { sort: { '_id': -1 } }, function (err, responseMessages) {
                        if (err) {
                            res.send(err);
                        }
                        else {



                        if(responseMessages.length != 0){
                            temp = responseMessages[0];
                            responseMessageArray.push(temp);
                            flowController.emit('doWork', i + 1);
                        }
                            else{
                                var responseMessage = new ResponseMessages();
                                responseMessage.type = 'text';
                                var obj = {
                                    text:'',
                                    cardAddButton:[],
                                    quickReplyButton:[]
                                }
                                responseMessage.data = obj;
                                responseMessageArray.push(responseMessage);
                                flowController.emit('doWork', i + 1);
                            }
                            //loopCount = loopCount + 1;
                        }
                        //asyncFunction(item[i], function () {
                        //flowController.emit('doWork', i + 1);
                    });

                    /*ResponseMessages.find({ '_id': bookmarkMessages[loopCount]._messageId }, null, { sort: { '_id': -1 } }, function (err, responseMessages) {
                        if (err) {
                            res.send(err);
                        }
                        else {
    
    
    
    
                            temp = responseMessages[0];
                            responseMessageArray.push(temp);
                            loopCount = loopCount + 1;
                        }*/
                    /*if(loopCount == bookmarkMessages.length)
                    {
                        flowController.emit('finished');
                        return;
                    }*/
                    //});
                });
                flowController.emit('doWork', 0);
                //}
                flowController.on('finished', function () {
                    for (var i = 0; i < bookmarkMessages.length; i++) {
                        responseMessageData = new Object();
                        responseMessageData = responseMessageArray[i];
                        if(responseMessageData.type == 'singletext'){
                            responseMessageData.type = 'text';
                        }
                        if (bookmarkMessages[i].type == 'text') {
                            console.log('alert');
                            obj = {
                                text: String,
                                cardAddButton: [],
                                quickReplyButton: []
                            }
                            obj.text = bookmarkMessages[i].text;
                            obj.cardAddButton = responseMessageArray[i].data.cardAddButton;
                            obj.quickReplyButton = responseMessageArray[i].data.quickReplyButton;
                            responseMessageData.data = obj;
                            responseMessageData._id = bookmarkMessages[i]._id;
                            if (responseMessageData.data.text === undefined) {
                                console.log(loopCount);
                                console.log('crash:' + bookmarkMessages[i].text);
                                responseMessageData.data.text = bookmarkMessages[i].text;
                                responseArray.push(responseMessageData);
                            }
                            else {
                                responseArray.push(responseMessageData);
                            }
                        }
                        else {

                            responseMessageData._id = bookmarkMessages[i]._id;
                            responseArray.push(responseMessageData);
                        }
                    }

                    console.log(responseArray);
                    response.message = "Success";
                    response.code = 200;
                    response.data = responseArray;
                    res.json(response);

                });
            } else {
                response.message = "Success";
                response.code = 200;
                response.data = responseArray;
                res.json(response);
            }
        }
    });
});

bookmarkMessageRoute.post(function (req, res) {
    var date = new Date();
    var response = new Response();
    var bookmarkMessage = new BookmarkMessages();
    var _userId = req.body._userId;
    var _messageId = req.body._messageId;
    console.log(req.body.text);
    var textType = undefined;
    if (req.body.text !== undefined) {
        textType = 'text';
    }
    BookmarkMessages.find({ '_userId': _userId, '_messageId': _messageId, 'text': req.body.text }, null, { sort: { '_id': -1 } }, function (err, bookmarkMessages) {
        if (err) {
            res.send(err);
        }
        else {
            if (bookmarkMessages.length == 0) {
                console.log(textType);
                bookmarkMessage._userId = _userId;
                bookmarkMessage._messageId = _messageId;
                bookmarkMessage.createdOnUTC = date;
                bookmarkMessage.updatedOnUTC = date;
                bookmarkMessage.text = req.body.text;
                bookmarkMessage.type = textType;
                bookmarkMessage.isDeleted = false;
                bookmarkMessage.save(function (err) {
                    if (err) {

                    }
                    else {
                        console.log(bookmarkMessage);
                        response.message = "Success";
                        response.code = 200;
                        response.data = bookmarkMessage;
                        res.json(response);
                    }
                });
            }
            else {
                response.message = "Already bookmarked";
                response.code = 400;
                response.data = bookmarkMessage;
                res.json(response);
            }
        }
    });
});

module.exports = router;


