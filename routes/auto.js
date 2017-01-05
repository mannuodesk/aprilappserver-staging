var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var UrlUtility = require('./../Utility/UrlUtility');
var Block = require('./../models/Block');
var Groups = require('./../models/Groups');
var Response = require('./../dto/APIResponse');
var fs = require('fs'),
    request = require('request');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('Hi I am a Customer Page');
});

var postBlockRoute = router.route('/addStaticData');
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

postBlockRoute.get(function (req, res) {
    var group = new Groups();
    var date = new Date();
    var response = new Response();
    var block1 = new Block();
    var block2 = new Block();
    var block3 = new Block();
    group.isDeleted = false;
    group.isLocked = true;
    group.updatedOnUTC = date;
    group.createdOnUTC = date;
    group.type = "Generic";
    group.description = "Generic Default Group";
    group.order = 1;
    group.name = "Built-In Group"
    group.save(function (err) {
        if (err) {

        }
        else {
            block1._groupId = group._id;
            block1.isDeleted = false;
            block1.isLocked = true;
            block1.updatedOnUTC = date;
            block1.createdOnUTC = date;
            block1.type = "Generic";
            block1.description = "Welcome Block";
            block1.order = 0;
            block1.name = "Welcome Block";
            block1.save(function (err) {

            });
            block2._groupId = group._id;
            block2.isDeleted = false;
            block2.isLocked = true;
            block2.updatedOnUTC = date;
            block2.createdOnUTC = date;
            block2.type = "Generic";
            block2.description = "Main Block";
            block2.order = 0;
            block2.name = "Main Block";
            block2.save(function (err) {

            });
            block3._groupId = group._id;
            block3.isDeleted = false;
            block3.isLocked = true;
            block3.updatedOnUTC = date;
            block3.createdOnUTC = date;
            block3.type = "Generic";
            block3.description = "Ending Block";
            block3.order = 0;
            block3.name = "Ending Block";
            block3.save(function (err) {

            });
            response.data = group;
            response.message = "Success";
            response.code = 200;
            res.json(response);
        }
    });
})

module.exports = router;