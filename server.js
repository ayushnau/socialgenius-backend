// setup exress server Headers. 
const express = require('express');
const app = express();
const port = 3001;
const cors = require('cors');
const cron = require('node-cron');
const dotenv = require('dotenv');
const { postAutomatedNewsTweet } = require('./apiFnx/fetchArticleAndGenerateTweet');
const tweetRoutes = require('./routes/tweetRoutes');
const morgan = require('morgan');
dotenv.config();




const corsOptions = require('./config/corsConfig');
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
app.use('/tweet', tweetRoutes);





// const prodCron = "*/1 * * * *"
// // // const prodCron = "0 0,5,10,15,20 * * *"; 

// cron.schedule(prodCron, async () => {
//   // const jitter = Math.floor(Math.random() * 30); // Add 0-30 min delay
//   // setTimeout(async () => {
//     console.log('Running automated personal news tweet task...');
//     await postAutomatedNewsTweet();
//   // }, jitter * 60 * 1000);
// });


app.get('/cron/post-news-tweet', async (req, res) => {
  // log the header authroization. 
  console.log(req.headers.authorization);

   const jitter = Math.floor(Math.random() * 30); // Add 0-30 min delay
  // setTimeout(async () => {
  console.log('Running automated personal news tweet task...');
  await postAutomatedNewsTweet();
  res.status(200).send('Automated personal news tweet task completed');
  // }, jitter * 60 * 1000);  
});



app.get('/', (req, res) => {
  res.send('Hello World');
});
app.get('/testing', (req, res) => {
  res.send('Hello World man');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});