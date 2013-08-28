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

var rrule = require('rrule');


ical.objectHandlers['RRULE'] = function(val, params, curr, par, line){
  var instance = new rrule.RRule({},false);
  curr['rrule'] = instance.fromString(line.replace("RRULE:", ""));
  return curr
}
