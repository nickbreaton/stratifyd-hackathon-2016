//Averages the sentiment value for states from tweets, then updates it in locations
module.exports = function updateLocations(locations, tweets) {
	//Averages the sentiment values of the tweets for each state and returns the array
  function averages(tweets) {
    tweetPromises = tweets.map(tweet => metadata(tweet));

    return Promise.all(tweetPromises)
      .then(tweets => {
        return tweets.reduce(function (states, tweet) {
          if (!states[tweet.state])
            states[tweet.state] = { total: 0, count: 0 };
          //for every state update the average sentiment score
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
        location.properties.density = states[stateName].average;//Updates the averages for each state in locations 
      });
      return locations;
    });
}

updateLocations(locations, tweets)
  .then(updatedLocations => {
    console.log(updatedLocations);
  });
