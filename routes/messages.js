var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var UrlUtility = require('./../Utility/UrlUtility');
var Response = require('./../dto/APIResponse');
var BookmarkMessages = require('./../models/BookmarkMessages');
var ConversationMessages = require('./../models/ConversationMessages');
var ResponseMessages = require('./../models/ResponseMessages');

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
chatHistoryRoute.get(function (req, res) {
    var response = new Response();
    var conversationId = req.params.conversationId;
    var conversationMessageId = req.params.conversationMessageId;
    var perPage = 20;
    ConversationMessages.find({ '_conversationId': conversationId }, null, { sort: { 'createdOnUTC': 'descending' } }, function (err, conversationMessages) {
        if (err) {
            res.send(err);
        }
        else {
            var array = [];
            for(var i = 0; i< conversationMessages.length;i++)
            {
                if(conversationMessages[i]._id == conversationMessageId)
                {
                    array = conversationMessages.slice(i+1, conversationMessages.length);
                }
            }
            if(array.length > 20)
            {
                array = array.slice(0, 19);
            }
            response.message = "Success";
            response.code = 200;
            response.data = array;
            res.json(response);
        }
    });
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
    var array = [];
    BookmarkMessages.find({ '_userId': _userId }, null, { sort: { '_id': -1 } }, function (err, bookmarkMessages) {
        if (err) {
            res.send(err);
        }
        else {
            var count = 0;
            if (bookmarkMessages.length != 0) {
                for (var i = 0; i < bookmarkMessages.length; i++) {
                    ResponseMessages.find({ '_id': bookmarkMessages[i]._messageId }, null, { sort: { '_id': -1 } }, function (err, bookmarkMessages) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            if (bookmarkMessages.length != 0) {
                                array.push(bookmarkMessages[0]);
                            }
                            count = count + 1;
                            if (count == i) {
                                response.message = "Success";
                                response.code = 200;
                                response.data = array;
                                res.json(response);
                            }
                        }
                    });
                }
            }
            else {
                response.message = "Success";
                response.code = 200;
                response.data = array;
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
    BookmarkMessages.find({ '_userId': _userId, '_messageId':messageId }, null, { sort: { '_id': -1 } }, function (err, bookmarkMessages) {
        if (err) {
            res.send(err);
        }
        else {
            if (bookmarkMessages.length == 0) {
                bookmarkMessage._userId = _userId;
                bookmarkMessage._messageId = _messageId;
                bookmarkMessage.createdOnUTC = date;
                bookmarkMessage.updatedOnUTC = date;
                bookmarkMessage.isDeleted = false;
                bookmarkMessage.save(function (err) {
                    if (err) {

                    }
                    else {
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


