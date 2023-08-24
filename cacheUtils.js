const fs = require('fs');
const path = require('path');

const cachePath = path.join(__dirname, 'dataCache.json');

// Save data to cache with a timestamp
function saveToCache(data) {
  const cacheData = {
    timestamp: Date.now(),
    data: data
  };
  fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
}

// Read data from cache
function readFromCache() {
  if (fs.existsSync(cachePath)) {
    const rawData = fs.readFileSync(cachePath, 'utf8');
    return JSON.parse(rawData);
  }
  return null;
}

module.exports = { saveToCache, readFromCache };
