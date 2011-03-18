# node-ical #

A tolerant, minimal icalendar parser
(http://tools.ietf.org/html/rfc5545)


## Example 1 - Print list of upcoming node conferences (see example.js)


    ical.fromURL('http://lanyrd.com/topics/nodejs/nodejs.ics', {}, function(err, data){
  	  for (var k in data){
	  	if (data.hasOwnProperty(k)){
			var ev = data[k]
			console.log("Conference", 
			  ev.summary, 
			  'is in',  
			  ev.location, 
			  'on the', ev.start.getDate(), 'of', months[ev.start.getMonth()] );
		}
	  }	
    })

