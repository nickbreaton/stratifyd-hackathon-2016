const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const tweets = require('../data/tweets/raw.json');
const states = require('../data/states.json')
let i = 0;
tweetsPromises = tweets.slice(0, 2500).map(tweet => {
  return fetch(`http://ec2-52-34-226-77.us-west-2.compute.amazonaws.com/nominatim/search.php?q=${tweet.location || 'London'}&format=json`)
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
      console.log(i++);
      return tweet;
    });
});

Promise.all(tweetsPromises)
  .then(tweets => {
    console.log(tweets.length);
    tweets = tweets.filter(t => t.state !== null);
    console.log(tweets.length);
    fs.writeFileSync(path.resolve(__dirname, '../data/tweets/processed1.json'), JSON.stringify(tweets))
  });
