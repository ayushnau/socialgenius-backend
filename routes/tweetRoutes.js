const express = require('express');
const app = express.Router();
const { postTweet, postTweetWithMedia, generateTweet, suggestImage } = require('../controller/tweet.controller');


app.post('/post-tweet', postTweet);
app.post('/post-tweet-with-media', postTweetWithMedia);
app.post('/generate-tweet', generateTweet);
app.post('/suggest-image', suggestImage);


module.exports = app;











