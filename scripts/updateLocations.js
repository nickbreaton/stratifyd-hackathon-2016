module.exports = function updateLocations(locations, tweets) {
  function averages(tweets) {
    tweetPromises = tweets.map(tweet => metadata(tweet));

    return Promise.all(tweetPromises)
      .then(tweets => {
        return tweets.reduce(function (states, tweet) {
          if (!states[tweet.state])
            states[tweet.state] = { total: 0, count: 0 };

          states[tweet.state].total += tweet._text_sentiment_score;
          states[tweet.state].count++;

          states[tweet.state].average = states[tweet.state].total / states[tweet.state].count;

          return states;
        }, {});
      });
  }

  return averages(tweets)
    .then(states => {
      locations.forEach(location => {
        const stateName = location.properties.name;
        location.properties.density = states[stateName].average;
      });
      return locations;
    });
}

updateLocations(locations, tweets)
  .then(updatedLocations => {
    console.log(updatedLocations);
  });
