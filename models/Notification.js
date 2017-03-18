var mongoose = require('mongoose');

// Define our beer schema
var NotificationSchema   = new mongoose.Schema({
    text:String,
    createdOnUTC: Date,
    updatedOnUTC: Date,
    isDeleted: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('Notification', NotificationSchema);