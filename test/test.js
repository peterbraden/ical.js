/****
 * Tests
 *
 *
 ***/
var ical = require('../index')

var vows = require('vows')
  , assert = require('assert')
  , _ = require('underscore')

vows.describe('node-ical').addBatch({
  'when parsing test1.ics (node conferences schedule from lanyrd.com, modified)': {
        topic: function () {
      return ical.parseFile('./test/test1.ics')
    }

    ,'we get 9 events': function (topic) {
      var events = _.select(_.values(topic), function(x){ return x.type==='VEVENT'})
            assert.equal (events.length, 9);
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
    , 'event d4c8' :{
      topic : function(events){
        return _.select(_.values(events),
            function(x){
              return x.uid === 'd4c826dfb701f611416d69b4df81caf9ff80b03a'})[0]
      }
      , 'has a start datetime' : function(topic){
        assert.equal(topic.start.toDateString(), new Date(Date.UTC(2011, 2, 12, 20, 0, 0)).toDateString())
      }
    }
    
    , 'event sdfkf09fsd0 (Invalid Date)' :{
      topic : function(events){
        return _.select(_.values(events),
            function(x){
              return x.uid === 'sdfkf09fsd0'})[0]
      }
       , 'has a start datetime' : function(topic){
          assert.equal(topic.start, "Next Year")
        }
    }  
  }
  , 'with test2.ics (testing ical features)' : {
    topic: function () {
      return ical.parseFile('./test/test2.ics')
    }
    , 'todo item uid4@host1.com' : {
      topic : function(items){
        return items['uid4@host1.com']
      }
      , 'is a VTODO' : function(topic){
        assert.equal(topic.type, 'VTODO')
      }
    }
  }
  , 'with test3.ics (testing tvcountdown.com)' : {
    topic: function() {
      return ical.parseFile('./test/test3.ics');
    }
    , 'event -83' : {
      topic: function(events) {
        return _.select(_.values(events), function(x) {
          return x.uid === '20110505T220000Z-83@tvcountdown.com';
        })[0];
      }
      , 'has a start datetime' : function(topic) {
        assert.equal(topic.start.getFullYear(), 2011);
        assert.equal(topic.start.getMonth(), 4);
      }
      , 'has an end datetime' : function(topic) {
        assert.equal(topic.end.getFullYear(), 2011);
        assert.equal(topic.end.getMonth(), 4);
      }
    }
  }
  
  , 'with test4.ics (testing tripit.com)' : {
    topic: function() {
      return ical.parseFile('./test/test4.ics');
    }
    , 'event c32a5...' : {
      topic: function(events) {
        return _.select(_.values(events), function(x) {
          return x.uid === 'c32a5eaba2354bb29e012ec18da827db90550a3b@tripit.com';
        })[0];
      }
      , 'has a start datetime' : function(topic) {
        assert.equal(topic.start.getFullYear(), 2011);
        assert.equal(topic.start.getMonth(), 09);
        assert.equal(topic.start.getDate(), 11);
      }
      
      , 'has a summary' : function(topic){
        // escaped commas and semicolons should be replaced
        assert.equal(topic.summary, 'South San Francisco, CA, October 2011;')
        
      } 
      
      , 'has a description' : function(topic){
        var desired = 'John Doe is in South San Francisco, CA from Oct 11 ' + 
         'to Oct 13, 2011\nView and/or edit details in TripIt : http://www.tripit.c' +
         'om/trip/show/id/23710889\nTripIt - organize your travel at http://www.trip' + 
         'it.com\n'
        assert.equal(topic.description, desired) 
      
      }
      
      , 'has a geolocation' : function(topic){
        assert.ok(topic.geo, 'no geo param')
        assert.equal(topic.geo.lat, 37.654656)
        assert.equal(topic.geo.lon, -122.40775)
      }   
      
      , 'has transparency' : function(topic){
        assert.equal(topic.transparency, 'TRANSPARENT')
      }
      
    }
  }
  
  
  
  , 'with test5.ics (testing meetup.com)' : { 
     topic: function () {
        return ical.parseFile('./test/test5.ics')
      }
    , 'event nsmxnyppbfc@meetup.com' : {
      topic: function(events) {
        return _.select(_.values(events), function(x) {
          return x.uid === 'event_nsmxnyppbfc@meetup.com';
        })[0];
      }
      , 'has a start' : function(topic){
        assert.equal(topic.start.tz, 'America/Phoenix')
        assert.equal(topic.start.toISOString(), new Date(2011, 10, 09, 19, 0,0).toISOString())
      }  
    }   
  }    
  
  , 'with test6.ics (testing assembly.org)' : { 
     topic: function () {
        return ical.parseFile('./test/test6.ics')
      }
    , 'event with no ID' : {
      topic: function(events) {
        return _.select(_.values(events), function(x) {
          return x.summary === 'foobar Summer 2011 starts!';
        })[0];
      }
      , 'has a start' : function(topic){
        assert.equal(topic.start.toISOString(), new Date(2011, 07, 04, 12, 0,0).toISOString())
      }  
    }   
  }
}).export(module)


//ical.fromURL('http://lanyrd.com/topics/nodejs/nodejs.ics',
//  {},
//  function(err, data){
//    console.log("OUT:", data)
//  })
