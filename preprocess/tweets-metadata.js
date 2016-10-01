const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

let tweets = require('../data/tweets/raw.json');
const states = require('../data/states.json')
let i = 0;

tweets = tweets.filter(tweet => tweet.location);//Filters Out tweets that contain no location data

tweetsPromises = tweets.map(tweet => {
  if (tweet.location.replace) tweet.location = tweet.location.replace(/[^a-zA-Z ]/g, "");
  return fetch(`http://ec2-52-34-226-77.us-west-2.compute.amazonaws.com/nominatim/search.php?q=${tweet.location}&format=json`)
    .then(response => {
      return response
    })
    .then(response => response.json())
    .then(data => {
      return new Promise(resolve => {
        for (var i = 0; i < states.length; i++) {
          const state = states[i];
          if (data[0] && data[0].display_name.toLowerCase().indexOf(state.toLowerCase()) > -1) {
            resolve(state);
            break;
          }
        }
        resolve(null);
      });
    })
    .then(state => {
      tweet.state = state;
      console.log(tweet.state, i++);
      fs.appendFileSync(path.resolve(__dirname, '../data/tweets/processed.json'), (JSON.stringify(tweet) + ',\n'));
      return tweet;
    })
    .catch(err => {
      i++
      errored.push(tweet);
      console.log(err, tweet);
    });
});
