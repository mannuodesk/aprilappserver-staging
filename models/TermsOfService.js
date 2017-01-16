var mongoose = require('mongoose');

// Define our beer schema
var TermsOfServiceSchema   = new mongoose.Schema({
    content:String,
    createdOnUTC: Date,
    updatedOnUTC: Date,
    isDeleted: Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('TermsOfService', TermsOfServiceSchema);