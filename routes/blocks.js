var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var UrlUtility = require('./../Utility/UrlUtility');
var Block = require('./../models/Block');
var Response = require('./../dto/APIResponse');
var ResponseMessage = require('./../models/ResponseMessages');
var PhraseGroup = require('./../models/PhraseGroup');
var events = require('events');
var EventEmitter = events.EventEmitter;

var fs = require('fs'),
    request = require('request');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('Hi I am a Customer Page');
});

var postBlockRoute = router.route('/addBlock');
var getAllBlockRoute = router.route('/getAllBlocks');
var getResponseMessagesOfBlockRoute = router.route('/getResponseMessagesOfBlock/:blockId');
var deleteBlockRoute = router.route('/deleteBlock/:blockId');
var updateBlockNameRoute = router.route('/updateBlockName/:blockId/:blockName');
var sortBlockRoute = router.route('/sortBlock');
var getTopicsRoute = router.route('/getTopics');
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
getTopicsRoute.get(function (req, res) {
    var response = new Response();
    Block.find({'_groupId':'58aea689cba4f621fcd3258a'}, null, { sort: { 'order': 'ascending' } }, function (err, blocks) {
        if (err) {
            res.send(err);
        }
        else {
            response.code = 200;
            response.data = blocks;
            response.message = "Success";
            res.json(response);
        }
    });
});
sortBlockRoute.post(function (req, res) {
    var response = new Response();
    var _blockId = req.body.blockId;
    var groupId = req.body.groupId;
    var newIndex = req.body.newIndex;
    var oldIndex = req.body.oldIndex;
    var count = 0;
    var prevGroupId;
    var prevOrder = 0;
    var type;
    _blockId = _blockId.slice(5, _blockId.length);
    Block.findOne({ _id: _blockId })
        .exec(function (err, block) {
            if (err)
                res.send(err);
            else {
                prevGroupId = block._groupId;
                prevOrder = block.order;
                block._groupId = groupId;
                block.order = newIndex;
                block.save(function (err) {
                    Block.find({ '_groupId': block._groupId }, null, { sort: { 'order': 'ascending' } }, function (err, blocks) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            for (var i = 0; i < blocks.length; i++) {
                                if (blocks[i].order == (i + 1)) {
                                    count = count + 1;
                                }
                                else {
                                    if (blocks.length != 0) {
                                        if (newIndex < oldIndex) {
                                            for (var i = 0; i < blocks.length; i++) {
                                                if (newIndex < blocks[i].order && oldIndex >= blocks[i].order) {
                                                    blocks[i].order = blocks[i].order + 1;
                                                    blocks[i].save(function (err) {
                                                        count = count + 1;
                                                        if (blocks.length == count) {
                                                            response.message = "Success";
                                                            response.code = 200;
                                                            res.json(response);
                                                        }
                                                    });
                                                }
                                                else if (blocks[i].order == newIndex && blocks[i]._id != _blockId) {
                                                    blocks[i].order = blocks[i].order + 1;
                                                    blocks[i].save(function (err) {
                                                        count = count + 1;
                                                        if (blocks.length == count) {
                                                            response.message = "Success";
                                                            response.code = 200;
                                                            res.json(response);
                                                        }
                                                    });
                                                }
                                                else {
                                                    count = count + 1;
                                                    if (blocks.length == count) {
                                                        response.message = "Success";
                                                        response.code = 200;
                                                        res.json(response);
                                                    }
                                                }
                                            }
                                        }
                                        else {
                                            for (var i = 0; i < blocks.length; i++) {
                                                if (oldIndex <= blocks[i].order && newIndex > blocks[i].order) {
                                                    blocks[i].order = blocks[i].order - 1;
                                                    blocks[i].save(function (err) {
                                                        count = count + 1;
                                                        if (blocks.length == count) {
                                                            response.message = "Success";
                                                            response.code = 200;
                                                            res.json(response);
                                                        }
                                                    });
                                                }
                                                else if (blocks[i].order == newIndex && blocks[i]._id != _blockId) {
                                                    blocks[i].order = blocks[i].order - 1;
                                                    blocks[i].save(function (err) {
                                                        count = count + 1;
                                                        if (blocks.length == count) {
                                                            response.message = "Success";
                                                            response.code = 200;
                                                            res.json(response);
                                                        }
                                                    });
                                                }
                                                else {
                                                    count = count + 1;
                                                    if (blocks.length == count) {
                                                        response.message = "Success";
                                                        response.code = 200;
                                                        res.json(response);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }).populate('_groupId');
                    if (groupId != prevGroupId) {
                        Block.find({ '_groupId': prevGroupId }, null, { sort: { 'order': 'ascending' } }, function (err, blocks) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                if (blocks.length != 0) {
                                    for (var i = 0; i < blocks.length; i++) {
                                        console.log(blocks[i].order);
                                        if ((i + 1) == blocks[i].order) {

                                        }
                                        else {
                                            blocks[i].order = blocks[i].order - 1;
                                            blocks[i].save(function (err) {
                                                if (err) {

                                                }
                                                else {
                                                    count = count + 1;
                                                    console.log('Updated');
                                                }
                                            })
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
            }
        });
});
updateBlockNameRoute.get(function (req, res) {
    var response = new Response();
    var _blockId = req.params.blockId;
    var blockName = req.params.blockName;

    var flowController = new EventEmitter();
    var flag = true;
    Block.find({}, null, { sort: { '_id': -1 } }, function (err, blocks) {
        if (err) {
            res.send(err);
        }
        else {
            for (var i = 0; i < blocks.length; i++) {
                var groupName = blocks[i].name.toLowerCase();
                if (groupName == blockName.toLowerCase()) {
                    flag = false;
                    break;
                }
            }
            if (flag == true) {
                Block.findOne({ _id: req.params.blockId })
                    .exec(function (err, block) {
                        if (err)
                            res.send(err);
                        else {
                            block.name = blockName;
                            block.markModified('anything');
                            block.save(function (err) {
                                PhraseGroup.find({}, function (err, phraseGroup) {
                                    if (!phraseGroup) {

                                    }
                                    else {
                                        UpdateBlockName(0, phraseGroup, _blockId, blockName);
                                        response.message = "Success";
                                        response.code = 200;
                                        response.data = block;
                                        res.json(response);
                                    }
                                });
                            });
                        }
                    });
            }
            else {
                response.message = "Failure: Duplicate Block Name";
                response.code = 300;
                res.json(response);
            }
        }
    });
});
function UpdateBlockName(i, phraseGroup, _blockId, blockName) {
    var phraseGroupObj = new PhraseGroup();
    if (i >= phraseGroup.length) {
        return;
    }
    if (phraseGroup[i]._blockId.length == 0) {
        UpdateBlockName(i + 1, phraseGroup, _blockId, blockName);
    }
    var j = 0;
    for (j = 0; j < phraseGroup[i]._blockId.length; j++) {
        if (phraseGroup[i]._blockId[j]._blockId == _blockId) {
            phraseGroupObj = phraseGroup[i];
            phraseGroupObj._blockId[j].blockName = blockName;
            phraseGroupObj.markModified('_blockId');
            phraseGroupObj.save(function (err, model) {

            });
        }
    }
    if (j == phraseGroup[i]._blockId.length) {
        UpdateBlockName(i + 1, phraseGroup, _blockId, blockName);
    }
}
deleteBlockRoute.get(function (req, res) {
    var count = 0;
    var response = new Response();
    var groupId;
    var type;
    Block.findOne({ _id: req.params.blockId })
        .exec(function (err, block) {
            if (err)
                res.send(err);
            else {
                if (block != null) {
                    groupId = block._groupId;
                    type = block.type;
                    block.remove();
                    Block.find({ 'type': type, '_groupId': groupId }, null, { sort: { 'order': 'ascending' } }, function (err, blocks) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            if (blocks.length != 0) {
                                for (var i = 0; i < blocks.length; i++) {
                                    console.log(blocks[i].order);
                                    if ((i + 1) == blocks[i].order) {

                                    }
                                    else {
                                        blocks[i].order = blocks[i].order - 1;
                                        blocks[i].save(function (err) {
                                            if (err) {

                                            }
                                            else {
                                                count = count + 1;
                                                console.log('Updated');
                                            }
                                        })
                                    }
                                    if (i == count) {
                                        response.message = "Success";
                                        response.code = 200;
                                        response.data = block;
                                        res.json(response);
                                    }
                                }
                            }
                            else {
                                response.message = "No Group Exists";
                                response.code = 400;
                                response.data = null;
                                res.json(response);
                            }
                        }
                    });
                }
                else {
                    response.message = "No Block Exists";
                    response.code = 400;
                    response.data = null;
                    res.json(response);
                }
            }
        });
});
getResponseMessagesOfBlockRoute.get(function (req, res) {
    var blockId = req.params.blockId;
    var response = new Response();
    var blockObject = {
        'block': Block,
        'responseMessages': []
    }
    Block.findOne({ _id: blockId })
        .exec(function (err, block) {
            if (err)
                res.send(err);
            else {
                ResponseMessage.find({ _blockId: blockId }, function (err, responseMessages) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        responseMessages.sort(function (a, b) {
                            return a.order - b.order;
                        });
                        blockObject.block = block;
                        blockObject.responseMessages = responseMessages;
                        response.data = blockObject;
                        response.message = "Success";
                        response.code = 200;
                        res.json(response);
                    }
                });
            }
        });
});
postBlockRoute.post(function (req, res) {
    // Create a new instance of the Beer model
    var block = new Block();
    var response = new Response();
    var date = new Date();
    var flag = true;
    Block.find({}, null, { sort: { '_id': -1 } }, function (err, blocks) {
        if (err) {
            res.send(err);
        }
        else {
            for (var i = 0; i < blocks.length; i++) {
                var groupName = blocks[i].name.toLowerCase();
                if (groupName == req.body.name.toLowerCase()) {
                    flag = false;
                    break;
                }
            }
            if (flag == true) {
                var order = 0;
                for (var i = 0; i < blocks.length; i++) {
                    if (blocks[i].type == req.body.type && blocks[i]._groupId == req.body._groupId) {
                        if (order < blocks[i].order) {
                            order = blocks[i].order;
                        }
                    }
                }
                block.name = req.body.name;
                block.order = order + 1;
                block.description = req.body.description;
                block.type = req.body.type;
                block.createdOnUTC = date;
                block.updatedOnUTC = date;
                block.isDeleted = false;
                block.isLocked = false;
                block.isCompleted = true;
                block._groupId = req.body._groupId;
                console.log(block);
                // Save the beer and check for errors
                block.save(function (err) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        response.data = block;
                        response.message = "Success";
                        response.code = 200;
                        res.json(response);
                        console.log('done');
                    }
                });
            }
            else {
                response.message = "Success";
                response.code = 300;
                res.json(response);
            }
        }
    });
});

getAllBlockRoute.get(function (req, res) {
    // Create a new instance of the Beer model
    var response = new Response();
    // Save the beer and check for errors

    Block.find({}, null, { sort: { '_id': -1 } }, function (err, blocks) {
        if (err) {
            res.send(err);
        }
        else {
            response.message = "Success";
            response.code = 200;
            response.data = blocks;
            res.json(response);
        }
    }).populate('_groupId');
});

module.exports = router;