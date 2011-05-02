/****************
 *  A tolerant, minimal icalendar parser
 *  (http://tools.ietf.org/html/rfc5545)
 *
 *  <peterbraden@peterbraden.co.uk>
 * **************/

var request = require('request')
  , fs = require('fs')


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

var dateParam = function(name){
  return function(val, params, curr){
    storeParam(val, params, curr)
    if (params && params[0] === "VALUE=DATE") { // Just date
      var comps = /^(\d{4})(\d{2})(\d{2})$/.exec(val);
      if (comps !== null) {
        curr[name] = new Date(Date.UTC(
          comps[1],
          parseInt(comps[2])-1,
          comps[3]
        ));
      }
    } else  { //typical RFC date-time format
      var comps = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/.exec(val);
      if (comps !== null) {
        curr[name] = new Date(Date.UTC(
          comps[1],
          parseInt(comps[2])-1,
          comps[3],
          comps[4],
          comps[5],
          comps[6]
        ));
      }
    }
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
  , 'URL' : storeParam('url')
  , 'UID' : storeParam('uid')
  , 'LOCATION' : storeParam('location')
  , 'DTSTART' : dateParam('start')
  , 'DTEND' : dateParam('end')
  ,' CLASS' : storeParam('location')
}

exports.handleObject = function(name, val, params, stack, par, line){
  if(exports.objectHandlers[name])
    return exports.objectHandlers[name](val, params, stack, par, line)
  return stack
}



exports.parseICS = function(str){
  var lines = str.split(/\r?\n/)
  var out = {}
  var ctx = {}

  for (var i = 0, ii = lines.length, l = lines[0]; i<ii; i++, l=lines[i]){
    //Unfold : RFC#3.1
    while (lines[i+1] && /[ \t]/.test(lines[i+1][0])) {
      l += lines[i+1].slice(1)
      i += 1
    }

    var kv = l.split(":")

    if (kv.length < 2){
      // Invalid line - must have k&v
      continue;
    }

    // Although the spec says that vals with colons should be quote wrapped
    // in practise nobody does, so we assume further colons are part of the
    // val
    var value = kv.slice(1).join(":")

    var kp = kv[0].split(";")
    var name = kp[0]
    var params = kp.slice(1)

    ctx = exports.handleObject(name, value, params, ctx, out, l) || {}
  }

  return out
}

exports.fromURL = function(url, opts, cb){
  if (!cb)
    return;

  request({uri:url}, function(err, r, data){
    if (err)
    throw err;
    cb(undefined, exports.parseICS(data));
  })
}

exports.parseFile = function(filename){
  return exports.parseICS(fs.readFileSync(filename, 'utf8'))
}

