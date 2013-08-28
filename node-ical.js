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


var rrule = require('rrule').RRule;

ical.objectHandlers['RRULE'] = function(val, params, curr, par, line){

  var hOpts = RRule.parseString(line.replace("RRULE:", ""));
  console.log(hOpts);

  var instance = new rrule(hOpts,true);

  console.log(instance);

  curr['rrule'] = instance;
  return curr
}
