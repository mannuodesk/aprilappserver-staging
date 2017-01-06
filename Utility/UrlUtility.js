var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var bodyParser = require('body-parser');

var UtilityFile = function Constructor() {

};


UtilityFile.prototype.getURL = function () {
    // Connection URL. This is where your mongodb server is running.
    //var url = 'mongodb://localhost:27017/AprilApp';
   //var url ='mongodb://aprilapp:8fn7YcPPy9jsoPyxFLkqMMpqb7N99VlxKjSju3GF7biZEout0l14O4UK9IgsNF9KXHitDA5Gatw44L6i1dmxuw==@aprilapp.documents.azure.com:10250/?ssl=true';
   //var url ='mongodb://mannuodesk:sajjad1214@ds063186.mlab.com:63186/aprilapp';
   //var url ='mongodb://mannuodesk:sajjad1214@ds013956.mlab.com:13956/aprilappstaging';   
   //var url = 'mongodb://mannuodesk:sajjad1214@ds017736.mlab.com:17736/aprilstaging';
   //var url = 'mongodb://aprilapplive:tCACMhi0nxH0gTMeX1ey3nEl67Mzpv9C8Xh5a8BH6A8UmocP0v3wfo5WMcXr1L5XuEeqGnNuCCoshhSVERO0Og==@aprilapplive.documents.azure.com:10250/?ssl=true';
   var url = 'mongodb://aprilappstaging:r8qNzvEh9TnnovQsNw8Qu8fa7EjkJeKH1x7NKHQfAtDgKw62LezL7WMJ3IS6bkMABEnLZsrpTkzNxvWdUzsv3Q==@aprilappstaging.documents.azure.com:10250/?ssl=true';
  return url;
};

/**
 * Created by Tauqeer on 11-08-2016.
 */

module.exports = UtilityFile;