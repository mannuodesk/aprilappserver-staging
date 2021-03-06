var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Phrases = require('./../models/Phrases');
var UrlUtility = require('./../Utility/UrlUtility');
var Response = require('./../dto/APIResponse');
var PhraseGroup = require('./../models/PhraseGroup');
var Block = require('./../models/Block');
var events = require('events');
var EventEmitter = events.EventEmitter;
//GET home page. 
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

var postPhrasesRoute = router.route('/addPhrase');
var getAllPhrasesRoute = router.route('/getAllphrases');
var deletePhrasesRoute = router.route('/deletePhrases/:_phraseId');
var updatePhraseRoute = router.route('/updatePhrase')
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
deletePhrasesRoute.get(function (req, res) {
    var _phraseId = req.params._phraseId;
    var response = new Response();
    Phrases.findOne({ _id: _phraseId }
        , function (err, phrase) {
            if (err)
                console.log(err);
            else {
                phrase.remove();
                response.message = "Success";
                response.code = 200;
                res.json(response);
            }
        });
});
updatePhraseRoute.post(function (req, res) {
    // Create a new instance of the Beer model
    var response = new Response();
    var date = new Date();
    // Set the beer properties that came from the POST data

    Phrases.findOne({ _id: req.body.phraseId })
        .exec(function (err, phrases) {
            if (err)
                res.send(err);
            else {
                var phrase = req.body.phraseText;
                phrase = phrase.replace(/[^a-zA-Z ]/g, "");
                phrases.phraseText = phrase.toLowerCase();
                phrases.phrase = req.body.phraseText;
                console.log(phrases);
                // Save the beer and check for errors
                phrases.save(function (err) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        response.data = phrases;
                        response.message = "Success";
                        response.code = 200;
                        res.json(response);
                        console.log('done');
                    }
                });
            }
        });
});
postPhrasesRoute.post(function (req, res) {
    // Create a new instance of the Beer model
    var phrases = new Phrases();
    var response = new Response();
    var date = new Date();
    // Set the beer properties that came from the POST data
    var phrase = req.body.phraseText;
    phrase = phrase.replace(/[^a-zA-Z ]/g, "");
    phrase = phrase.trim();
    phrases.phraseText = phrase.toLowerCase();

    phrases.phrase = req.body.phraseText;
    phrases._phraseGroupId = req.body._phraseGroupId;
    phrases.createdOnUTC = date;
    phrases.updatedOnUTC = date;
    phrases.isDeleted = false;
    console.log(phrases);
    // Save the beer and check for errors
    phrases.save(function (err) {
        if (err) {
            res.send(err);
        }
        else {
            response.data = phrases;
            response.message = "Success";
            response.code = 200;
            res.json(response);
            console.log('done');
        }
    });
});

getAllPhrasesRoute.get(function (req, res) {
    // Create a new instance of the Beer model
    var response = new Response();
    var flowController = new EventEmitter();
    var groupsArray = [];
    var array = [];
    var groupsBlockDto = {
        'phraseGroup': PhraseGroup,
        'phrases': [],
        'block': Block
    };
    PhraseGroup.find({}, null, { sort: { '_id': -1 } }, function (err, PhraseGroups) {
        if (err) {
            res.send(err);
        }
        else {
            if (PhraseGroups.length == 0) {
                response.message = "Failure";
                response.code = 400;
                res.json(response);
            }
            flowController.on('doWork', function (i) {
                if (i >= PhraseGroups.length) {
                    flowController.emit('finished');
                    return;
                }
                groupsBlockDto = {
                    'phraseGroup': PhraseGroup,
                    'phrases': [],
                    'block': Block
                };
                groupsBlockDto.phraseGroup = PhraseGroups[i];
                var phraseGroupsId = PhraseGroups[i]._id;
                console.log(phraseGroupsId);
                
                Phrases.find({ _phraseGroupId: phraseGroupsId }, function (err, phrases) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        console.log(phrases);
                        if (phrases.length != 0) {
                            groupsBlockDto.phrases = phrases;
                        }
                        else {
                            groupsBlockDto.phrases = [];
                        }
                        array.push(groupsBlockDto);
                        flowController.emit('doWork', i + 1);
                    }
                });

            });
            flowController.emit('doWork', 0);
            flowController.on('finished', function () {
                response.message = "Success";
                response.code = 200;
                response.data = array;
                res.json(response);
            });

        }
    });
});
module.exports = router;