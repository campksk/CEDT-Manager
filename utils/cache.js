const NodeCache = require('node-cache');

// Create a new cache instance
// stdTTL: 3600 means data will automatically expire and clear after 1 hour (3600 seconds)
// checkperiod: 600 means the cache will check for expired data every 10 minutes to free up memory
const appCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

module.exports = appCache;