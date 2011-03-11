//var ical = require('ical')
var ical = require('./ical')

var vows = require('vows')
  , assert = require('assert')





ical.fromUrl('http://lanyrd.com/topics/nodejs/nodejs.ics',
	{}, 
	function(err, data){
		console.log("OUT:", data)
	})
