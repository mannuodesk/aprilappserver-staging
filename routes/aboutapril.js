var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var UrlUtility = require('./../Utility/UrlUtility');
var AboutApril = require('./../models/AboutApril');
var Groups = require('./../models/Groups');
var Response = require('./../dto/APIResponse');
var fs = require('fs'),
    request = require('request');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('Hi I am a Customer Page');
});

var postAboutAprilRoute = router.route('/addAboutApril');
var updateAboutApril = router.route('/updateAboutApril');
var getAboutApril = router.route('/getAboutApril');
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
getAboutApril.get(function(req, res){
    var response = new Response();
    AboutApril.find({  }, null, { sort: { } }, function (err, aboutApril) {
        if (err) {
            res.send(err);
        }
        else {
            response.data = aboutApril;
            response.message = "Success";
            response.code = 200;
            res.json(response);
        }
    });
});
updateAboutApril.post(function(req, res){
    var date = new Date();
    var response = new Response();
    var aboutApril = new AboutApril();
    aboutApril.content = req.body.content;
    aboutApril.createdOnUTC = date;
    aboutApril.updatedOnUTC = date;
    aboutApril.isDeleted = false;
    aboutApril.save(function (err) {
        response.data = aboutApril;
        response.message = "Success";
        response.code = 200;
        res.json(response);
    });
});
postAboutAprilRoute.post(function (req, res) {
    var date = new Date();
    var response = new Response();
    var aboutApril = new AboutApril();
    aboutApril.content = req.body.content;
    aboutApril.createdOnUTC = date;
    aboutApril.updatedOnUTC = date;
    aboutApril.isDeleted = false;
    aboutApril.save(function (err) {
        response.data = aboutApril;
        response.message = "Success";
        response.code = 200;
        res.json(response);
    });
})

module.exports = router;