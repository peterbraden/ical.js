var request = require('request');
var fs = require('fs');
var rrule = require('rrule').RRule;

var ical = require('./ical');

/**
 * Callback for iCal parsing functions with error and iCal data as a JavaScript object.
 * @callback icsCallback
 * @param {Error} err
 * @param {Object} ics
 */
/**
 * A Promise that is undefined if a compatible callback is passed.
 * @typedef {(Promise|undefined)} optionalPromise
 */

/**
 * Download an iCal file from the web and parse it.
 *
 * @param {string} url                - URL of file to request.
 * @param {Object|icsCallback} [opts] - Options to pass to request() from npm:request.
 *                                      Alternatively you can pass the callback function directly.
 *                                      If no callback is provided a promise will be returned.
 * @param {icsCallback} [cb]          - Callback function.
 *                                      If no callback is provided a promise will be returned.
 *
 * @returns {optionalPromise} Promise is returned if no callback is passed.
 */
exports.fromURL = function(url, opts, cb) {
    return promiseCallback(function(resolve, reject) {
        request(url, opts, function(err, res, data) {
            if (err) {
                reject(err);
                return;
            }
            // if (r.statusCode !== 200) {
            // all ok status codes should be accepted (any 2XX code)
            if (Math.floor(res.statusCode / 100) !== 2) {
                reject(new Error(res.statusCode + ': ' + res.statusMessage));
                return;
            }
            ical.parseICS(data, function(err, ics) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(ics);
            });
        });
    }, cb);
};

/**
 * Load iCal data from a file and parse it.
 *
 * @param {string} filename   - File path to load.
 * @param {icsCallback} [cb]  - Callback function.
 *                              If no callback is provided a promise will be returned.
 *
 * @returns {optionalPromise} Promise is returned if no callback is passed.
 */
exports.parseFile = function(filename, cb) {
    return promiseCallback(function(resolve, reject) {
        fs.readFile(filename, 'utf8', function(err, data) {
            if (err) {
                reject(err);
                return;
            }
            ical.parseICS(data, function(err, ics) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(ics);
            });
        });
    }, cb);
};

// utility to allow callbacks to be used for promises
function promiseCallback(fn, cb) {
    var promise = new Promise(fn);
    if (!cb) {
        return promise;
    } else {
        promise()
            .then(function(ret) {
                cb(null, ret);
            })
            .catch(function(err) {
                cb(err, null);
            });
        return;
    }
}

ical.objectHandlers.RRULE = function(val, params, curr, stack, line) {
    curr.rrule = line;
    return curr;
};
const originalEnd = ical.objectHandlers.END;
ical.objectHandlers.END = function(val, params, curr, stack) {
    // Recurrence rules are only valid for VEVENT, VTODO, and VJOURNAL.
    // More specifically, we need to filter the VCALENDAR type because we might end up with a defined rrule
    // due to the subtypes.
    if (val === 'VEVENT' || val === 'VTODO' || val === 'VJOURNAL') {
        if (curr.rrule) {
            let rule = curr.rrule.replace('RRULE:', '');
            if (rule.indexOf('DTSTART') === -1) {
                if (curr.start.length === 8) {
                    const comps = /^(\d{4})(\d{2})(\d{2})$/.exec(curr.start);
                    if (comps) {
                        curr.start = new Date(comps[1], comps[2] - 1, comps[3]);
                    }
                }

                if (typeof curr.start.toISOString === 'function') {
                    try {
                        rule += ';DTSTART=' + curr.start.toISOString().replace(/[-:]/g, '');
                        rule = rule.replace(/\.[0-9]{3}/, '');
                    } catch (error) {
                        console.error('ERROR when trying to convert to ISOString', error);
                    }
                } else {
                    console.error('No toISOString function in curr.start', curr.start);
                }
            }
            curr.rrule = rrule.fromString(rule);
        }
    }
    return originalEnd.call(this, val, params, curr, stack);
};
