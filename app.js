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
//
var groups = require('./routes/groups');
var blocks = require('./routes/blocks');
var phrases = require('./routes/phrases');
var phrasegroup = require('./routes/phrasegroup');
var usercode = require('./routes/usercode');
var messages = require('./routes/messages');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var responsemessages = require('./routes/responsemessages');
var multer = require('multer');
server.listen(process.env.PORT);
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
        Conversation.findOne({ _user1Id: data.id, _user2Id: '5863716bbacb4910e0fbf8a2' })
            .exec(function (err, conversationObject) {
                if (err) {
                    res.json(err);
                }
                else {
                    if (conversationObject == null) {
                        conversation._user1Id = data.id;
                        conversation._user2Id = "5863716bbacb4910e0fbf8a2"
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
                        socket.emit('conversationId', conversation._id);
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
    socket.on('sendchat', function (data) {//IOS will send {'messageType':'', 'messageText':'', 'messageData':'', '_conversationId':'', '_messageFromUserId':''}
        var conversationMessages = new ConversationMessages();
        var date = new Date();
        //When The user will send text Message    
        if (data.messageType == 'text') {
            data.messageText = data.messageText.replace(/[^a-zA-Z ]/g, "");
            data.messageText = data.messageText.toLowerCase();
            conversationMessages.messageType = data.messageType;
            conversationMessages.messageText = data.messageText;
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
                    setTimeout(function () {
                        io.sockets["in"](socket.room).emit('typingstart', 'April App');
                    }, delay);
                    Phrases.find({ phraseText: { $regex: ".*" + data.messageText + ".*" } }, function (err, phrases) {
                        if (err) {
                            var res;
                            res.send(err);
                        }
                        else {
                            if (phrases.length != 0) {
                                ResponseMessage.find({ _blockId: phrases[0]._phraseGroupId._blockId }, null, { sort: { '_id': -1 } }, function (err, responseMessages) {
                                    if (err) {
                                        res.send(err);
                                    }
                                    else {
                                        if (responseMessages.length != 0) {
                                            var conversationMessages2 = new ConversationMessages();
                                            conversationMessages2.messageType = "object";
                                            conversationMessages2.messageData = responseMessages;
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
                                                    console.log(responseMessages);
                                                    setTimeout(function () {
                                                        io.sockets["in"](socket.room).emit('typingend', 'April App');
                                                        var randomNumber = Math.floor(Math.random() * responseMessages.length);
                                                        var obj = {
                                                            'type': '',
                                                            'data': Object
                                                        }
                                                        for (var i = 0; i < responseMessages.length; i++) {
                                                            obj = {
                                                                'type': '',
                                                                'data': Object
                                                            }
                                                            obj.type = responseMessages[i].type;
                                                            obj.data = responseMessages[i].data;
                                                            io.sockets["in"](socket.room).emit('updatechat', 'April App', obj);
                                                        }
                                                    }, delay2);

                                                }
                                            });
                                        }
                                        else {
                                            var conversationMessages2 = new ConversationMessages();
                                            conversationMessages2.messageText = "text";
                                            conversationMessages2.messageData = 'Dont Know';
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
                                                    setTimeout(function () {
                                                        io.sockets["in"](socket.room).emit('typingend', 'April App');
                                                        io.sockets["in"](socket.room).emit('updatechat', 'April App', 'Dont Know');
                                                    }, delay2);
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                            else {
                                var conversationMessages2 = new ConversationMessages();
                                conversationMessages2.messageText = "text";
                                conversationMessages2.messageData = 'Dont Know';
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
                                        setTimeout(function () {
                                            io.sockets["in"](socket.room).emit('typingend', 'April App');
                                            io.sockets["in"](socket.room).emit('updatechat', 'April App', 'Dont Know');
                                        }, delay2);
                                    }
                                });
                            }
                        }
                    }).populate('_phraseGroupId');
                }
            });
        }
        else {
            conversationMessages.messageType = data.messageType;
            conversationMessages.messageText = data.messageText;
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
                    setTimeout(function () {
                        io.sockets["in"](socket.room).emit('typingstart', 'April App');
                    }, delay);
                    ResponseMessage.find({ _blockId: data.messageData }, null, { sort: { '_id': -1 } }, function (err, responseMessages) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            if (responseMessages.length != 0) {
                                var conversationMessages2 = new ConversationMessages();
                                conversationMessages2.messageType = "object";
                                conversationMessages2.messageData = responseMessages;
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
                                        console.log(responseMessages);
                                        setTimeout(function () {
                                            io.sockets["in"](socket.room).emit('typingend', 'April App');
                                            var randomNumber = Math.floor(Math.random() * responseMessages.length);
                                            var obj = {
                                                'type': '',
                                                'data': Object
                                            }
                                            for (var i = 0; i < responseMessages.length; i++) {
                                                obj = {
                                                    'type': '',
                                                    'data': Object
                                                }
                                                obj.type = responseMessages[i].type;
                                                obj.data = responseMessages[i].data;
                                                io.sockets["in"](socket.room).emit('updatechat', 'April App', obj);
                                            }
                                        }, delay2);

                                    }
                                });
                            }
                            else {
                                var conversationMessages2 = new ConversationMessages();
                                conversationMessages2.messageText = "text";
                                conversationMessages2.messageData = 'Dont Know';
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
                                        setTimeout(function () {
                                            io.sockets["in"](socket.room).emit('typingend', 'April App');
                                            io.sockets["in"](socket.room).emit('updatechat', 'April App', 'Dont Know');
                                        }, delay2);
                                    }
                                });
                            }
                        }
                    });
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

    socket.on('disconnect', function () {
        delete usernames[socket.username];
        io.sockets.emit('updateusers', usernames);
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });
});
