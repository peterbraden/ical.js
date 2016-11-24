var ical = require('./ical')
  , request = require('request')
  , fs = require('fs')
  , statusCodes = {
    400: 'Bad Request (400)',
    401: 'Unauthorized (401)',
    403: 'Forbidden (403)',
    404: 'Not Found (404)',
    500: 'Internal Server Error (500)',
    501: 'Not Implemented (501)',
    502: 'Service Unavailable (502)'
  }

function getStatusMessage(statusCode) {
  return statusCodes[statusCode] || 'Unknown (' + statusCode + ')'
}

exports.fromURL = function(url, opts, cb){
  if (!cb)
    return;
  request(url, opts, function(err, r, data){
    if (err)
      return cb(err, null);
    if (parseInt(r.statusCode) >= 400)
      return cb(new Error(getStatusMessage(r.statusCode)));
    cb(undefined, ical.parseICS(data));
  })
}

exports.parseFile = function(filename){
  return ical.parseICS(fs.readFileSync(filename, 'utf8'))
}


var rrule = require('rrule').RRule

ical.objectHandlers['RRULE'] = function(val, params, curr, stack, line){
  curr.rrule = line;
  return curr
}
var originalEnd = ical.objectHandlers['END'];
ical.objectHandlers['END'] = function (val, params, curr, stack) {
	// Recurrence rules are only valid for VEVENT, VTODO, and VJOURNAL.
	// More specifically, we need to filter the VCALENDAR type because we might end up with a defined rrule 
	// due to the subtypes.
	if ((val === "VEVENT") || (val === "VTODO") || (val === "VJOURNAL")) {
		if (curr.rrule) {
			var rule = curr.rrule.replace('RRULE:', '');
			if (rule.indexOf('DTSTART') === -1) {

				if (curr.start.length === 8) {
					var comps = /^(\d{4})(\d{2})(\d{2})$/.exec(curr.start);
					if (comps) {
						curr.start = new Date(comps[1], comps[2] - 1, comps[3]);
					}
				}

				rule += ';DTSTART=' + curr.start.toISOString().replace(/[-:]/g, '');
				rule = rule.replace(/\.[0-9]{3}/, '');
			}
			curr.rrule = rrule.fromString(rule);
		}
	}
  return originalEnd.call(this, val, params, curr, stack);
}
