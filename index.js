module.exports = require('./ical');

const node = require('./node-ical');

// Copy node functions across to exports
for (const i in node) {
    module.exports[i] = node[i];
}
