const cache = new Map();
const MAX_CACHE_SIZE = 400 * 1024 * 1024; // 400MB
let currentCacheSize = 0;

// Function to clean the cache every hour
const cleanCache = () => {
  const now = Date.now();
  for (const [key, { timestamp, size }] of cache) {
    // Remove items older than 1 hour
    if (now - timestamp > 3600000) {
      cache.delete(key);
      currentCacheSize -= size;
    }
  }
};

// Function to set cache
const setCache = (key, data) => {
  const size = JSON.stringify(data).length; // Approximate size in bytes
  if (currentCacheSize + size > MAX_CACHE_SIZE) {
    cleanCache(); // Clean cache if size exceeds limit
  }
  cache.set(key, { data, timestamp: Date.now(), size });
  currentCacheSize += size;
};

// Function to get cache
const getCache = (key) => {
  const cachedItem = cache.get(key);
  return cachedItem ? cachedItem.data : null;
};

// Set an interval to clean the cache every hour
setInterval(cleanCache, 3600000);

export { setCache, getCache }; 