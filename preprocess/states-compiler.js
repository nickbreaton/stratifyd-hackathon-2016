const states = require('../assets/us-states');
const allTweets = require('../data/tweets/processed.json');
const updateLocations = require('../scripts/updateLocations');
const moment = require('moment');

const fs = require('fs');
const path = require('path');

[5].forEach(function (i) {
  console.log(allTweets.length);
  let tweets = filterDataByDate(`2016-09-2${i}T00:00`, `2016-09-2${i+1}T00:00`, allTweets);
  console.log(tweets.length);

  // default 0
  states.features.forEach(feature => feature.properties.density = 0);

  updateLocations(states.features, tweets)
    .then(features => {
      states.features = features;
      fs.writeFileSync(
        path.join(__dirname, `../assets/states/2016-09-2${i}.js`),
        `var day2${i} = ${JSON.stringify(states)}`
      );
    });

  function filterDataByDate(start, end, data) {
    var formattedStartDate = moment(moment(start).format('ddd MMM D YYYY h:mm:ss')).unix();
    var formattedEndDate = moment(moment(end).format('ddd MMM D YYYY h:mm:ss')).unix();
    var result=[]
    for (var i = 0; i < data.length; i++) {
      formattedDate = moment(data[i].date).format('ddd MMM D YYYY h:mm:ss')
      formattedDate = moment(formattedDate).unix()
      if (formattedDate > formattedStartDate && formattedDate < formattedEndDate) {
        result.push(data[i])
      }
    }
    return result;
  }
});
