//var ical = require('ical')
var ical = require('../ical')

var vows = require('vows')
  , assert = require('assert')
  , _ = require('underscore')

vows.describe('Parsing a calendar file').addBatch({
    'when parsing calendar file 1': {
        topic: function () {
			return ical.parseFile('./tests/test1.ics')
		}

        ,'we get 8 events': function (topic) {
			var events = _.select(_.values(topic), function(x){ return x.type==='VEVENT'})
            assert.equal (events.length, 8);
        }
		,'event 47f6e' : {
			topic: function(events){
				return _.select(_.values(events),
					function(x){
						return x.uid ==='47f6ea3f28af2986a2192fa39a91fa7d60d26b76'})[0]
			}
			,'is in fort lauderdale' : function(topic){
				assert.equal(topic.location, "Fort Lauderdale, United States")
			}
			,'starts Tue, 29 Nov 2011' : function(topic){
				assert.equal(topic.start.toDateString(), new Date(2011,10,29).toDateString())
			}
		}
		, 'event 480a' : {
			topic: function(events){
				return _.select(_.values(events),
					function(x){
						return x.uid ==='480a3ad48af5ed8965241f14920f90524f533c18'})[0]
			}
			, 'has a summary (invalid colon handling tolerance)' : function(topic){
				assert.equal(topic.summary, '[Async]: Everything Express')
			}
		
		
		}	

    },
}).export(module)


//ical.fromURL('http://lanyrd.com/topics/nodejs/nodejs.ics',
//	{}, 
//	function(err, data){
//		console.log("OUT:", data)
//	})
