var app = require('express')();
var logger = require('morgan');
var express = require('express');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var routes = require('./routes/index');
var users = require('./routes/users');
//Socket Variables
var mongoose = require('mongoose');
var UrlUtility = require('./Utility/UrlUtility');
var ConversationRoom = require('./models/ConversationRoom');
var Conversation = require('./models/Conversation');
var ConversationMessages = require('./models/ConversationMessages');
var PhraseGroup = require('./models/PhraseGroup');
var Phrases = require('./models/Phrases');
var ResponseMessage = require('./models/ResponseMessages');
var Directory = require('./models/Directory');

//
var groups = require('./routes/groups');
var blocks = require('./routes/blocks');
var auto = require('./routes/auto');
var phrases = require('./routes/phrases');
var phrasegroup = require('./routes/phrasegroup');
var usercode = require('./routes/usercode');
var messages = require('./routes/messages');
var directory = require('./routes/directory');
var aboutapril = require('./routes/aboutapril');
var termsofservice = require('./routes/termsofservice');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var responsemessages = require('./routes/responsemessages');
var multer = require('multer');
server.listen(process.env.PORT);
//server.listen(80);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(multer({dest:'./public/images/'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.use('/', routes);
app.use('/users', users);
app.use('/groups', groups);
app.use('/blocks', blocks);
app.use('/phrases', phrases);
app.use('/usercode', usercode);
app.use('/responsemessage', responsemessages);
app.use('/phrasegroup', phrasegroup);
app.use('/messages', messages);
app.use('/auto', auto);
app.use('/directory', directory);
app.use('/aboutapril', aboutapril);
app.use('/termsofservice', termsofservice);





//Socket chat Content

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


var usernames = {};

var rooms = [];

io.sockets.on('connection', function (socket) {
    socket.on('adduser', function (data) {// IOS will send { id: 1, name: 'ali', _roomId = '', roomName='' }
        var conversation = new Conversation();
        var date = new Date();
        Conversation.findOne({ _user1Id: data.id, _user2Id: '586e3b264a030317e09feeb9' })
            .exec(function (err, conversationObject) {
                if (err) {
                    res.json(err);
                }
                else {
                    if (conversationObject == null) {
                        conversation._user1Id = data.id;
                        conversation._user2Id = "586e3b264a030317e09feeb9"
                        conversation.username1 = data.name;
                        conversation.username2 = "April App";
                        conversation._roomId = data._roomId;
                        conversation.createdOnUTC = date;
                        conversation.updatedOnUTC = date;
                        conversation.isDeleted = false;
                        conversation.save(function (err) {
                            if (err) {

                            }
                            else {
                                socket.username = data.name;
                                socket.room = data.roomName;
                                usernames[data.name] = data.name;
                                socket.join(data.roomName);
                                socket.emit('updatechat', 'SERVER', 'you have connected to ' + data.roomName);
                                socket.broadcast.to('Lobby').emit('updatechat', 'SERVER', data.name + ' has connected to this room');
                                socket.emit('updaterooms', rooms, data.roomName);
                                socket.emit('conversationId', conversation._id);
                                BotWelcomeMessage(data, date);
                            }
                        });
                    }
                    else {
                        socket.username = data.name;
                        socket.room = data.roomName;
                        usernames[data.name] = data.name;
                        socket.join(data.roomName);
                        socket.emit('updatechat', 'SERVER', 'you have connected to ' + data.roomName);
                        socket.broadcast.to('Lobby').emit('updatechat', 'SERVER', data.name + ' has connected to this room');
                        socket.emit('updaterooms', rooms, data.roomName);
                        socket.emit('conversationId', conversationObject._id);
                    }
                }
            });
    });

    socket.on('create', function (roomName) {//IOS will send Room Name
        function isBigEnough(roomName) {
            return roomName;
        }
        var flag = false;
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i] == roomName) {
                flag = true;
            }
        }
        if (flag === false) {
            rooms.push(roomName);
        }
        socket.room = roomName;
        socket.emit('updaterooms', rooms, socket.room);
    });

    var delay = 2000; //3 second
    var delay2 = 3000;
    socket.on('sendchat', function (data) {//IOS will send {'messageType':'', 'messageText':'', 'messageData':'', '_conversationId':'', '_messageFromUserId':'', messageTimeStamp:''}
        var conversationMessages = new ConversationMessages();
        var date = new Date();
        //When The user will send text Message    

        if (data.messageType == 'text') {
            var UserText = data.messageText;
            data.messageText = data.messageText.replace(/[^a-zA-Z ]/g, "");
            data.messageText = data.messageText.toLowerCase();
            conversationMessages.messageType = data.messageType;
            conversationMessages.messageText = UserText;
            conversationMessages._conversationId = data._conversationId;
            conversationMessages._messageToUserId = "585d029f61a3b603c493454f";
            conversationMessages._messageFromUserId = data._messageFromUserId;
            conversationMessages.createdOnUTC = date;
            conversationMessages.updatedOnUTC = date;
            conversationMessages.isDeleted = false;
            conversationMessages.save(function (err) {
                if (err) {

                }
                else {
                    var returnMessage = {
                        'messageText': UserText,
                        'messageTimeStamp': data.messageTimeStamp,
                        'name':data.name,
                        'conversationMessageId': conversationMessages._id
                    }
                    io.sockets["in"](socket.room).emit('UserMessage', returnMessage);
                    setTimeout(function () {
                        io.sockets["in"](socket.room).emit('typingstart', 'April App');

                        Phrases.find({ phraseText: { $regex: ".*" + data.messageText + ".*" } }, function (err, phrases) {
                            if (err) {
                                var res;
                                res.send(err);
                            }
                            else {
                                if (phrases.length != 0 && data.messageText != "") {
                                    ResponseMessage.find({ _blockId: phrases[0]._phraseGroupId._blockId }, null, { sort: { '_id': -1 } }, function (err, responseMessages) {
                                        if (err) {
                                            res.send(err);
                                        }
                                        else {
                                            if (responseMessages.length != 0) {
                                                responseMessages.sort(function (a, b) {
                                                    return a.order - b.order;
                                                });
                                                console.log(responseMessages)
                                                setTimeout(function () {
                                                    io.sockets["in"](socket.room).emit('typingend', 'April App');
                                                    var obj = {
                                                        'conversationMessageId': '',
                                                        'id': '',
                                                        'type': '',
                                                        'data': Object
                                                    }
                                                    for (var i = 0; i < responseMessages.length; i++) {
                                                        obj = {
                                                            'conversationMessageId': '',
                                                            'id': '',
                                                            'type': '',
                                                            'data': Object
                                                        }
                                                        obj.id = responseMessages[i]._id;
                                                        obj.type = responseMessages[i].type;
                                                        if (responseMessages[i].type == 'quickreply') {
                                                            obj.data = responseMessages[i].data;
                                                            BotSendingMessage(obj, data, date, -1);
                                                            break;
                                                        }
                                                        if (responseMessages[i].type == 'text') {
                                                            responseMessages[i].data.randomText.shift();
                                                            var randomNumber = Math.floor(Math.random() * responseMessages[i].data.randomText.length);
                                                            textType = {
                                                                'cardAddButton': responseMessages[i].data.cardAddButton,
                                                                'quickReplyButton': responseMessages[i].data.quickReplyButton,
                                                                'text': responseMessages[i].data.randomText[randomNumber].text
                                                            }
                                                            obj.data = textType;
                                                        }
                                                        else {
                                                            obj.data = responseMessages[i].data;
                                                        }
                                                        BotSendingMessage(obj, data, date, 0);
                                                    }
                                                }, delay2);


                                            }
                                            else {
                                                io.sockets["in"](socket.room).emit('typingend', 'April App');
                                                BotDefaultReply(data, date);
                                            }
                                        }
                                    });
                                }
                                else {
                                    io.sockets["in"](socket.room).emit('typingend', 'April App');
                                    BotDefaultReply(data, date);
                                }
                            }
                        }).populate('_phraseGroupId');
                    }, delay);
                }
            });
        }
        else {
            var UserText = data.messageText;
            conversationMessages.messageType = 'text';
            conversationMessages.messageText = UserText;
            conversationMessages._conversationId = data._conversationId;
            conversationMessages._messageToUserId = "585d029f61a3b603c493454f";
            conversationMessages._messageFromUserId = data._messageFromUserId;
            conversationMessages.createdOnUTC = date;
            conversationMessages.updatedOnUTC = date;
            conversationMessages.isDeleted = false;
            conversationMessages.save(function (err) {
                if (err) {

                }
                else {
                    var returnMessage = {
                        'messageText': UserText,
                        'messageTimeStamp': data.messageTimeStamp,
                        'name':data.name,
                        'conversationMessageId': conversationMessages._id
                    }
                    io.sockets["in"](socket.room).emit('UserMessage', returnMessage);
                    setTimeout(function () {
                        io.sockets["in"](socket.room).emit('typingstart', 'April App');

                        ResponseMessage.find({ _blockId: data.messageData }, null, { sort: { '_id': -1 } }, function (err, responseMessages) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                if (responseMessages.length != 0) {
                                    responseMessages.sort(function (a, b) {
                                        return a.order - b.order;
                                    });
                                    setTimeout(function () {
                                        io.sockets["in"](socket.room).emit('typingend', 'April App');
                                        var obj = {
                                            'conversationMessageId': '',
                                            'id': '',
                                            'type': '',
                                            'data': Object
                                        }
                                        for (var i = 0; i < responseMessages.length; i++) {
                                            obj = {
                                                'conversationMessageId': '',
                                                'id': '',
                                                'type': '',
                                                'data': Object
                                            }
                                            obj.id = responseMessages[i]._id;
                                            obj.type = responseMessages[i].type;
                                            if (responseMessages[i].type == 'quickreply') {
                                                obj.data = responseMessages[i].data;
                                                BotSendingMessage(obj, data, date, -1);
                                                break;
                                            }
                                            if (responseMessages[i].type == 'text') {
                                                responseMessages[i].data.randomText.shift();
                                                var randomNumber = Math.floor(Math.random() * responseMessages[i].data.randomText.length);
                                                textType = {
                                                    'cardAddButton': responseMessages[i].data.cardAddButton,
                                                    'quickReplyButton': responseMessages[i].data.quickReplyButton,
                                                    'text': responseMessages[i].data.randomText[randomNumber].text
                                                }
                                                obj.data = textType;
                                            }
                                            else {
                                                obj.data = responseMessages[i].data;
                                            }
                                            BotSendingMessage(obj, data, date, 0);
                                        }
                                    }, delay2);
                                }
                                else {
                                    io.sockets["in"](socket.room).emit('typingend', 'April App');
                                    BotDefaultReply(data, date);
                                }
                            }
                        });
                    }, delay);
                }
            });
        }
    });

    socket.on('switchRoom', function (newroom) {
        var oldroom;
        oldroom = socket.room;
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
        socket.broadcast.to(oldroom).emit('updatechat', 'SERVER', socket.username + ' has left this room');
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
        socket.emit('updaterooms', rooms, newroom);
    });
    socket.on('mnb', function () {
        console.log("Pong received from client");
    });
    socket.on('disconnect', function () {
        delete usernames[socket.username];
        io.sockets.emit('updateusers', usernames);
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });
    function BotSendingMessage(obj, data, date, type) {
        if (type == -1) {
            setTimeout(function () {
                io.sockets["in"](socket.room).emit('updatechat', 'April App', obj);
            }, 2000);
        }
        else {
            var conversationMessages2 = new ConversationMessages();
            conversationMessages2.messageType = "object";
            conversationMessages2.messageData = obj;
            conversationMessages2._conversationId = data._conversationId;
            conversationMessages2._messageToUserId = data._messageFromUserId;
            conversationMessages2._messageFromUserId = "585d029f61a3b603c493454f";
            conversationMessages2.createdOnUTC = date;
            conversationMessages2.updatedOnUTC = date;
            conversationMessages2.isDeleted = false;
            conversationMessages2.save(function (err) {
                if (err) {

                }
                else {
                    obj.conversationMessageId = conversationMessages2._id;
                    io.sockets["in"](socket.room).emit('updatechat', 'April App', obj);
                }
            });
        }
    }
    function BotDefaultReply(data, date) {
        ResponseMessage.find({ _blockId: '586ea566085bbe2f4ca49d8d' }, null, { sort: { '_id': -1 } }, function (err, responseMessages) {
            if (err) {
                res.send(err);
            }
            else {
                if (responseMessages.length != 0) {
                    io.sockets["in"](socket.room).emit('typingend', 'April App');
                    var obj = {
                        'id': '',
                        'type': '',
                        'data': Object
                    }
                    for (var i = 0; i < responseMessages.length; i++) {
                        obj = {
                            'id': '',
                            'type': '',
                            'data': Object
                        }
                        obj.id = responseMessages[i]._id;
                        obj.type = responseMessages[i].type;
                        if (responseMessages[i].type == 'text') {
                            responseMessages[i].data.randomText.shift();
                            var randomNumber = Math.floor(Math.random() * responseMessages[i].data.randomText.length);
                            textType = {
                                'cardAddButton': responseMessages[i].data.cardAddButton,
                                'quickReplyButton': responseMessages[i].data.quickReplyButton,
                                'text': responseMessages[i].data.randomText[randomNumber].text
                            }
                            obj.data = textType;
                        }
                        else {
                            obj.data = responseMessages[i].data;
                        }
                        BotSendingMessage(obj, data, date);
                    }
                }
            }
        });
    }
    function BotWelcomeMessage(data, date) {
        ResponseMessage.find({ _blockId: '586ea566085bbe2f4ca49d8b' }, null, { sort: { '_id': -1 } }, function (err, responseMessages) {
            if (err) {
                res.send(err);
            }
            else {
                if (responseMessages.length != 0) {
                    io.sockets["in"](socket.room).emit('typingend', 'April App');
                    var obj = {
                        'id': '',
                        'type': '',
                        'data': Object
                    }
                    for (var i = 0; i < responseMessages.length; i++) {
                        obj = {
                            'id': '',
                            'type': '',
                            'data': Object
                        }
                        obj.id = responseMessages[i]._id;
                        obj.type = responseMessages[i].type;
                        if (responseMessages[i].type == 'text') {
                            responseMessages[i].data.randomText.shift();
                            var randomNumber = Math.floor(Math.random() * responseMessages[i].data.randomText.length);
                            textType = {
                                'cardAddButton': responseMessages[i].data.cardAddButton,
                                'quickReplyButton': responseMessages[i].data.quickReplyButton,
                                'text': responseMessages[i].data.randomText[randomNumber].text
                            }
                            obj.data = textType;
                        }
                        else {
                            obj.data = responseMessages[i].data;
                        }
                        BotSendingMessage(obj, data, date);
                    }
                }
            }
        });
    }
});
function sendHeartbeat() {
    io.sockets.emit('ping', { beat: 1 });
    setTimeout(sendHeartbeat, 2000);
}

setTimeout(sendHeartbeat, 2000);