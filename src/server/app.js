const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet')
let xss = require("xss");

app.use(helmet());

app.use(cors());

app.disable('x-powered-by');

require('dotenv').config();

const port = process.env.PORT | 3000;

let appStatus = 1;

app.use((req, res, next) => {
  if (appStatus) {
      return next();
  }
  throw new Error('App is closing');
})

const limiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 200, // Limit each IP to 60 requests per `window` (here, per 1 hour)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	// store: ... , // Use an external store for more precise rate limiting
});

app.use(limiter);

// TODO: implement loading gif for slow connection
// Implemented but it's not centered and when a new city is searched is behind the picture

// TODO: implement gracefully shutdown with additional middleware

// TODO: implement local time of the city?


app.get('/:city', async function(req, res,next) {
  
  let selectedCity = req.params.city;
  let selectedCitySanitized = xss(selectedCity);
  
  // console.log(typeof selectedCity);
  // let selectedCity = xss(req.params.city);
  
  let dataFromApi = {};
  let errorMessage = '';
  
  
  await axios.get(`http://api.weatherapi.com/v1/current.json?key=${process.env.API_KEY}&q=${selectedCitySanitized}`)   
  .then(function (response) {
    // handle success
    dataFromApi = response.data;
  })
  .catch(function (error) {
    // handle errors
    // errorMessage = error.code;
    errorMessage = error;
  });
  
  // console.log(errorMessage.response);
  // console.log(typeof errorMessage.response.status)
  
  if(errorMessage.length === 0) {
    res.send(dataFromApi); 
  }
  else if(errorMessage.response.status === 400) {
    // res.send(errorMessage);
    res.status(400).json({
      message: 'Ooops, no matching location found.'
    })
  }else if (errorMessage.response.status === 429){
    res.status(429).json({
      message: 'Hey, too many requests!.'
    })
  }else if(errorMessage.response.status === 404) {
    res.status(404).json({
      message: 'Ooops, something went wrong.'
    })
  };
  
  next();
});


app.listen(port, () => {
  console.log(`Weather app listening on port ${port}`)
});

process.on('SIGTERM', () => {
  debug('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    debug('HTTP server closed')
  })
});

// process.on('SIGINT', (signal) => {
//   appStatus = 0;
//   console.log('*** Signal received ****');
//   console.log('*** App will be closed in 3 sec ****');
//   setTimeout(shutdownProcedure, 3000);
// })

// function shutdownProcedure() {
//   console.log('*** App is now closing ***');
//   process.exit(0);
// }