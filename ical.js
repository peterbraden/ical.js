/****************
 *  A tolerant, minimal icalendar parser
 *  (http://tools.ietf.org/html/rfc5545)
 *
 *  <peterbraden@peterbraden.co.uk>
 * **************/

var request = require('request')


exports.parseICS = function(str){
  var lines = str.split('\n')

  for (var i = 0, ii = lines.length, l = lines[0]; i<ii; i++, l=lines[i]){
    console.log(i, l)
  }	  

}	

exports.fromUrl = function(url, opts, cb){
  request({uri:url}, function(err, r, data){
    if (err)
	  throw err;
	cb(undefined, exports.parseICS(data));
  })
}	

exports.fromUrl('http://lanyrd.com/topics/nodejs/nodejs.ics')


