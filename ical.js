/****************
 *  A tolerant, minimal icalendar parser
 *  (http://tools.ietf.org/html/rfc5545)
 *
 *  <peterbraden@peterbraden.co.uk>
 * **************/
var moment = require('moment-timezone');

// Unescape Text re RFC 4.3.11
var text = function(t){
  return (t
    .replace(/\\\,/g, ',')
    .replace(/\\\;/g, ';')
    .replace(/\\[nN]/g, '\n')
    .replace(/\\\\/g, '\\')
  )
}

var parseParams = function(p){
  var out = {}
  for (var i = 0; i<p.length; i++){
    if (p[i].indexOf('=') > -1){
      var segs = p[i].split('=')
        , out = {}
      if (segs.length == 2){
        out[segs[0]] = segs[1]
      }
    }
  }
  return out || sp
}

var storeParam = function(name){
  return function(val, params, curr){
    if (params && params.length && !(params.length==1 && params[0]==='CHARSET=utf-8')){
      curr[name] = {params:params, val:text(val)}
    }
    else
      curr[name] = text(val)

    return curr
  }
}


var dateParam = function(name){
  return function(val, params, curr) {
      // Store as string - worst case scenario
      storeParam(name)(val, undefined, curr)

      var comps = /^(\d{4})(\d{2})(\d{2})$/.exec(val);
      if (comps) {
        curr[name] = moment(val,'YYYYMMDD');
        curr[name].bAllDay = true;
      } else if (val) {
        curr[name] = moment(val);
      }
      return curr[name];
  }
}


var geoParam = function(name){
  return function(val, params, curr){
    storeParam(val, params, curr)
    var parts = val.split(';');
    curr[name] = {lat:Number(parts[0]), lon:Number(parts[1])};
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
    else
      par[Math.random()*100000] = curr  // Randomly assign ID : TODO - use true GUID
  }

  , 'SUMMARY' : storeParam('summary')
  , 'DESCRIPTION' : storeParam('description')
  , 'URL' : storeParam('url')
  , 'UID' : storeParam('uid')
  , 'LOCATION' : storeParam('location')
  , 'DTSTART' : dateParam('start')
  , 'DTEND' : dateParam('end')
  ,' CLASS' : storeParam('class')
  , 'TRANSP' : storeParam('transparency')
  , 'GEO' : geoParam('geo')
  , 'PERCENT-COMPLETE': storeParam('completion')
  , 'COMPLETED': dateParam('completed')
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
      , kp = kv[0].split(";")
      , name = kp[0]
      , params = kp.slice(1)

    ctx = exports.handleObject(name, value, params, ctx, out, l) || {}
  }

  return out
}
