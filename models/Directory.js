var mongoose = require('mongoose');

// Define our beer schema
var DirectorySchema   = new mongoose.Schema({
    title:String,
    content:String,
    createdOnUTC: Date,
    updatedOnUTC: Date,
    isDeleted: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('Directory', DirectorySchema);