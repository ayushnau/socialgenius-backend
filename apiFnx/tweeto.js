
// Your Twitter API credentials

const dotenv = require('dotenv');
dotenv.config();

const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');


// Your Twitter API credentials

// Initialize the Twitter client
const client = new TwitterApi({
  appKey: process.env.CONSUMER_KEY,
  appSecret: process.env.CONSUMER_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

// Create a read-write client
const rwClient = client.readWrite;

// Function to post a tweet with optional media
async function postTweet(text, mediaFilePath = null) {
  try {
    // If no media is provided, post a text-only tweet
    if (!mediaFilePath) {
      const response = await rwClient.v2.tweet(text);
      console.log("Tweet posted successfully!", response);
      return response;
    }
    
    // If media is provided, upload it first
    console.log("Uploading media...");
    const mediaId = await rwClient.v1.uploadMedia(mediaFilePath);
    console.log("Media uploaded successfully, ID:", mediaId);
    
    // Post tweet with media
    const response = await rwClient.v2.tweet({
      text: text,
      media: { media_ids: [mediaId] }
    });
    
    console.log("Tweet with media posted successfully!", response);
    return response;
  } catch (error) {
    console.error("Error posting tweet:", error);
    
    // More detailed error handling
    if (error.code === 403) {
      console.error("Permission error. Check that your app has Write permissions.");
    } else if (error.code === 429) {
      console.error("Rate limit exceeded. Please try again later.");
    } else {
      console.error("Error details:", error.message);
    }
    
    throw error;
  }
}

// Function to post a tweet with multiple media files
async function postTweetWithMultipleMedia(text, mediaFilePaths = []) {
    console.log("text", text);
    console.log("mediaFilePaths", mediaFilePaths);
  try {
    if (!mediaFilePaths.length) {
      return postTweet(text);
    }
    
    // Upload all media files
    console.log("Uploading multiple media files...");
    const mediaPromises = mediaFilePaths.map(filePath => 
      rwClient.v1.uploadMedia(filePath)
    );
    
    const mediaIds = await Promise.all(mediaPromises);
    console.log("All media uploaded successfully, IDs:", mediaIds);
    
    // Post tweet with all media
    const response = await rwClient.v2.tweet({
      text: text,
      media: { media_ids: mediaIds }
    });
    
    console.log("Tweet with multiple media posted successfully!", response);
    return response;
  } catch (error) {
    console.error("Error posting tweet with multiple media:", error);
    throw error;
  }
}

// Check if media file exists and is valid
function validateMediaFile(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Check file size (Twitter has a 5MB limit for photos, 15MB for videos)
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    if (fileSizeInMB > 15) {
      throw new Error(`File size exceeds Twitter's limit: ${fileSizeInMB.toFixed(2)}MB`);
    }
    
    return true;
  } catch (error) {
    console.error("Media validation error:", error.message);
    return false;
  }
}

module.exports = {
  postTweet,
  postTweetWithMultipleMedia
};

// Example usage
// const tweetText = "Check out this image!";
// const imageFilePath = "./path/to/image.jpg";
// postTweet(tweetText, imageFilePath);

// Example with multiple media
// const tweetWithMultipleMedia = "Check out these images!";
// const mediaFiles = ["./image1.jpg", "./image2.jpg"];
// postTweetWithMultipleMedia(tweetWithMultipleMedia, mediaFiles);