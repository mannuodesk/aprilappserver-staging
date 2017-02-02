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
var events = require('events');
var EventEmitter = events.EventEmitter;
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
var faqs = require('./routes/faqs');
var termsofservice = require('./routes/termsofservice');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var responsemessages = require('./routes/responsemessages');
var responsemessagesroute = require('./routes/responsemessagesroute');
var multer = require('multer');
//server.listen(process.env.PORT);
server.listen(80);
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
app.use('/faqs', faqs);
app.use('/responsemessagesroute', responsemessagesroute);




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
    var pendingArray = [];
    var blockIncomingMessage = false;
    var pendingArrayCounter = 0;
    var queueController = new EventEmitter()
    socket.on('sendchat', function (incomingData) {//IOS will send {'messageType':'', 'messageText':'', 'messageData':'', '_conversationId':'', '_messageFromUserId':'', messageTimeStamp:''}
        pendingArray.push(incomingData);
        console.log(blockIncomingMessage);
        if (blockIncomingMessage == false) {
            SendChat();
        }
    });

    function SendChat() {
        var flowController = new EventEmitter();
        var responseMessageArray = [];
        var conversationMessages = new ConversationMessages();
        var date = new Date();
        if (pendingArray.length == 0) {
            return;
        }
        if (blockIncomingMessage == false) {
            var data = pendingArray[0];
            blockIncomingMessage = true;
            responseMessageArray = [];
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
                            'name': data.name,
                            'conversationMessageId': conversationMessages._id
                        }
                        io.sockets["in"](socket.room).emit('UserMessage', returnMessage);
                        setTimeout(function () {
                            io.sockets["in"](socket.room).emit('typingstart', 'April App');
                            //$regex: ".*" + data.messageText + ".*" 
                            Phrases.find({ phraseText: { $regex: ".*" + data.messageText + ".*" } }, function (err, phrases) {
                                if (err) {
                                    var res;
                                    res.send(err);
                                }
                                else {
                                    if (phrases.length != 0 && data.messageText != "") {//check for no phrase
                                        if (phrases[0]._phraseGroupId != null) {//check for no phrase Group associated with phrase
                                            if (phrases[0]._phraseGroupId.phraseGroupType == 'block') {//Check for Type Block
                                                var phraseGroupObj = phrases[0]._phraseGroupId;
                                                var counter = 0;
                                                flowController.on('multipleblockdoWork', function (b) {//loop for MultipleBlocks
                                                    console.log(b);
                                                    if (b >= phraseGroupObj._blockId.length) {
                                                        flowController.emit('blockfinished');
                                                        return;
                                                    }
                                                    var _blockIdArrayValue = phraseGroupObj._blockId[b];
                                                    ResponseMessage.find({ _blockId: _blockIdArrayValue._blockId }, null, { sort: { '_id': -1 } }, function (err, responseMessages) {
                                                        if (err) {
                                                            res.send(err);
                                                        }
                                                        else {
                                                            if (responseMessages.length != 0) {
                                                                //counter = counter + 1;
                                                                responseMessages.sort(function (a, b) {
                                                                    return a.order - b.order;
                                                                });
                                                                var obj = {
                                                                    'conversationMessageId': '',
                                                                    'id': '',
                                                                    'type': '',
                                                                    'data': Object
                                                                }

                                                                for (var i = 0; i < responseMessages.length; i++) {
                                                                    if (responseMessages[i].isCompleted == true) {
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
                                                                            //BotSendingMessage(obj, data, date, -1);
                                                                            //break;
                                                                        }
                                                                        if (responseMessages[i].type == 'singletext') {
                                                                            singletextType = {
                                                                                'cardAddButton': responseMessages[i].data.cardAddButton,
                                                                                'quickReplyButton': responseMessages[i].data.quickReplyButton,
                                                                                'text': responseMessages[i].data.text
                                                                            }
                                                                            obj.type = 'text';
                                                                            obj.data = singletextType;
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
                                                                        responseMessageArray.push(obj);
                                                                    }

                                                                }
                                                                flowController.emit('multipleblockdoWork', b + 1);

                                                            }

                                                            /*if (phraseGroupObj._blockId.length == counter) {
                                                                BotSendingMessageArray(responseMessageArray, data);
                                                            }*/
                                                        }

                                                    });
                                                });
                                                
                                                //Start of EventEmitter
                                                flowController.emit('multipleblockdoWork', 0);
                                                flowController.on('blockfinished', function () {
                                                    BotSendingMessageArray(responseMessageArray, data);
                                                    console.log('Multiple Block finished');
                                                });

                                            }
                                            else {
                                                if (phrases[0]._phraseGroupId.textArray.length != 0) {
                                                    var randomNumber = Math.floor(Math.random() * phrases[0]._phraseGroupId.textArray.length);
                                                    var obj = {
                                                        'conversationMessageId': '',
                                                        'id': '',
                                                        'type': '',
                                                        'data': Object
                                                    }
                                                    obj.type = 'text';
                                                    phraseGroupText = {
                                                        'cardAddButton': [],
                                                        'quickReplyButton': [],
                                                        'text': phrases[0]._phraseGroupId.textArray[randomNumber]
                                                    }//Bogus Logic
                                                    obj.id = phrases[0]._phraseGroupId._id;
                                                    obj.data = phraseGroupText;
                                                    responseMessageArray.push(obj);
                                                    BotSendingMessageArray(responseMessageArray, data);
                                                }
                                                else {
                                                    io.sockets["in"](socket.room).emit('typingend', 'April App');
                                                    BotDefaultReply(data, date);
                                                }
                                            }
                                        }
                                        else {
                                            io.sockets["in"](socket.room).emit('typingend', 'April App');
                                            BotDefaultReply(data, date);
                                        }
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
                            'name': data.name,
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
                                        //counter = counter + 1;
                                        responseMessages.sort(function (a, b) {
                                            return a.order - b.order;
                                        });
                                        var obj = {
                                            'conversationMessageId': '',
                                            'id': '',
                                            'type': '',
                                            'data': Object
                                        }

                                        for (var i = 0; i < responseMessages.length; i++) {
                                            if (responseMessages[i].isCompleted == true) {
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
                                                    //BotSendingMessage(obj, data, date, -1);
                                                    //break;
                                                }
                                                if (responseMessages[i].type == 'singletext') {
                                                    singletextType = {
                                                        'cardAddButton': responseMessages[i].data.cardAddButton,
                                                        'quickReplyButton': responseMessages[i].data.quickReplyButton,
                                                        'text': responseMessages[i].data.text
                                                    }
                                                    obj.type = 'text';
                                                    obj.data = singletextType;
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
                                                responseMessageArray.push(obj);
                                            }
                                        }
                                        BotSendingMessageArray(responseMessageArray, data)
                                        //flowController.emit('multipleblockdoWork', b + 1);

                                    }

                                    /*if (phraseGroupObj._blockId.length == counter) {
                                        BotSendingMessageArray(responseMessageArray, data);
                                    }*/
                                }

                            });
                        }, delay);
                    }
                });
            }
        }
        else {
            queueController.emit('pendingArrayfinished');
            return;
            console.log("pending");
        }
    }


    function BotSendingMessageArray(objArray, data) {

        var arrayController = new EventEmitter();
        arrayController.on('arraydoWork', function (i) {
            date = new Date();
            if (i >= objArray.length) {
                arrayController.emit('arrayfinished');
                return;
            }
            if (objArray[i].type == "quickreply") {
                io.sockets["in"](socket.room).emit('typingend', 'April App');
                io.sockets["in"](socket.room).emit('updatechat', 'April App', objArray[i]);
                arrayController.emit('arrayfinished');
                return;
            }
            var conversationMessages2 = new ConversationMessages();
            conversationMessages2.messageType = "object";
            conversationMessages2.messageData = objArray[i];
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
                    objArray[i].conversationMessageId = conversationMessages2._id;
                    io.sockets["in"](socket.room).emit('updatechat', 'April App', objArray[i]);
                    arrayController.emit('arraydoWork', i + 1);
                    }, 1000);
                }
            });

        });
        arrayController.emit('arraydoWork', 0);
        arrayController.on('arrayfinished', function () {
            blockIncomingMessage = false;
            pendingArray.shift();
            console.log("Array finished");
            SendChat();
            //queueController.emit('pendingArrayFlow', 0);
        });

    }

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
        date = new Date();
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
        var array = [];
        date = new Date();
        ResponseMessage.find({ _blockId: '586ea566085bbe2f4ca49d8d' }, null, { sort: { '_id': -1 } }, function (err, responseMessages) {
            if (err) {
                res.send(err);
            }
            else {
                if (responseMessages.length != 0) {
                    //io.sockets["in"](socket.room).emit('typingend', 'April App');
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
                        array.push(obj);
                    }

                    BotSendingMessageArray(array, data);
                }
            }
        });
    }
    function BotWelcomeMessage(data, date) {
        date = new Date();
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