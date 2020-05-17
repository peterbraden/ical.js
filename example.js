const ical = require('./index');

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

ical.fromURL('http://lanyrd.com/topics/nodejs/nodejs.ics', {}, function(err, data) {
    for (const k in data) {
        if (!{}.hasOwnProperty.call(data, k)) continue;
        const ev = data[k];
        if (data[k].type == 'VEVENT') {
            console.log(
                `${ev.summary} is in ${ev.location} on the ${ev.start.getDate()} of ${
                    months[ev.start.getMonth()]
                } at ${ev.start.toLocaleTimeString('en-GB')}`
            );
        }
    }
});
