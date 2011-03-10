/****************
 *  A tolerant, minimal icalendar parser
 *  (http://tools.ietf.org/html/rfc5545)
 *
 *  <peterbraden@peterbraden.co.uk>
 * **************/

var request = require('request')



var storeParam = function(name){
	return function(val, params, curr){
		if (params && params.length && !(params.length==1 && params[0]==='CHARSET=utf-8')){
			curr[name] = {params:params, val:val}
		}
		else
			curr[name] = val

		return curr
	}	
}	
	

exports.objectHandlers = {
	'BEGIN' : function(component, params, curr){
			if (component === 'VCALENDAR')
				return curr;
			return {type:component, params:params}
		}

  , 'END' : function(component, params, curr, par){
	  if (curr.uid)
			par[curr.uid] = curr		
  }

  , 'SUMMARY' : storeParam('summary')
  , 'UID' : storeParam('uid')
  , 'LOCATION' : storeParam('location')
  , 'DTSTART' : storeParam('start')
  , 'DTEND' : storeParam('end')
	
}	

exports.handleObject = function(name, val, params, stack, par, line){
	if(exports.objectHandlers[name])
	  return exports.objectHandlers[name](val, params, stack, par, line)
	
	return stack	  
}	



exports.parseICS = function(str){
  var lines = str.split('\r\n')
	, kv, value, params, name, kp
	, out = {}
    , ctx = {}

  for (var i = 0, ii = lines.length, l = lines[0]; i<ii; i++, l=lines[i]){
    //Unfold : RFC#3.1
    if (lines[i+1] && /\s/.test(lines[i+1][0])){
	  l += lines[i+1] // TODO - strip leading whitespace
	  i += 1		
	}	

	kv = l.split(":")
	
	if (kv.length != 2){
	  // Invalid line - must have k&v
	  continue;
	}	
		
	value = kv[1]
	
	kp = kv[0].split(";")
	name = kp[0]
	params = []
	
	if (kp.length > 1){
	  for (var pi = 1; pi < kp.length; pi++){
	    params.push(kp[pi]);
	  }	  
	}

	exports.handleObject(name, value, params, ctx, out, l)  
  }	  

  return out
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

//exports.fromUrl('http://lanyrd.com/topics/nodejs/nodejs.ics', {}, function(err, data){console.log("OUT:", data)})


