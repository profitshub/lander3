class CacheManager {
    constructor() {
        this.cacheDir = 'cache/';
        this.imageDir = 'cache/images/';
        this.cacheTime = 24 * 60 * 60 * 1000; // 24 hours
    }

    async checkCache(key) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return null;

            const cached = JSON.parse(data);
            const age = Date.now() - cached.timestamp;

            if (age > this.cacheTime) {
                localStorage.removeItem(key);
                return null;
            }

            return cached.data;
        } catch (error) {
            console.error('Cache error:', error);
            return null;
        }
    }

    async saveToCache(key, data) {
        try {
            const cacheData = {
                timestamp: Date.now(),
                data: data
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
            return true;
        } catch (error) {
            console.error('Cache save error:', error);
            return false;
        }
    }

    async clearExpiredCache() {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
            await this.checkCache(key);
        }
    }
}
