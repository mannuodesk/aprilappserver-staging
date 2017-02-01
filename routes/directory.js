var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var UrlUtility = require('./../Utility/UrlUtility');
var Directory = require('./../models/Directory');
var Response = require('./../dto/APIResponse');
var fs = require('fs'),
    request = require('request');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('Hi I am a Customer Page');
});

var postDirectoryRoute = router.route('/addDirectory');
var getAllDirectoryRoute = router.route('/getAllDirectory');
var deletDirectoryRoute = router.route('/deleteDirectory/:_directoryId');
var getDirectoryContentRoute = router.route('/getDirectoryContent/:_directoryId');
var updateDirectoryContentRoute = router.route('/updateDirectoryContent');
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
updateDirectoryContentRoute.post(function (req, res) {
    var response = new Response();
    var directoryId = req.body._directoryId;
    var content = req.body.content;
    console.log(content);
    var dire = new Directory();
    Directory.find({
        '_id': directoryId}, function(err, directory) {
            if (!directory) {

            }
            else {
                directory[0].content = content;
                dire = directory[0];

                dire.save(function (err) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        response.data = dire;
                        response.message = "Success";
                        response.code = 200;
                        res.json(response);
                        console.log('done');
                    }

                });
            }
        });

});
getDirectoryContentRoute.get(function (req, res) {
    var response = new Response();
    var directoryId = req.params._directoryId;
    Directory.findOne({ _id: directoryId })
        .exec(function (err, directory) {
            if (err)
                res.send(err);
            else {
                if (directory != null) {
                    response.message = "Success";
                    response.code = 200;
                    response.data = directory;
                    res.json(response);
                }
                else {
                    response.message = "No Directory Exists";
                    response.code = 400;
                    response.data = null;
                    res.json(response);
                }
            }
        });
});
deletDirectoryRoute.get(function (req, res) {
    var response = new Response();
    var directoryId = req.params._directoryId;
    Directory.findOne({ _id: directoryId })
        .exec(function (err, directory) {
            if (err)
                res.send(err);
            else {
                if (directory != null) {
                    directory.remove();
                    response.message = "Success";
                    response.code = 200;
                    response.data = directory;
                    res.json(response);
                }
                else {
                    response.message = "No Directory Exists";
                    response.code = 400;
                    response.data = null;
                    res.json(response);
                }
            }
        });
});
getAllDirectoryRoute.get(function (req, res) {
    var response = new Response();
    Directory.find({}, null, {sort:'title'}, function (err, directories) {
        if (err) {
            res.send(err);
        }
        else {
            response.data = directories;
            response.code = 200;
            response.message = "Success";
            res.json(response);
        }
    });
});
postDirectoryRoute.post(function (req, res) {
    var response = new Response();
    var directory = new Directory();
    var date = new Date();
    directory.title = req.body.title;
    directory.content = req.body.content;
    directory.createdOnUTC = date;
    directory.updatedOnUTC = date;
    directory.isDeleted = false;
    directory.save(function (err) {
        response.data = directory;
        response.code = 200;
        response.message = "Success";
        res.json(response);
    });
});

module.exports = router;