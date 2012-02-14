/****************
 *  A tolerant, minimal icalendar parser
 *  (http://tools.ietf.org/html/rfc5545)
 *
 *  <peterbraden@peterbraden.co.uk>
 * **************/


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
  return function(val, params, curr){
    
    // Store as string - worst case scenario
    storeParam(name)(val, undefined, curr)
    
    if (params && params[0] === "VALUE=DATE") { 
      // Just Date
      
      var comps = /^(\d{4})(\d{2})(\d{2})$/.exec(val);
      if (comps !== null) {
        // No TZ info - assume same timezone as this computer
        curr[name] = new Date(
          comps[1],
          parseInt(comps[2])-1,
          comps[3]
        );
      }
      
      
    } else  { 
      
      //typical RFC date-time format
      var comps = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(val);
      if (comps !== null) {
        if (comps[7] == 'Z'){ // GMT
          curr[name] = new Date(Date.UTC(
            comps[1],
            parseInt(comps[2])-1,
            comps[3],
            comps[4],
            comps[5],
            comps[6]
          ));
        } else {
          curr[name] = new Date(
            comps[1],
            parseInt(comps[2])-1,
            comps[3],
            comps[4],
            comps[5],
            comps[6]
          );
        }    
      }
    }
    
    var p = parseParams(params);
    
    if (params && p){
      curr[name].tz = p.TZID
    }  
      
    return curr
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

var generateTextParam = function(icsName){
  return function(val){
    return icsName + ";CHARSET=utf-8:" + val; //TODO - handle non strings
  }  
}

var generateRawParam = function(icsName){
  return function(val){
    return icsName + ":" + val; //TODO - handle non strings
  }  
}






var params = {
  // <ICS PARAM NAME> : [<json key>, <store generator>, <generate generator>]
    'SUMMARY' : ['summary', storeParam, generateTextParam]
  , 'DESCRIPTION' : ['description', storeParam, generateTextParam]
  , 'URL' : ['url', storeParam, generateRawParam]
  , 'UID' : ['uid', storeParam, generateRawParam]
  , 'LOCATION' : ['location', storeParam]
  , 'DTSTART' : ['start', dateParam]
  , 'DTEND' : ['end', dateParam]
  ,' CLASS' : ['class', storeParam]
  , 'TRANSP' : ['transparency', storeParam]
  , 'GEO' : ['geo', geoParam]
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
}

// Append params handlers to objectHandlers
for (var ic in params){
  exports.objectHandlers[ic] = params[ic][1](params[ic][0])
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

 
exports.objectGenerators = {}

// Append params handlers to objectGenerators
for (var ic in params){
  if (params[ic][2])
    exports.objectGenerators[params[ic][0]] = params[ic][2](ic)
}

  

exports.generateComponent = function(ob, type){
  
  if (exports.objectGenerators[type]){
    return exports.objectGenerators[type](ob)
  }  
  return ""
}  

// Does the opposite of parseICS - generate ICS data from json
exports.generateICS = function(data){
  var out = ""
  
  if (!(data instanceof Array)){
    data = [data]
  }  
  
  for (var i =0; i< data.length; i++){
    var component = data[i]
      , t = component.type ? component.type : 'VEVENT'
      
    out += "BEGIN:" + t + '\n'
    for (var k in component){
      out += exports.generateComponent(component[k], k) + '\n'; // TODO Wrap
    } 
    out += "END:" + t + '\n'
    
  }  

  return out
}  
