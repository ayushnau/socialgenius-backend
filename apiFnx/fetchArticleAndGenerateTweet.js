const { postTweetWithMultipleMedia } = require("./tweeto");
const axios = require('axios');
const anthropic = require('../config/anthropic');



// Array of personal commentary styles to rotate through
const personalTouchStyles = [
    "I found this fascinating",
    "This could change everything",
    "My thoughts on this",
    "Been following this closely",
    "Can't stop thinking about",
    "Worth your time",
    "Hot take",
    "Just read this",
    "Unpopular opinion",
    "Game-changer alert"
  ];
  
  // Function to fetch AI and tech news articles using NewsAPI
  async function fetchNewsArticles() {
    try {
      // Using your provided NewsAPI key
      const apiKey = process.env.NEWS_API_KEY;
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      // Make request to NewsAPI
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'AI OR "artificial intelligence" OR "machine learning" OR tech OR programming',
          from: today,
          sortBy: 'popularity',
          language: 'en',
          pageSize: 10,
          apiKey: apiKey
        }
      });
      
      if (response.data && response.data.articles && response.data.articles.length > 0) {
        return response.data.articles;
      }
      
      // If no results from today, try with a broader date range
      const response2 = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: 'AI OR "artificial intelligence" OR "machine learning" OR tech OR programming',
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 10,
          apiKey: apiKey
        }
      });
      
      if (response2.data && response2.data.articles && response2.data.articles.length > 0) {
        return response2.data.articles;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching news articles:', error);
      return [];
    }
  }
  
  // Function to generate tweet content from a news article with personal touch
  async function generateTweetFromArticle(article) {
    try {
      // Select a random personal touch style
      const personalStyle = personalTouchStyles[Math.floor(Math.random() * personalTouchStyles.length)];
      
      const prompt = `
        You are my personalized tweet ghostwriter. Please write a tweet in my voice based on this news article:
  
        Article Title: ${article.title}
        Article Description: ${article.description || 'Not available'}
        Article Source: ${article.source?.name || 'Tech News'}
        
        Use this personal commentary style: "${personalStyle}"
        
        Guidelines:
        - Write as if I'm sharing this with my followers, adding my personal perspective
        - Be conversational and authentic - avoid corporate or news-speak
        - Share a brief opinion, question, or reflection that shows I've thought about this
        - Include 1-2 relevant hashtags
        - Keep it under 200 characters to leave room for the URL
        - Sound like a real person, not a news bot
        - I'm a software engineer so make it sound professional and tech-savvy
        
        Format your response as a JSON object with these keys:
        - tweetText: the text of the tweet
      `;
  
      const response = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 500,
        temperature: 0.8,
        system: "You are a personal tech tweet ghostwriter who writes in the authentic voice of a tech-savvy software engineer. You're knowledgeable about AI, programming, and tech trends, and add personal perspective to everything you share.",
        messages: [
          { role: "user", content: prompt }
        ]
      });
  
      // Extract JSON from Claude's response
      const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        // Append the article URL to the tweet
        return `${result.tweetText} ${article.url}`;
      } else {
        // Fallback if JSON parsing fails
        const personalPrefix = `${personalStyle}: `;
        const tweetBody = response.content[0].text.substring(0, 180 - personalPrefix.length);
        return `${personalPrefix}${tweetBody}... ${article.url}`;
      }
    } catch (error) {
      console.error('Error generating tweet from article:', error);
      // Fallback tweet format if Claude fails
      const personalPrefix = `${personalTouchStyles[0]}: `;
      return `${personalPrefix}${article.title.substring(0, 180 - personalPrefix.length)}... ${article.url} #TechNews`;
    }
  }
  
  // Function to post AI/tech news tweet
  async function postAutomatedNewsTweet() {
    try {
      console.log("Fetching news articles...");
      const articles = await fetchNewsArticles();
      
      if (articles.length === 0) {
        console.log("No articles found");
        return;
      }
      
      // Select a random article from the top results
      const randomIndex = Math.floor(Math.random() * Math.min(articles.length, 5));
      const selectedArticle = articles[randomIndex];
      
      console.log(`Selected article: ${selectedArticle.title}`);
      
      // Generate tweet text with personal touch
      const tweetText = await generateTweetFromArticle(selectedArticle);
      
      console.log("Tweet text:", tweetText);
      // Post the tweet
      const response = await postTweetWithMultipleMedia(tweetText);
      
      console.log("Automated personal news tweet posted successfully:", {});
      return {success: true};
    } catch (error) {
      console.error("Error posting automated news tweet:", error);
    }
  }
  

  
module.exports = { postAutomatedNewsTweet };