/** **
 * Tests
 *
 *
 ** */
process.env.TZ = 'America/San_Francisco';

const vows = require('vows');
const assert = require('assert');
const _ = require('underscore');
const ical = require('../index');

vows.describe('node-ical')
    .addBatch({
        'when parsing test1.ics (node conferences schedule from lanyrd.com, modified)': {
            'topic': function() {
                return ical.parseFile('./test/test1.ics');
            },

            'we get 9 events': function(topic) {
                const events = _.select(_.values(topic), function(x) {
                    return x.type === 'VEVENT';
                });
                assert.equal(events.length, 9);
            },

            'event 47f6e': {
                'topic': function(events) {
                    return _.select(_.values(events), function(x) {
                        return x.uid === '47f6ea3f28af2986a2192fa39a91fa7d60d26b76';
                    })[0];
                },
                'is in fort lauderdale': function(topic) {
                    assert.equal(topic.location, 'Fort Lauderdale, United States');
                },
                'starts Tue, 29 Nov 2011': function(topic) {
                    assert.equal(topic.start.toDateString(), new Date(2011, 10, 29).toDateString());
                },
                'datetype is date': function(topic) {
                    assert.equal(topic.datetype, 'date');
                },
            },
            'event 480a': {
                'topic': function(events) {
                    return _.select(_.values(events), function(x) {
                        return x.uid === '480a3ad48af5ed8965241f14920f90524f533c18';
                    })[0];
                },
                'has a summary (invalid colon handling tolerance)': function(topic) {
                    assert.equal(topic.summary, '[Async]: Everything Express');
                },
                'has a date only start datetime' : function(topic) {
                    assert.equal(topic.start.dateOnly, true);
                },
                'has a date only end datetime' : function(topic) {
                    assert.equal(topic.end.dateOnly, true);
                },
            },
            'event d4c8': {
                'topic': function(events) {
                    return _.select(_.values(events), function(x) {
                        return x.uid === 'd4c826dfb701f611416d69b4df81caf9ff80b03a';
                    })[0];
                },
                'has a start datetime': function(topic) {
                    assert.equal(topic.start.toDateString(), new Date(Date.UTC(2011, 2, 12, 20, 0, 0)).toDateString());
                },
                'datetype is date-time': function(topic) {
                    assert.equal(topic.datetype, 'date-time');
                },
            },

            'event sdfkf09fsd0 (Invalid Date)': {
                'topic': function(events) {
                    return _.select(_.values(events), function(x) {
                        return x.uid === 'sdfkf09fsd0';
                    })[0];
                },
                'has a start datetime': function(topic) {
                    assert.equal(topic.start, 'Next Year');
                },
            },
        },
        'with test2.ics (testing ical features)': {
            'topic': function() {
                return ical.parseFile('./test/test2.ics');
            },
            'todo item uid4@host1.com': {
                'topic': function(items) {
                    return _.filter(items, function(obj) {
                        {
                            return obj.uid == 'uid4@host1.com';
                        }
                    })[0];
                },
                'is a VTODO': function(topic) {
                    assert.equal(topic.type, 'VTODO');
                },
            },
            'vfreebusy': {
                'topic': function(events) {
                    return _.select(_.values(events), function(x) {
                        return x.type === 'VFREEBUSY';
                    })[0];
                },
                'has a URL': function(topic) {
                    assert.equal(topic.url, 'http://www.host.com/calendar/busytime/jsmith.ifb');
                },
            },
            'vfreebusy first freebusy': {
                'topic': function(events) {
                    return _.select(_.values(events), function(x) {
                        return x.type === 'VFREEBUSY';
                    })[0].freebusy[0];
                },
                'has undefined type defaulting to busy': function(topic) {
                    assert.equal(topic.type, 'BUSY');
                },
                'has an start datetime': function(topic) {
                    assert.equal(topic.start.getFullYear(), 1998);
                    assert.equal(topic.start.getUTCMonth(), 2);
                    assert.equal(topic.start.getUTCDate(), 14);
                    assert.equal(topic.start.getUTCHours(), 23);
                    assert.equal(topic.start.getUTCMinutes(), 30);
                },
                'has an end datetime': function(topic) {
                    assert.equal(topic.end.getFullYear(), 1998);
                    assert.equal(topic.end.getUTCMonth(), 2);
                    assert.equal(topic.end.getUTCDate(), 15);
                    assert.equal(topic.end.getUTCHours(), 0);
                    assert.equal(topic.end.getUTCMinutes(), 30);
                },
            },
            'tzid parsing': {
                'topic': function(events) {
                    return _.filter(events, function(obj) {
                        {
                            return obj.uid == 'EC9439B1-FF65-11D6-9973-003065F99D04';
                        }
                    })[0];
                },
                'tzid offset correctly applied': function(event) {
                    const start = new Date('2002-10-28T22:00:00.000Z');
                    assert.equal(event.start.valueOf(), start.valueOf());
                },
            },
        },
        'with test3.ics (testing tvcountdown.com)': {
            'topic': function() {
                return ical.parseFile('./test/test3.ics');
            },
            'event -83': {
                'topic': function(events) {
                    return _.select(_.values(events), function(x) {
                        return x.uid === '20110505T220000Z-83@tvcountdown.com';
                    })[0];
                },
                'has a start datetime': function(topic) {
                    assert.equal(topic.start.getFullYear(), 2011);
                    assert.equal(topic.start.getMonth(), 4);
                },
                'has an end datetime': function(topic) {
                    assert.equal(topic.end.getFullYear(), 2011);
                    assert.equal(topic.end.getMonth(), 4);
                },
                'datetype is date-time': function(topic) {
                    assert.equal(topic.datetype, 'date-time');
                },
            },
        },

        'with test4.ics (testing tripit.com)': {
            'topic': function() {
                return ical.parseFile('./test/test4.ics');
            },
            'event c32a5...': {
                'topic': function(events) {
                    return _.select(_.values(events), function(x) {
                        return x.uid === 'c32a5eaba2354bb29e012ec18da827db90550a3b@tripit.com';
                    })[0];
                },
                'has a start datetime': function(topic) {
                    assert.equal(topic.start.getFullYear(), 2011);
                    assert.equal(topic.start.getMonth(), 9);
                    assert.equal(topic.start.getDate(), 11);
                },

                'has a summary': function(topic) {
                    // escaped commas and semicolons should be replaced
                    assert.equal(topic.summary, 'South San Francisco, CA, October 2011;');
                },

                'has a description': function(topic) {
                    const desired =
                        'John Doe is in South San Francisco, CA from Oct 11 ' +
                        'to Oct 13, 2011\nView and/or edit details in TripIt : http://www.tripit.c' +
                        'om/trip/show/id/23710889\nTripIt - organize your travel at http://www.trip' +
                        'it.com\n';
                    assert.equal(topic.description, desired);
                },

                'has a geolocation': function(topic) {
                    assert.ok(topic.geo, 'no geo param');
                    assert.equal(topic.geo.lat, 37.654656);
                    assert.equal(topic.geo.lon, -122.40775);
                },

                'has transparency': function(topic) {
                    assert.equal(topic.transparency, 'TRANSPARENT');
                },
            },
        },

        'with test5.ics (testing meetup.com)': {
            'topic': function() {
                return ical.parseFile('./test/test5.ics');
            },
            'event nsmxnyppbfc@meetup.com': {
                'topic': function(events) {
                    return _.select(_.values(events), function(x) {
                        return x.uid === 'event_nsmxnyppbfc@meetup.com';
                    })[0];
                },
                'has a start': function(topic) {
                    assert.equal(topic.start.tz, 'America/Phoenix');
                    assert.equal(topic.start.toISOString(), new Date(Date.UTC(2011, 10, 10, 2, 0, 0)).toISOString());
                },
            },
        },

        'with test6.ics (testing assembly.org)': {
            'topic': function() {
                return ical.parseFile('./test/test6.ics');
            },
            'event with no ID': {
                'topic': function(events) {
                    return _.select(_.values(events), function(x) {
                        return x.summary === 'foobar Summer 2011 starts!';
                    })[0];
                },
                'has a start': function(topic) {
                    assert.equal(topic.start.toISOString(), new Date(2011, 7, 4, 0, 0, 0).toISOString());
                },
            },
            'event with rrule': {
                'topic': function(events) {
                    return _.select(_.values(events), function(x) {
                        return x.summary == 'foobarTV broadcast starts';
                    })[0];
                },
                'Has an RRULE': function(topic) {
                    assert.notEqual(topic.rrule, undefined);
                },
                'RRule text': function(topic) {
                    assert.equal(topic.rrule.toText(), 'every 5 weeks on Monday, Friday until January 30, 2013');
                },
            },
        },
        'with test7.ics (testing dtstart of rrule)': {
            'topic': function() {
                return ical.parseFile('./test/test7.ics');
            },
            'recurring yearly event (14 july)': {
                'topic': function(events) {
                    const ev = _.values(events)[0];
                    return ev.rrule.between(new Date(2013, 0, 1), new Date(2014, 0, 1));
                },
                'dt start well set': function(topic) {
                    assert.equal(topic[0].toDateString(), new Date(2013, 6, 14).toDateString());
                },
            },
        },
        'with test 8.ics (VTODO completion)': {
            'topic': function() {
                return ical.parseFile('./test/test8.ics');
            },
            'grabbing VTODO task': {
                'topic': function(topic) {
                    return _.values(topic)[0];
                },
                'task completed': function(task) {
                    assert.equal(task.completion, 100);
                    assert.equal(task.completed.toISOString(), new Date(2013, 6, 16, 10, 57, 45).toISOString());
                },
            },
        },
        'with test 9.ics (VEVENT with VALARM)': {
            'topic': function() {
                return ical.parseFile('./test/test9.ics');
            },
            'grabbing VEVENT task': {
                'topic': function(topic) {
                    return _.values(topic)[0];
                },
                'task completed': function(task) {
                    assert.equal(task.summary, 'Event with an alarm');
                },
            },
        },
        'with test 11.ics (VEVENT with custom properties)': {
            'topic': function() {
                return ical.parseFile('./test10.ics');
            },
            'grabbing custom properties': {
                topic(topic) {},
            },
        },

        'with test10.ics': {
            'topic': function() {
                return ical.parseFile('./test/test10.ics');
            },

            'when categories present': {
                'topic': function(t) {
                    return _.values(t)[0];
                },

                'should be a list': function(e) {
                    assert(e.categories instanceof [].constructor);
                },

                'should contain individual category values': function(e) {
                    assert.deepEqual(e.categories, ['cat1', 'cat2', 'cat3']);
                },
            },

            'when categories present with trailing whitespace': {
                'topic': function(t) {
                    return _.values(t)[1];
                },

                'should contain individual category values without whitespace': function(e) {
                    assert.deepEqual(e.categories, ['cat1', 'cat2', 'cat3']);
                },
            },

            'when categories present but empty': {
                'topic': function(t) {
                    return _.values(t)[2];
                },

                'should be an empty list': function(e) {
                    assert.deepEqual(e.categories, []);
                },
            },

            'when categories present but singular': {
                'topic': function(t) {
                    return _.values(t)[3];
                },

                'should be a list of single item': function(e) {
                    assert.deepEqual(e.categories, ['lonely-cat']);
                },
            },

            'when categories present on multiple lines': {
                'topic': function(t) {
                    return _.values(t)[4];
                },

                'should contain the category values in an array': function(e) {
                    assert.deepEqual(e.categories, ['cat1', 'cat2', 'cat3']);
                },
            },
        },

        'with test11.ics (testing zimbra freebusy)': {
            'topic': function() {
                return ical.parseFile('./test/test11.ics');
            },

            'freebusy params': {
                'topic': function(events) {
                    return _.values(events)[0];
                },
                'has a URL': function(topic) {
                    assert.equal(topic.url, 'http://mail.example.com/yvr-2a@example.com/20140416');
                },
                'has an ORGANIZER': function(topic) {
                    assert.equal(topic.organizer, 'mailto:yvr-2a@example.com');
                },
                'has an start datetime': function(topic) {
                    assert.equal(topic.start.getFullYear(), 2014);
                    assert.equal(topic.start.getMonth(), 3);
                },
                'has an end datetime': function(topic) {
                    assert.equal(topic.end.getFullYear(), 2014);
                    assert.equal(topic.end.getMonth(), 6);
                },
            },
            'freebusy busy events': {
                'topic': function(events) {
                    return _.select(_.values(events)[0].freebusy, function(x) {
                        return x.type === 'BUSY';
                    })[0];
                },
                'has an start datetime': function(topic) {
                    assert.equal(topic.start.getFullYear(), 2014);
                    assert.equal(topic.start.getMonth(), 3);
                    assert.equal(topic.start.getUTCHours(), 15);
                    assert.equal(topic.start.getUTCMinutes(), 15);
                },
                'has an end datetime': function(topic) {
                    assert.equal(topic.end.getFullYear(), 2014);
                    assert.equal(topic.end.getMonth(), 3);
                    assert.equal(topic.end.getUTCHours(), 19);
                    assert.equal(topic.end.getUTCMinutes(), 0);
                },
            },
        },

        'with test12.ics (testing recurrences and exdates)': {
            'topic': function() {
                return ical.parseFile('./test/test12.ics');
            },
            'event with rrule': {
                'topic': function(events) {
                    return _.select(_.values(events), function(x) {
                        return x.uid === '0000001';
                    })[0];
                },
                'Has an RRULE': function(topic) {
                    assert.notEqual(topic.rrule, undefined);
                },
                'Has summary Treasure Hunting': function(topic) {
                    assert.equal(topic.summary, 'Treasure Hunting');
                },
                'Has two EXDATES': function(topic) {
                    assert.notEqual(topic.exdate, undefined);
                    assert.notEqual(
                        topic.exdate[new Date(Date.UTC(2015, 6, 8, 19, 0, 0)).toISOString().substring(0, 10)],
                        undefined
                    );
                    assert.notEqual(
                        topic.exdate[new Date(Date.UTC(2015, 6, 10, 19, 0, 0)).toISOString().substring(0, 10)],
                        undefined
                    );
                },
                'Has a RECURRENCE-ID override': function(topic) {
                    assert.notEqual(topic.recurrences, undefined);
                    assert.notEqual(
                        topic.recurrences[new Date(Date.UTC(2015, 6, 7, 19, 0, 0)).toISOString().substring(0, 10)],
                        undefined
                    );
                    assert.equal(
                        topic.recurrences[new Date(Date.UTC(2015, 6, 7, 19, 0, 0)).toISOString().substring(0, 10)]
                            .summary,
                        'More Treasure Hunting'
                    );
                },
            },
        },

        'with test13.ics (testing recurrence-id before rrule)': {
            'topic': function() {
                return ical.parseFile('./test/test13.ics');
            },
            'event with rrule': {
                'topic': function(events) {
                    return _.select(_.values(events), function(x) {
                        return x.uid === '6m2q7kb2l02798oagemrcgm6pk@google.com';
                    })[0];
                },
                'Has an RRULE': function(topic) {
                    assert.notEqual(topic.rrule, undefined);
                },
                "Has summary 'repeated'": function(topic) {
                    assert.equal(topic.summary, 'repeated');
                },
                'Has a RECURRENCE-ID override': function(topic) {
                    assert.notEqual(topic.recurrences, undefined);
                    assert.notEqual(
                        topic.recurrences[new Date(Date.UTC(2016, 7, 26, 11, 0, 0)).toISOString().substring(0, 10)],
                        undefined
                    );
                    assert.equal(
                        topic.recurrences[new Date(Date.UTC(2016, 7, 26, 11, 0, 0)).toISOString().substring(0, 10)]
                            .summary,
                        'bla bla'
                    );
                },
            },
        },

        'with test14.ics (testing comma-separated exdates)': {
            'topic': function() {
                return ical.parseFile('./test/test14.ics');
            },
            'event with comma-separated exdate': {
                'topic': function(events) {
                    return _.select(_.values(events), function(x) {
                        return x.uid === '98765432-ABCD-DCBB-999A-987765432123';
                    })[0];
                },
                "Has summary 'Example of comma-separated exdates'": function(topic) {
                    assert.equal(topic.summary, 'Example of comma-separated exdates');
                },
                'Has four comma-separated EXDATES': function(topic) {
                    assert.notEqual(topic.exdate, undefined);
                    // Verify the four comma-separated EXDATES are there
                    assert.notEqual(
                        topic.exdate[new Date(2017, 6, 6, 12, 0, 0).toISOString().substring(0, 10)],
                        undefined
                    );
                    assert.notEqual(
                        topic.exdate[new Date(2017, 6, 17, 12, 0, 0).toISOString().substring(0, 10)],
                        undefined
                    );
                    assert.notEqual(
                        topic.exdate[new Date(2017, 6, 20, 12, 0, 0).toISOString().substring(0, 10)],
                        undefined
                    );
                    assert.notEqual(
                        topic.exdate[new Date(2017, 7, 3, 12, 0, 0).toISOString().substring(0, 10)],
                        undefined
                    );
                    // Verify an arbitrary date isn't there
                    assert.equal(
                        topic.exdate[new Date(2017, 4, 5, 12, 0, 0).toISOString().substring(0, 10)],
                        undefined
                    );
                },
            },
        },

        'with test14.ics (testing exdates with bad times)': {
            'topic': function() {
                return ical.parseFile('./test/test14.ics');
            },
            'event with exdates with bad times': {
                'topic': function(events) {
                    return _.select(_.values(events), function(x) {
                        return x.uid === '1234567-ABCD-ABCD-ABCD-123456789012';
                    })[0];
                },
                "Has summary 'Example of exdate with bad times'": function(topic) {
                    assert.equal(topic.summary, 'Example of exdate with bad times');
                },
                'Has two EXDATES even though they have bad times': function(topic) {
                    assert.notEqual(topic.exdate, undefined);
                    // Verify the two EXDATES are there, even though they have bad times
                    assert.notEqual(
                        topic.exdate[new Date(2017, 11, 18, 12, 0, 0).toISOString().substring(0, 10)],
                        undefined
                    );
                    assert.notEqual(
                        topic.exdate[new Date(2017, 11, 19, 12, 0, 0).toISOString().substring(0, 10)],
                        undefined
                    );
                },
            },
        },

        'with test15.ics (testing quoted parameter values)': {
            'topic': function() {
                return ical.parseFile('./test/test15.ics');
            },
            'quoted params': {
                'topic': function(events) {
                    return _.values(events)[0];
                },
                'is quoted': function(topic) {
                    assert.notEqual(topic.start.tz, undefined);
                },
            },
        },

        'with test16.ics (testing for non-stringified start/end time)': {
            'topic': function() {
                return ical.parseFile('./test/test16.ics');
            },
            'stringified params': {
                'topic': function(events) {
                    return _.values(events)[0];
                },
                'is not string': function(topic) {
                    assert.notEqual(typeof topic.start, 'string');
                    assert.notEqual(typeof topic.end, 'string');
                },
            },
        },

        'url request errors': {
            'topic': function() {
                ical.fromURL('http://255.255.255.255/', {}, this.callback);
            },
            'are passed back to the callback': function(err, result) {
                assert.instanceOf(err, Error);
                if (!err) {
                    console.log('>E:', err, result);
                }
            },
        },
    })
    .export(module);
