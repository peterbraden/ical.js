var ical = require('ical')
// var ical = require('./ical')

ical.fromUrl('http://lanyrd.com/topics/nodejs/nodejs.ics', {}, function(err, data){console.log("OUT:", data)})
