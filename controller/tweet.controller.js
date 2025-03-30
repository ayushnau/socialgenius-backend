const express = require('express');
const app = express();
const anthropic = require('../config/anthropic');
const formidable = require('formidable');
const { postTweetWithMultipleMedia } = require('../apiFnx/tweeto');





const postTweet = async (req, res) => {
    try {
        const { text } = req.body;

        const response = await posttweet(text);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const postTweetWithMedia = async (req, res) => {
    try {
      const form = new formidable.IncomingForm({
        multiples: true,
        keepExtensions: true
      });
  
      const formParse = (form, req) => {
        return new Promise((resolve, reject) => {
          form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
          });
        });
      };
  
      const { fields, files } = await formParse(form, req);
      console.log('Fields:', fields);
      console.log('Files:', files);
  
      const text = fields.text[0]; 
      let mediaFilePath = null;
      if (files.media) {
        if (Array.isArray(files.media)) {
          mediaFilePath = files.media.map(file => file.filepath);
        } else {
          mediaFilePath = files.media.filepath;
        }
      }
  
      let response;
      if (Array.isArray(mediaFilePath)) {
        response = await postTweetWithMultipleMedia(text, mediaFilePath);
      } else if (mediaFilePath) {
        response = await postTweetWithMultipleMedia(text, mediaFilePath);
      } else {
        response = await postTweetWithMultipleMedia(text);
      }
  

      res.status(200).json({
        success: true,
        message: "Tweet posted successfully",
        data: response
      });
      
    } catch (error) {
      console.error("Error in /post-tweet-with-media route:", error);
      res.status(500).json({
        success: false,
        message: "Failed to post tweet",
        error: error.message
      });
    }
  };







const message = async (req, res) => {
  const response = await talkToAI(req.body.message);
  res.json(response);
};







// Helper function to construct the prompt for Claude
function constructTweetPrompt(userDetails) {
  const {
    personality,
    topic,
    tone,
    industry,
    targetAudience,
    includeHashtags,
    includeEmojis,
    tweetLength,
    additionalContext
  } = userDetails;

  return `
    You are a personalized tweet generation assistant. Please write a tweet based on the following details:

    User Personality: ${personality || 'Not specified'}
    Topic to Tweet About: ${topic || 'Not specified'}
    Tone of Voice: ${tone || 'Neutral'}
    Industry/Field: ${industry || 'General'}
    Target Audience: ${targetAudience || 'General public'}
    Include Hashtags: ${includeHashtags ? 'Yes' : 'No'}
    Include Emojis: ${includeEmojis ? 'Yes' : 'No'}
    Tweet Length: ${tweetLength || 'Standard (240-280 characters)'}
    Additional Context: ${additionalContext || 'None provided'}

    Based on this information, please generate a single tweet that captures the user's voice and purpose.
    
    For the image to accompany this tweet, please also provide a short description of what would make an appropriate image for this tweet. This will be used for image generation.
    
    Format your response as a JSON object with these keys:
    - tweetText: the text of the tweet
    - imageDescription: a description of an appropriate image to pair with this tweet
  `;
}



// Tweet generation endpoint
const generateTweet = async (req, res) => {
  try {
    console.log("Generating tweet...");
    const userDetails = req.body;
    console.log(req.body);
    
    // Validate required fields
    if (!userDetails.topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = constructTweetPrompt(userDetails);

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      temperature: 0.7,
      system: "You are a tweet generation assistant that creates engaging, authentic-sounding tweets based on user personality and preferences.",
      messages: [
        { role: "user", content: prompt }
      ]
    });

    // Parse the JSON response from Claude
    let result;
    try {
      // Extract JSON from Claude's response text
      const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback in case Claude doesn't return proper JSON
        result = {
          tweetText: response.content[0].text.split('\n')[0],
          imageDescription: "A relevant image based on the tweet content"
        };
      }
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      result = {
        tweetText: response.content[0].text.substring(0, 280),
        imageDescription: "A relevant image based on the tweet content"
      };
    }

    res.json({
      tweet: result.tweetText,
      imageDescription: result.imageDescription,
      // You would connect to an image API here using the imageDescription
    });
  } catch (error) {
    console.error('Error generating tweet:', error);
    res.status(500).json({ error: 'Failed to generate tweet' });
  }
};

// Image suggestion endpoint (to be integrated with an image generation API)
const suggestImage = async (req, res) => {
  try {
    const { tweetText } = req.body;
    
    if (!tweetText) {
      return res.status(400).json({ error: 'Tweet text is required' });
    }

    const prompt = `
      Based on the following tweet, please suggest a detailed description for an image that would 
      complement this tweet well. The description should be detailed enough for an image generation AI.
      
      Tweet: "${tweetText}"
      
      Provide only the image description, nothing else.
    `;

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 300,
      temperature: 0.7,
      messages: [
        { role: "user", content: prompt }
      ]
    });

    res.json({
      imageDescription: response.content[0].text.trim()
    });
  } catch (error) {
    console.error('Error suggesting image:', error);
    res.status(500).json({ error: 'Failed to suggest image' });
  }
};


module.exports = { postTweet, postTweetWithMedia, generateTweet, suggestImage };