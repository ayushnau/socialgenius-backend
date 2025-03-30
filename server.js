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





const prodCron = "*/1 * * * *"
// // const prodCron = "0 0,5,10,15,20 * * *"; 

cron.schedule(prodCron, async () => {
  // const jitter = Math.floor(Math.random() * 30); // Add 0-30 min delay
  // setTimeout(async () => {
    console.log('Running automated personal news tweet task...');
    await postAutomatedNewsTweet();
  // }, jitter * 60 * 1000);
});


app.get('/cron/post-news-tweet', async (req, res) => {
  // const authHeader = req.headers.authorization || '';
  // console.log(authHeader, process.env.CRON_SECRET);
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }
  console.log('Running automated personal news tweet task...');
  res.status(200).send('Automated personal news tweet task completed');

  setInterval(async () => {
    console.log('Running automated personal news tweet task...');
    // await postAutomatedNewsTweet();
  }, 5000);
  // await postAutomatedNewsTweet();
  // res.send('Automated personal news tweet task completed');
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