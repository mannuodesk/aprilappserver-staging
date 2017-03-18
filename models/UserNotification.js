var mongoose = require('mongoose');
var Notification = require('./Notification');
var User = require('./User');
// Define our beer schema
var UserNotificationSchema   = new mongoose.Schema({
    _notificationId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' },
    _userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isRead:Boolean,
    createdOnUTC: Date,
    updatedOnUTC: Date,
    isDeleted: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('UserNotification', UserNotificationSchema);