/****
 * Tests
 *
 *
 ***/
var ical = require('../ical')

var vows = require('vows')
  , assert = require('assert')
  , _ = require('underscore')

vows.describe('node-ical').addBatch({
  'when parsing test1.ics (node conferences schedule from lanyrd.com, modified)': {
        topic: function () {
      return ical.parseFile('./test/test1.ics')
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
        assert.equal(topic.start.toDateString(), new Date(Date.UTC(2011,10,29)).toDateString())
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
}).export(module)


//ical.fromURL('http://lanyrd.com/topics/nodejs/nodejs.ics',
//  {},
//  function(err, data){
//    console.log("OUT:", data)
//  })
