var ical = require('./ical')
  , request = require('request')
  , fs = require('fs')

exports.fromURL = function(url, opts, cb){
  if (!cb)
    return;

  request({uri:url}, function(err, r, data){
    if (err)
      return cb(err, null);
    cb(undefined, ical.parseICS(data));
  })
}

exports.parseFile = function(filename){
  return ical.parseICS(fs.readFileSync(filename, 'utf8'))
}


var RRule = require('rrule').RRule;
var hInstances = {};

ical.objectHandlers['RRULE'] = function(val, params, curr, par, line){
  if (par) {
      var id;
      for (var sID in par) {
          id = sID;
      }
      if (id) {
          hInstances[id] = new RRule(RRule.parseString(line.replace("RRULE:", "")));
          curr['rrule'] = hInstances[id].all();
      }
  }
  return curr
}
