/****************
 *  A tolerant, minimal icalendar parser
 *  (http://tools.ietf.org/html/rfc5545)
 *
 *  <peterbraden@peterbraden.co.uk>
 * **************/

var request = require('request')


exports.parseICS = function(str){
  var lines = str.split('\r\n')

  for (var i = 0, ii = lines.length, l = lines[0]; i<ii; i++, l=lines[i]){
    //Unfold : RFC#3.1
    if (lines[i+1] && /\s/.test(lines[i+1][0])){
	  l += lines[i+1]
	  i += 1		
	}	

    console.log(i, l)
  }	  

  return {}
}	

exports.fromUrl = function(url, opts, cb){
  if (!cb)
    return;
	
  request({uri:url}, function(err, r, data){
    if (err)
	  throw err;
	cb(undefined, exports.parseICS(data));
  })
}	

exports.fromUrl('http://lanyrd.com/topics/nodejs/nodejs.ics', {}, function(){})


