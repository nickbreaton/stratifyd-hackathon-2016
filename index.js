const fetch = require('node-fetch');
const moment = require('moment');

const tweets = [{ location: 'new york', _text_sentiment_score: 0.25 }, { location: 'new york', _text_sentiment_score: 0.75 }, { location: 'California', _text_sentiment_score: 0.25 }];
const locations = [{"type":"Feature","id":"37","properties":{"name":"New York","density":101},"geometry":{"type":"Polygon","coordinates":[[[-80.978661,36.562108],[-80.294043,36.545677],[-79.510841,36.5402],[-75.868676,36.551154],[-75.75366,36.151337],[-76.032984,36.189676],[-76.071322,36.140383],[-76.410893,36.080137],[-76.460185,36.025367],[-76.68474,36.008937],[-76.673786,35.937736],[-76.399939,35.987029],[-76.3616,35.943213],[-76.060368,35.992506],[-75.961783,35.899398],[-75.781044,35.937736],[-75.715321,35.696751],[-75.775568,35.581735],[-75.89606,35.570781],[-76.147999,35.324319],[-76.482093,35.313365],[-76.536862,35.14358],[-76.394462,34.973795],[-76.279446,34.940933],[-76.493047,34.661609],[-76.673786,34.694471],[-76.991448,34.667086],[-77.210526,34.60684],[-77.555573,34.415147],[-77.82942,34.163208],[-77.971821,33.845545],[-78.179944,33.916745],[-78.541422,33.851022],[-79.675149,34.80401],[-80.797922,34.820441],[-80.781491,34.935456],[-80.934845,35.105241],[-81.038907,35.044995],[-81.044384,35.149057],[-82.276696,35.198349],[-82.550543,35.160011],[-82.764143,35.066903],[-83.109191,35.00118],[-83.618546,34.984749],[-84.319594,34.990226],[-84.29221,35.225734],[-84.09504,35.247642],[-84.018363,35.41195],[-83.7719,35.559827],[-83.498053,35.565304],[-83.251591,35.718659],[-82.994175,35.773428],[-82.775097,35.997983],[-82.638174,36.063706],[-82.610789,35.965121],[-82.216449,36.156814],[-82.03571,36.118475],[-81.909741,36.304691],[-81.723525,36.353984],[-81.679709,36.589492],[-80.978661,36.562108]]]}}];

function updateLocations(locations, tweets) {
  const states = ["Alabama","Alaska","American Samoa","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District Of Columbia","Federated States Of Micronesia","Florida","Georgia","Guam","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Marshall Islands","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Northern Mariana Islands","Ohio","Oklahoma","Oregon","Palau","Pennsylvania","Puerto Rico","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virgin Islands","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];

  function search(location) {
    return fetch(`http://ec2-52-34-226-77.us-west-2.compute.amazonaws.com/nominatim/search.php?q=${location}&format=json`)
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
      });
  }

  function metadata(tweet) {
    return search(tweet.location)
      .then(state => {
        tweet.state = state;
        return tweet;
      });
  }

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
