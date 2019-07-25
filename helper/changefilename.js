var crypto = require('crypto');
module.exports=function(filename){
	var crypStr = crypto.randomBytes(12).toString('hex');
	var nameArr = filename.split(".");
	var ext = nameArr[nameArr.length-1];
	var newName = crypStr+"."+ext;
	return newName;
}