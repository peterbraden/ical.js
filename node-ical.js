var ical = require('./ical')
  , request = require('request')
  , fs = require('fs')

exports.fromURL = function(url, opts, cb){
  if (!cb)
    return;
  request(url, opts, function(err, r, data){
    if (err)
      return cb(err, null);
    cb(undefined, ical.parseICS(data));
  })
}

exports.parseFile = function(filename){
  return ical.parseICS(fs.readFileSync(filename, 'utf8'))
}


var rrule = require('rrule').RRule

ical.objectHandlers['RRULE'] = function(val, params, curr, stack, line){
  curr['rrule'] = rrule.fromString(line.replace("RRULE:", ""));

  // If rrule does not contain a start date
  // read the start date from the current event
  if (line.indexOf('DTSTART') != -1) {
    curr['rrule'].options.dtstart = curr.start;    
  }

  return curr
}
