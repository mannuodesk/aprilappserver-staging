var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var UrlUtility = require('./../Utility/UrlUtility');
var Groups = require('./../models/Groups');
var Block = require('./../models/Block');
var Response = require('./../dto/APIResponse');
var Promises = require('promise');
var events = require('events');
var EventEmitter = events.EventEmitter;
//var GroupsBlock = require('./../dto/GroupsBlockDto');

var fs = require('fs'),
    request = require('request');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('Hi I am a Customer Page');
});

var postGroupRoute = router.route('/addGroup');
var getAllGroupsRoute = router.route('/getAllGroups');
var setOrderOfGroupsRoute = router.route('/setOrderOfGroups');
var deleteOrderByIdRoute = router.route('/deleteOrderById/:orderId');
var getGroupsBlocksRoute = router.route('/getGroupsBlocks/:type');
var getGroupsBlocksRoute2 = router.route('/getGroupsBlocks2/:type');
var updateGroupNameRoute = router.route('/updateGroupName/:groupId/:groupName');
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
updateGroupNameRoute.get(function (req, res) {
    var response = new Response();
    var _groupId = req.params.groupId;
    var groupName = req.params.groupName;
    var flag = true;

    Groups.find({}, null, { sort: { '_id': -1 } }, function (err, groups) {
        if (err) {
            res.send(err);
        }
        else {
            for (var i = 0; i < groups.length; i++) {
                var _groupName = groups[i].name.toLowerCase();
                if (_groupName == groupName.toLowerCase()) {
                    flag = false;
                    break;
                }
            }
            if (flag == true) {
                Groups.findOne({ _id: req.params.groupId })
                    .exec(function (err, group) {
                        if (err)
                            res.send(err);
                        else {
                            group.name = groupName;
                            group.markModified('anything');
                            group.save(function (err) {
                                response.message = "Success";
                                response.code = 200;
                                response.data = group;
                                res.json(response);
                            });
                        }
                    });
            }
            else{
                response.message = "Failure: Duplicate Group Name";
                response.code = 300;
                res.json(response);
            }
        }
    });
});
getGroupsBlocksRoute.get(function (req, res) {
    var response = new Response();
    var type = req.params.type;
    var flowController = new EventEmitter();
    var groupsArray = [];
    var groupsBlockDto = {
        'group': Groups,
        'blocks': []
    };
    var array = [];
    if (type == '-1') {
        Groups.find({}, null, { sort: { 'order': -1 } }, function (err, groups) {
            if (err) {
                res.send(err);
            }
            else {
                flowController.on('doWork', function (i) {
                    if (i >= groups.length) {
                        flowController.emit('finished');
                        return;
                    }
                    groupsBlockDto = {
                        'group': Groups,
                        'blocks': []
                    };
                    Block.find({ _groupId: groups[i]._id }, null, { sort: { 'order': 'ascending' } }, function (err, blocks) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            groupsBlockDto.group = groups[i];
                            groupsBlockDto.blocks = blocks;
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
    }
    else {
        Groups.find({ 'type': type }, null, { sort: { 'order': -1 } }, function (err, groups) {
            if (err) {
                res.send(err);
            }
            else {
                flowController.on('doWork2', function (i) {
                    if (i >= groups.length) {
                        flowController.emit('finished2');
                        return;
                    }
                    groupsBlockDto = {
                        'group': Groups,
                        'blocks': []
                    };
                    Block.find({ _groupId: groups[i]._id }, null, { sort: { 'order': 'ascending' } }, function (err, blocks) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            groupsBlockDto.group = groups[i];
                            groupsBlockDto.blocks = blocks;
                            array.push(groupsBlockDto);
                            flowController.emit('doWork2', i + 1);
                        }
                    });
                });
                flowController.emit('doWork2', 0);
                flowController.on('finished2', function () {
                    response.message = "Success";
                    response.code = 200;
                    response.data = array;
                    res.json(response);
                });
            }
        });
    }
});
getGroupsBlocksRoute2.get(function (req, res) {
    var response = new Response();
    var type = req.params.type;
    // Save the beer and check for errors
    var groupsArray = [];
    var array = [];
    var groupsBlockDto = {
        'group': Groups,
        'blocks': []
    };
    if (type == '-1') {
        Groups.find({}, null, { sort: { 'order': -1 } }, function (err, groups) {
            if (err) {
                res.send(err);
            }
            else {
                var array = [];
                var groupsBlockDto = {
                    'group': Groups,
                    'blocks': []
                };
                for (var i = 0; i < groups.length; i++) {
                    groupsBlockDto = {
                        'group': Groups,
                        'blocks': []
                    };
                    groupsBlockDto.group = groups[i];
                    var groupId = groups[i]._id;
                    console.log(groupId)
                    var counter = 0;
                    array.push(groupsBlockDto);
                    Block.find({ _groupId: groupId }, null, { sort: { 'order': 'ascending' } }, function (err, blocks) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            if (blocks.length != 0) {
                                array[counter].blocks = blocks;
                            }
                            else {
                                array[counter].blocks = [];
                            }
                            counter = counter + 1;
                            if (counter == i) {
                                response.message = "Success";
                                response.code = 200;
                                response.data = array;
                                res.json(response);
                            }
                        }
                    });

                }
                if (groups.length == 0) {
                    response.message = "Failure";
                    response.code = 400;
                    res.json(response);
                }
            }
        });
    }
    else {
        Groups.find({ type: type }, null, { sort: { 'order': -1 } }, function (err, groups) {
            if (err) {
                res.send(err);
            }
            else {
                var array = [];
                var groupsBlockDto = {
                    'group': Groups,
                    'blocks': []
                };
                for (var i = 0; i < groups.length; i++) {
                    groupsBlockDto = {
                        'group': Groups,
                        'blocks': []
                    };
                    groupsBlockDto.group = groups[i];
                    var groupId = groups[i]._id;
                    console.log(groupId)
                    var counter = 0;
                    array.push(groupsBlockDto);
                    Block.find({ _groupId: groupId }, null, { sort: { 'order': 'ascending' } }, function (err, blocks) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            if (blocks.length != 0) {
                                array[counter].blocks = blocks;
                            }
                            else {
                                array[counter].blocks = [];
                            }
                            counter = counter + 1;
                            if (counter == i) {
                                response.message = "Success";
                                response.code = 200;
                                response.data = array;
                                res.json(response);
                            }
                        }
                    });

                }
                if (groups.length == 0) {
                    response.message = "Failure";
                    response.code = 400;
                    res.json(response);
                }
            }
        });
    }

});
deleteOrderByIdRoute.get(function (req, res) {
    var response = new Response();
    var type;
    Groups.findOne({ _id: req.params.orderId })
        .exec(function (err, group) {
            if (err)
                res.send(err);
            else {
                var count = 0;
                if (group != null) {
                    type = group.type;
                    group.remove();
                    Block.remove({_groupId: group._id}).exec();//Remove All blocks Related to group
                    Groups.find({ 'type': type }, null, { sort: { 'order': 'ascending' } }, function (err, groups) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            if (groups.length != 0) {
                                for (var i = 0; i < groups.length; i++) {
                                    console.log(groups[i].order);
                                    if ((i + 1) == groups[i].order) {

                                    }
                                    else {
                                        groups[i].order = groups[i].order - 1;
                                        groups[i].save(function (err) {
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
                                        response.data = group;
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
                    response.message = "No Group Exists";
                    response.code = 400;
                    response.data = null;
                    res.json(response);
                }
            }
        });
});
setOrderOfGroupsRoute.post(function (req, res) {
    var oldIndex = req.body.oldIndex;
    var newIndex = req.body.newIndex;
    var response = new Response();
    var groupId = req.body.groupId;
    var type = req.body.type;
    var count = 0;
    Groups.findOne({ _id: groupId })
        .exec(function (err, group) {
            if (err)
                res.send(err);
            else {
                if (group != null) {
                    group.order = newIndex;
                    group.save(function (err, groupModel) {
                        Groups.find({ type: type }, null, { sort: { 'order': 'ascending' } }, function (err, groups) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                var count = 0;
                                if (groups.length != 0) {
                                    if (newIndex < oldIndex) {
                                        for (var i = 0; i < groups.length; i++) {
                                            if (newIndex < groups[i].order && oldIndex >= groups[i].order) {
                                                groups[i].order = groups[i].order + 1;
                                                groups[i].save(function (err) {
                                                    count = count + 1;
                                                    if (groups.length == count) {
                                                        response.message = "Success";
                                                        response.code = 200;
                                                        res.json(response);
                                                    }
                                                });
                                            }
                                            else if (groups[i].order == newIndex && groups[i]._id != groupId) {
                                                groups[i].order = groups[i].order + 1;
                                                groups[i].save(function (err) {
                                                    count = count + 1;
                                                    if (groups.length == count) {
                                                        response.message = "Success";
                                                        response.code = 200;
                                                        res.json(response);
                                                    }
                                                });
                                            }
                                            else {
                                                count = count + 1;
                                                if (groups.length == count) {
                                                    response.message = "Success";
                                                    response.code = 200;
                                                    res.json(response);
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        for (var i = 0; i < groups.length; i++) {
                                            if (oldIndex <= groups[i].order && newIndex > groups[i].order) {
                                                groups[i].order = groups[i].order - 1;
                                                groups[i].save(function (err) {
                                                    count = count + 1;
                                                    if (groups.length == count) {
                                                        response.message = "Success";
                                                        response.code = 200;
                                                        res.json(response);
                                                    }
                                                });
                                            }
                                            else if (groups[i].order == newIndex && groups[i]._id != groupId) {
                                                groups[i].order = groups[i].order - 1;
                                                groups[i].save(function (err) {
                                                    count = count + 1;
                                                    if (groups.length == count) {
                                                        response.message = "Success";
                                                        response.code = 200;
                                                        res.json(response);
                                                    }
                                                });
                                            }
                                            else {
                                                count = count + 1;
                                                if (groups.length == count) {
                                                    response.message = "Success";
                                                    response.code = 200;
                                                    res.json(response);
                                                }
                                            }
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
                    });
                }
            }
            /*if (groups.length != 0) {
                Groups.find({ order: newIndex }, function (err, gr) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        if (gr.length != 0) {
                            Groups.update({ _id: gr[0]._doc._id }, { order: oldIndex }, {}, function (err, group) {
                                if (err) {
                                    res.send(err);
                                }
                                else {
                                    Groups.update({ _id: groupId }, { order: newIndex }, {}, function (err, group) {
                                        if (err) {
                                            res.json(err);
                                        }
                                        else {
                                            response.message = "Success";
                                            response.code = 200;
                                            res.json(response);
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }*/
        });
});
postGroupRoute.post(function (req, res) {
    // Create a new instance of the Beer model
    var group = new Groups();
    var response = new Response();
    var date = new Date();
    // Set the beer properties that came from the POST data

    var flag = true;

    Groups.find({}, null, { sort: { '_id': -1 } }, function (err, groups) {
        if (err) {
            res.send(err);
        }
        else {
            for (var i = 0; i < groups.length; i++) {
                var groupName = groups[i].name.toLowerCase();
                if (groupName == req.body.name.toLowerCase()) {
                    flag = false;
                    break;
                }
            }
            if (flag == true) {
                var order = 0;
                for (var i = 0; i < groups.length; i++) {
                    if (groups[i].type == req.body.type) {
                        if (order < groups[i].order) {
                            order = groups[i].order;
                        }
                    }
                }
                group.name = req.body.name;
                group.order = order + 1;
                group.description = req.body.description;
                group.type = req.body.type;
                group.createdOnUTC = date;
                group.updatedOnUTC = date;
                group.isDeleted = false;
                group.isLocked = false;
                console.log(group);
                // Save the beer and check for errors
                group.save(function (err) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        response.data = group;
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

getAllGroupsRoute.get(function (req, res) {
    // Create a new instance of the Beer model
    var response = new Response();
    // Save the beer and check for errors

    Groups.find({}, null, { sort: { 'order': -1 } }, function (err, groups) {
        if (err) {
            res.send(err);
        }
        else {
            response.message = "Success";
            response.code = 200;
            response.data = groups;
            res.json(response);
        }
    });
});

module.exports = router;