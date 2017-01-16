var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var UrlUtility = require('./../Utility/UrlUtility');
var TermsOfService = require('./../models/TermsOfService');
var Groups = require('./../models/Groups');
var Response = require('./../dto/APIResponse');
var fs = require('fs'),
    request = require('request');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('Hi I am a Customer Page');
});

var postTermsOfServiceRoute = router.route('/addTermsOfService');
var updateTermsOfService = router.route('/updateTermsOfService');
var getTermsOfService = router.route('/getTermsOfService');
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
getTermsOfService.get(function (req, res) {
    var response = new Response();
    TermsOfService.find({}, null, { sort: {} }, function (err, termsOfService) {
        if (err) {
            res.send(err);
        }
        else {
            response.data = termsOfService[0];
            response.message = "Success";
            response.code = 200;
            res.json(response);
        }
    });
});
updateTermsOfService.post(function (req, res) {
    var date = new Date();
    var response = new Response();
    var Id = req.body.Id;
    TermsOfService.findOne({ _id: Id }
        , function (err, termsOfService) {
            if (err)
                console.log(err);
            else {
                termsOfService.content = req.body.content;
                termsOfService.updatedOnUTC = date;
                termsOfService.save(function (err) {
                    response.data = termsOfService;
                    response.message = "Success";
                    response.code = 200;
                    res.json(response);
                });
            }
        });

});
postTermsOfServiceRoute.post(function (req, res) {
    var date = new Date();
    var response = new Response();
    var termsOfService = new TermsOfService();
    termsOfService.content = req.body.content;
    termsOfService.createdOnUTC = date;
    termsOfService.updatedOnUTC = date;
    termsOfService.isDeleted = false;
    termsOfService.save(function (err) {
        response.data = termsOfService;
        response.message = "Success";
        response.code = 200;
        res.json(response);
    });
})

module.exports = router;