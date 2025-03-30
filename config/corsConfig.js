const corsAllowedList = ['http://localhost:5173', 'https://frontend-ten-drab-94.vercel.app','https://tweet.ayushnautiyal.com'];

const corsOptions = {
  origin: (origin, callback) => {
    console.log({origin,env: process.env.ENVIRONMENTNODE});
    if (process.env.ENVIRONMENTNODE === 'development') {
      callback(null, true);
    } 
    else if (corsAllowedList.includes(origin)) {
      callback(null, true);
    }
    else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;