module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.API_PORT || 3000,
  version: process.env.VERSION || 'prod',

  developers: process.env.DEVELOPERS
    ? process.env.DEVELOPERS.split(',').map(id => id.trim())
    : [],

  mongo: {
    uri: process.env.MONGO_URI,
    dbName: process.env.MONGO_DB_NAME,
  },

  jwt: {
    secret: process.env.JWT_SECRET || "c6fcbf11479b44007e6129b",
    sessionExpiry: 24 * 60 * 60 * 1000,
  },

  steam: {
    apiKey: process.env.STEAM_API_KEY,
    appId: process.env.STEAM_APP_ID || 2334220,
  },

  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'api.homesweethomegame.com'
    ],
  },

  server: {
    version: '1.0.0',
  },
};
