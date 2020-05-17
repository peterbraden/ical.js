# node-ical
[![Build Status](https://travis-ci.org/jens-maus/node-ical.png)](https://travis-ci.org/jens-maus/node-ical)
[![NPM version](http://img.shields.io/npm/v/node-ical.svg)](https://www.npmjs.com/package/node-ical)
[![Downloads](https://img.shields.io/npm/dm/node-ical.svg)](https://www.npmjs.com/package/node-ical)
[![Known Vulnerabilities](https://snyk.io/test/github/jens-maus/node-ical/badge.svg?targetFile=package.json)](https://snyk.io/test/github/jens-maus/node-ical?targetFile=package.json)

[![NPM](https://nodei.co/npm/node-ical.png?downloads=true)](https://nodei.co/npm/node-ical/)

A minimal iCalendar/ICS (http://tools.ietf.org/html/rfc5545) parser for Node.js. This module is a direct fork
of the ical.js module by Peter Braden (https://github.com/peterbraden/ical.js) which is primarily targeted
for parsing iCalender/ICS files in a pure JavaScript environment. (ex. within the browser itself) This node-ical
module however, primarily targets Node.js use and allows for more flexible APIs and interactions within a Node environment. (like filesystem access!)

## Install
node-ical is availble on npm:
```sh
npm install node-ical
```

## API
The API has now been broken into three sections:
 - [sync](#sync)
 - [async](#async)
 - [autodetect](#autodetect)

`sync` provides synchronous API functions.
These are easy to use but can block the event loop and are not recommended for applications that need to serve content or handle events.

`async` provides proper asynchronous support for iCal parsing.
All functions will either return a promise for `async/await` or use a callback if one is provided.

`autodetect` provides a mix of both for backwards compatibility with older node-ical applications.

All API functions are documented using JSDoc in the [index.js](index.js) file.
This allows for IDE hinting!

### sync
```javascript
// import ical
const ical = require('node-ical');

// use the sync function parseFile() to parse this ics file
const events = ical.sync.parseFile('example-calendar.ics');
// loop through events and log them
for (const event of Object.values(events)) {
    console.log(
        'Summary: ' + event.summary +
        '\nDescription: ' + event.description +
        '\nStart Date: ' + event.start.toISOString() +
        '\n'
    );
};

// or just parse some iCalendar data directly
const directEvents = ical.sync.parseICS(`
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:Hey look! An example event!
DTSTART;TZID=America/New_York:20130802T103400
DTEND;TZID=America/New_York:20130802T110400
LOCATION:1000 Broadway Ave.\, Brooklyn
DESCRIPTION: Do something in NY.
STATUS:CONFIRMED
UID:7014-1567468800-1567555199@peterbraden@peterbraden.co.uk
END:VEVENT
END:VCALENDAR
`);
// log the ids of these events
console.log(Object.keys(directEvents));
```

### async
```javascript
// import ical
const ical = require('node-ical');

// do stuff in an async function
;(async () => {
    // load and parse this file without blocking the event loop
    const events = await ical.async.parseFile('example-calendar.ics');

    // you can also use the async lib to download and parse iCal from the web
    const webEvents = await ical.async.fromURL('http://lanyrd.com/topics/nodejs/nodejs.ics');
    // also you can pass options to request() (optional though!)
    const headerWebEvents = await ical.async.fromURL(
        'http://lanyrd.com/topics/nodejs/nodejs.ics',
        { headers: { 'User-Agent': 'API-Example / 1.0' } }
    );

    // parse iCal data without blocking the main loop for extra-large events
    const directEvents = await ical.async.parseICS(`
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:Hey look! An example event!
DTSTART;TZID=America/New_York:20130802T103400
DTEND;TZID=America/New_York:20130802T110400
DESCRIPTION: Do something in NY.
UID:7014-1567468800-1567555199@peterbraden@peterbraden.co.uk
END:VEVENT
END:VCALENDAR
    `);
})()
    .catch(console.error.bind());

// old fashioned callbacks cause why not

// parse a file with a callback
ical.async.parseFile('example-calendar.ics', function(err, data) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(data);
});

// or a URL
ical.async.fromURL('http://lanyrd.com/topics/nodejs/nodejs.ics', function(err, data) { console.log(data); });

// or directly
ical.async.parseICS(`
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:Hey look! An example event!
DTSTART;TZID=America/New_York:20130802T103400
DTEND;TZID=America/New_York:20130802T110400
DESCRIPTION: Do something in NY.
UID:7014-1567468800-1567555199@peterbraden@peterbraden.co.uk
END:VEVENT
END:VCALENDAR
`, function(err, data) { console.log(data); });
```

### autodetect
These are the old API examples, which still work and will be converted to the new API automatically.
Functions with callbacks provided will also have better performance over the older versions even if they use the old API.

Parses a string with ICS content in sync. This can block the event loop on big files.
```javascript
const ical = require('node-ical');
ical.parseICS(str);
```

Parses a string with ICS content in async to prevent the event loop from being blocked.
```javascript
const ical = require('node-ical');
ical.parseICS(str, function(err, data) {
    if (err) console.log(err);
    console.log(data);
});
```

Parses a string with an ICS file in sync. This can block the event loop on big files.
```javascript
const ical = require('node-ical');
const data = ical.parseFile(filename);
```

Parses a string with an ICS file in async to prevent event loop from being blocked.
```javascript
const ical = require('node-ical');
const data = ical.parseFile(filename, function(err, data) {
    if (err) console.log(err);
    console.log(data);
});
```

Reads in the specified iCal file from the URL, parses it and returns the parsed data.
```javascript
const ical = require('node-ical');
ical.fromURL(url, options, function(err, data) {
    if (err) console.log(err);
    console.log(data);
});
```

Use the request library to fetch the specified URL (```opts``` gets passed on to the ```request()``` call), and call the function with the result. (either an error or the data)

#### Example 1 - Print list of upcoming node conferences (see example.js) (parses the file synchronous)
```javascript
const ical = require('node-ical');
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

ical.fromURL('http://lanyrd.com/topics/nodejs/nodejs.ics', {}, function (err, data) {
    for (let k in data) {
        if (data.hasOwnProperty(k)) {
            const ev = data[k];
            if (data[k].type == 'VEVENT') {
                console.log(`${ev.summary} is in ${ev.location} on the ${ev.start.getDate()} of ${months[ev.start.getMonth()]} at ${ev.start.toLocaleTimeString('en-GB')}`);
            }
        }
    }
});
```
