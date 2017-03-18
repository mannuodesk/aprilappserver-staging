var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var UrlUtility = require('./../Utility/UrlUtility');
var Faqs = require('./../models/Faqs');
var Response = require('./../dto/APIResponse');
var fs = require('fs'),
    request = require('request');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('Hi I am a Customer Page');
});

var postFaqsRoute = router.route('/addFaqs');
var getAllFaqsRoute = router.route('/getAllFaqs');
var deletFaqsRoute = router.route('/deleteFaqs/:_faqsId');
var getFaqsContentRoute = router.route('/getFaqsContent/:_faqsId');
var updateFaqsContentRoute = router.route('/updateFaqsContent');
var updateFaqsTitleRoute = router.route('/updateFaqsTitle');
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
updateFaqsTitleRoute.post(function(req, res){
    var response = new Response();
    var faqsId = req.body._faqsId;
    var title = req.body.title;
    Faqs.findOne({ _id: faqsId })
        .exec(function (err, faqs) {
            if (err)
                res.send(err);
            else {
                if (faqs != null) {
                    faqs.title = title;
                    faqs.save(function (err) {
                        response.data = faqs;
                        response.message = "Success";
                        response.code = 200;
                        res.json(response);
                    });
                }
                else {
                    response.data = faqs;
                    response.message = "Failure: Not Found";
                    response.code = 400;
                    res.json(response);
                }
            }
        });
});
updateFaqsContentRoute.post(function (req, res) {
    var response = new Response();
    var faqsId = req.body._faqsId;
    var content = req.body.content;
    content = "<div style='font-family:open sans'>" + content + "</div>";
    console.log(content);
    var dire = new Faqs();
    Faqs.find({
        '_id': faqsId}, function(err, faqs) {
            if (!faqs) {

            }
            else {
                faqs[0].content = content;
                dire = faqs[0];

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
getFaqsContentRoute.get(function (req, res) {
    var response = new Response();
    var faqsId = req.params._faqsId;
    Faqs.findOne({ _id: faqsId })
        .exec(function (err, faqs) {
            if (err)
                res.send(err);
            else {
                if (faqs != null) {
                    response.message = "Success";
                    response.code = 200;
                    response.data = faqs;
                    res.json(response);
                }
                else {
                    response.message = "No Faqs Exists";
                    response.code = 400;
                    response.data = null;
                    res.json(response);
                }
            }
        });
});
deletFaqsRoute.get(function (req, res) {
    var response = new Response();
    var faqsId = req.params._faqsId;
    Faqs.findOne({ _id: faqsId })
        .exec(function (err, faqs) {
            if (err)
                res.send(err);
            else {
                if (faqs != null) {
                    faqs.remove();
                    response.message = "Success";
                    response.code = 200;
                    response.data = faqs;
                    res.json(response);
                }
                else {
                    response.message = "No Faqs Exists";
                    response.code = 400;
                    response.data = null;
                    res.json(response);
                }
            }
        });
});
getAllFaqsRoute.get(function (req, res) {
    var response = new Response();
    Faqs.find({}, null, {}, function (err, faqs) {
        if (err) {
            res.send(err);
        }
        else {
            response.data = faqs;
            response.code = 200;
            response.message = "Success";
            res.json(response);
        }
    });
});
postFaqsRoute.post(function (req, res) {
    var response = new Response();
    var faqs = new Faqs();
    var date = new Date();
    faqs.title = req.body.title;
    faqs.content = req.body.content;
    faqs.content = "<div style='font-family:open sans'>" + faqs.content + "</div>";
    faqs.createdOnUTC = date;
    faqs.updatedOnUTC = date;
    faqs.isDeleted = false;
    faqs.save(function (err) {
        response.data = faqs;
        response.code = 200;
        response.message = "Success";
        res.json(response);
    });
});

module.exports = router;