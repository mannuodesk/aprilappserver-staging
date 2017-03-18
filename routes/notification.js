var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var UrlUtility = require('./../Utility/UrlUtility');
var Notification = require('./../models/Notification');
var UserNotification = require('./../models/UserNotification');
var Response = require('./../dto/APIResponse');
var User = require('./../models/User');
var azure = require('azure-sb');


var notificationHubService = azure.createNotificationHubService('april', 'Endpoint=sb://aprilapp.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=aJzhlQZZDQV7PGdrGf/yoUJW1P+3zf0xKSASIVPd2bQ=');



var fs = require('fs'),
    request = require('request');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('Hi I am a Customer Page');
});

var postNotificationRoute = router.route('/addNotification');
var updateNotification = router.route('/updateNotification');
var getNotification = router.route('/getNotifications');
var deleteNotification = router.route('/deleteNotification');
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
getNotification.get(function (req, res) {
    var response = new Response();
    var userId = req.query.userId;
    UserNotification.find({ '_userId': userId, 'isDeleted': false }, null, { sort: {} }, function (err, userNotifications) {
        if (err) {
            res.send(err);
        }
        else {
            response.data = userNotifications;
            response.message = "Success";
            response.code = 200;
            res.json(response);
        }
    }).populate('_notificationId');
});
updateNotification.get(function (req, res) {
    var date = new Date();
    var response = new Response();
    var userNotificationId = req.query.userNotificationId;
    UserNotification.findOne({ _id: userNotificationId }
        , function (err, userNotification) {
            if (err)
                console.log(err);
            else {
                userNotification.isRead = true;
                userNotification.save(function (err) {
                    response.data = userNotification;
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                });
            }
        });

});
postNotificationRoute.post(function (req, res) {
    var date = new Date();
    var response = new Response();
    var notification = new Notification();
    var userNotification = new UserNotification();
    notification.text = req.body.text;
    notification.createdOnUTC = date;
    notification.updatedOnUTC = date;
    notification.isDeleted = false;
    notification.save(function (err) {
        User.find({}, null, { sort: { '_id': -1 } }, function (err, users) {
            if (err) {
                res.send(err);
            }
            else {
                var count = 0;
                for (var i = 0; i < users.length; i++) {
                    date = new Date();
                    userNotification = new UserNotification();
                    userNotification._notificationId = notification._id;
                    userNotification._userId = users[i]._id;
                    userNotification.isRead = false;
                    userNotification.createdOnUTC = date;
                    userNotification.updatedOnUTC = date;
                    userNotification.isDeleted = false;
                    userNotification.save(function (err) {
                        count = count + 1;
                        if (i == count) {
                            var payload = {
                                alert: notification.text
                            };
                            notificationHubService.apns.send(null, payload, function (error) {
                                if (!error) {
                                    // notification sent
                                }
                            });
                            response.data = notification;
                            response.message = "Success";
                            response.code = 200;
                            res.json(response);
                        }
                    });
                }
            }
        });
    });
});
deleteNotification.get(function (req, res) {
    var response = new Response();
    var userNotificationId = req.query.userNotificationId;
    UserNotification.findOne({ _id: userNotificationId }
        , function (err, userNotification) {
            if (err)
                console.log(err);
            else {
                userNotification.isDeleted = true;
                userNotification.save(function (err) {
                    response.data = userNotification;
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                });
            }
        });

});
module.exports = router;