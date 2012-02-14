# ical.js #
(Formerly node-ical)

[![Build Status](https://secure.travis-ci.org/peterbraden/node-ical.png)](http://travis-ci.org/peterbraden/node-ical)

A tolerant, minimal icalendar parser for javascript/node
(http://tools.ietf.org/html/rfc5545)


## Install - Node.js ##

ical.js is availble on npm:

    npm install ical



## API ##

    ical.parseICS(str)

Parses a string with an ICS File








## Example 1 - Print list of upcoming node conferences (see example.js)

    var ical = require('ical')

    ical.fromURL('http://lanyrd.com/topics/nodejs/nodejs.ics', {}, function(err, data) {
      for (var k in data){
        if (data.hasOwnProperty(k)) {
          var ev = data[k]
          console.log("Conference",
            ev.summary,
            'is in',
            ev.location,
            'on the', ev.start.getDate(), 'of', months[ev.start.getMonth()]);
        }
      }
    });



