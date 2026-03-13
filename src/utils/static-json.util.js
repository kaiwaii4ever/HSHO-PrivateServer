const fs = require('fs').promises;
const path = require('path');

class StaticJsonUtil {
  constructor() {
    this.cache = new Map();
    this.cacheEnabled = process.env.NODE_ENV === 'production';
  }

  serve(jsonPath) {
    return async (req, res) => {
      try {
        const data = await this.load(jsonPath);
        res.json(data);
      } catch (error) {
        console.error(`Error serving ${jsonPath}:`, error);
        res.status(500).json({
          status: 0,
          data: null,
          error: 'Failed to load data'
        });
      }
    };
  }

  async load(jsonPath) {
    if (this.cacheEnabled && this.cache.has(jsonPath)) {
      return this.cache.get(jsonPath);
    }

    const fullPath = path.join(__dirname, '../../data', jsonPath);
    const fileContent = await fs.readFile(fullPath, 'utf8');
    const data = JSON.parse(fileContent);

    if (this.cacheEnabled) {
      this.cache.set(jsonPath, data);
    }

    return data;
  }

  clearCache(jsonPath) {
    if (jsonPath) {
      this.cache.delete(jsonPath);
      console.log(`Cache cleared for: ${jsonPath}`);
    } else {
      this.cache.clear();
      console.log('All cache cleared');
    }
  }

  async reload(jsonPath) {
    this.cache.delete(jsonPath);
    return await this.load(jsonPath);
  }
}

module.exports = new StaticJsonUtil();
