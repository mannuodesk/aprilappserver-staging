var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var UrlUtility = require('./../Utility/UrlUtility');
var Response = require('./../dto/APIResponse');
var PhraseGroup = require('./../models/PhraseGroup');
var Block = require('./../models/Block');

var fs = require('fs'),
    request = require('request');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('Hi I am a Customer Page');
});

var postPhraseGroupRoute = router.route('/addPhraseGroup');
var getAllPhraseGroups = router.route('/getAllPhraseGroups');
var updatePhraseGroup = router.route('/updatePhraseGroup');
var deletePhraseGroup = router.route('/deletePhraseGroup/:_phraseGroupId');
var addTextBoxPhraseGroup = router.route('/addTextBoxPhraseGroup/:_phraseGroupId');
var editTextBoxPhraseGroup = router.route('/editTextBoxPhraseGroup/:_phraseGroupId/:indexId/:text');
var deleteTextBoxPhraseGroup = router.route('/deleteTextBoxPhraseGroup/:_phraseGroupId/:indexId');
var changePhraseGroupType = router.route('/changePhraseGroup/:_phraseGroupId/:type');
var deletePhraseGroupBlock = router.route('/deletePhraseGroupBlock/:_phraseGroupId/:_blockIndexId');
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
deleteTextBoxPhraseGroup.get(function (req, res) {
    var response = new Response();
    var phraseGroupId = req.params._phraseGroupId;
    var indexId = req.params.indexId;
    var phraseGroup = new PhraseGroup();
    PhraseGroup.find({ '_id': req.params._phraseGroupId }, function (err, phraseGroup2) {
        if (!phraseGroup2) {

        }
        else {
            phraseGroup = phraseGroup2[0];
            phraseGroup.textArray.splice(indexId, 1);
            phraseGroup.markModified('anything');
            phraseGroup.save(function (err) {
                console.log(phraseGroup);
                response.data = phraseGroup;
                response.message = "Success";
                response.code = 200;
                res.json(response);
            });
        }
    });
});
editTextBoxPhraseGroup.get(function (req, res) {
    var response = new Response();
    var phraseGroupId = req.params._phraseGroupId;
    var indexId = req.params.indexId;
    var text = req.params.text;
    var phraseGroup = new PhraseGroup();
    PhraseGroup.find({ '_id': req.params._phraseGroupId }, function (err, phraseGroup2) {
        if (!phraseGroup2) {

        }
        else {
            phraseGroup = phraseGroup2[0];
            phraseGroup.textArray.set(indexId, text);
            //phraseGroup.textArray[indexId] = text;
            console.log(phraseGroup.textArray);
            phraseGroup.markModified('anything');
            phraseGroup.save(function (err) {
                console.log(phraseGroup);
                response.data = phraseGroup;
                response.message = "Success";
                response.code = 200;
                res.json(response);
            });
        }
    });
});
changePhraseGroupType.get(function (req, res) {
    var phraseGroupId = req.params._phraseGroupId;
    var type = req.params.type;
    var phraseGroup = new PhraseGroup();
    var response = new Response();
    PhraseGroup.find({ '_id': req.params._phraseGroupId }, function (err, phraseGroup2) {
        if (!phraseGroup2) {

        }
        else {
            phraseGroup = phraseGroup2[0];
            console.log(type);
            phraseGroup.phraseGroupType = type;
            phraseGroup.save(function (err) {
                response.data = phraseGroup;
                response.message = "Success";
                response.code = 200;
                res.json(response);
            });
        }
    });
});
deletePhraseGroup.get(function (req, res) {
    var response = new Response();
    var _phraseGroupId = req.params._phraseGroupId;
    PhraseGroup.findOne({ _id: _phraseGroupId }
        , function (err, phraseGroup) {
            if (err)
                console.log(err);
            else {
                phraseGroup.remove();
                response.message = "Success";
                response.code = 200;
                res.json(response);
            }
        });
})
deletePhraseGroupBlock.get(function (req, res) {
    var phraseGroup = new PhraseGroup();
    var response = new Response();
    var _phraseGroupId = req.params._phraseGroupId;
    var _blockIndexId = req.params._blockIndexId;
    PhraseGroup.findOne({ _id: _phraseGroupId }
        , function (err, phraseGroup) {
            if (err)
                console.log(err);
            else {
                if (phraseGroup != null) {
                    phraseGroup._blockId.splice(_blockIndexId, 1);
                    phraseGroup.save(function (err) {
                        response.message = "Success";
                        response.code = 200;
                        res.json(response);
                    });

                }
                else {
                    response.message = "Failure";
                    response.code = 400;
                    res.json(response);
                }
            }
        });
});
updatePhraseGroup.post(function (req, res) {
    var phraseGroup = new PhraseGroup();
    var response = new Response();
    var date = new Date();
    var obj = {
        '_blockId': String,
        'blockName': String
    }
    PhraseGroup.find({ '_id': req.body._phraseGroupId }, function (err, phraseGroup2) {
        if (!phraseGroup2) {

        }
        else {
            Block.find({ _id: req.body._blockId }, null, { sort: { '_id': -1 } }, function (err, blocks) {
                if (err) {
                    res.send(err);
                }
                else {
                    if (blocks.length != 0) {
                        obj._blockId = req.body._blockId;
                        obj.blockName = blocks[0].name;
                        var flag = true;
                        for(var i = 0; i< phraseGroup2[0]._blockId.length;i++)
                        {
                            if(phraseGroup2[0]._blockId[i]._blockId == req.body._blockId){
                                flag = false;
                                break;
                            }
                        }
                        if(flag == true){
                            phraseGroup2[0]._blockId.push(obj);
                        }
                        phraseGroup = phraseGroup2[0];

                        phraseGroup.save(function (err) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                response.data = phraseGroup;
                                response.message = "Success";
                                response.code = 200;
                                res.json(response);
                                console.log('done');
                            }

                        });
                    }
                    else {
                        response.data = phraseGroup;
                        response.message = "Success";
                        response.code = 200;
                        res.json(response);
                        console.log('done');
                    }
                }
            });

        }
    });
});

getAllPhraseGroups.get(function (req, res) {
    var response = new Response();
    // Save the beer and check for errors

    PhraseGroup.find({}, null, { sort: { '_id': -1 } }, function (err, phraseGroups) {
        if (err) {
            res.send(err);
        }
        else {
            response.message = "Success";
            response.code = 200;
            response.data = phraseGroups;
            res.json(response);
        }
    });
});
addTextBoxPhraseGroup.get(function (req, res) {
    var response = new Response();
    var phraseGroupId = req.params._phraseGroupId;
    var phraseGroup = new PhraseGroup();
    var textArray = [];
    PhraseGroup.find({ '_id': req.params._phraseGroupId }, function (err, phraseGroup2) {
        if (!phraseGroup2) {

        }
        else {
            textArray = phraseGroup2[0].textArray;
            textArray.push('');
            phraseGroup = phraseGroup2[0];
            phraseGroup.textArray = textArray;
            phraseGroup.save(function (err) {
                response.data = phraseGroup;
                response.message = "Success";
                response.code = 200;
                res.json(response);
            });
        }
    });
});
postPhraseGroupRoute.post(function (req, res) {
    var phraseGroup = new PhraseGroup();
    var response = new Response();
    var date = new Date();
    phraseGroup._blockId = [];
    phraseGroup.phraseGroupType = 'block';
    phraseGroup.createdOnUTC = date;
    phraseGroup.updatedOnUTC = date;
    phraseGroup.isDeleted = false;
    phraseGroup.save(function (err) {
        if (err) {
            res.send(err);
        }
        else {
            response.data = phraseGroup;
            response.message = "Success";
            response.code = 200;
            res.json(response);
            console.log('done');
        }
    });
});

module.exports = router;