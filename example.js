'use strict';

// This example uses axios for requesting the calendar
// but is not required for use with ical.
const axios = require('axios');
const ical = require('ical');
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

axios.get('https://www.google.com/calendar/ical/en.usa%23holiday@group.v.calendar.google.com/public/basic.ics')
    .then(function (response) {
        var data = ical.parseICS(response.data);
        for (let k in data) {
            if (data.hasOwnProperty(k)) {
                var ev = data[k];
                if (data[k].type == 'VEVENT') {
                    console.log(`${ev.summary} is in ${ev.location} on the ${ev.start.getDate()} of ${months[ev.start.getMonth()]} at ${ev.start.toLocaleTimeString('en-GB')}`);

                }
            }
        }
    });

