export class CacheService {
    constructor(config) {
        this.config = config;
        this.storage = window.localStorage;
        this.indexedDB = window.indexedDB;
    }

    async init() {
        try {
            await this.setupIndexedDB();
            return true;
        } catch (error) {
            console.warn('IndexedDB failed, falling back to localStorage');
            return false;
        }
    }

    async setupIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = this.indexedDB.open('offerCache', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(true);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('offers')) {
                    db.createObjectStore('offers');
                }
                if (!db.objectStoreNames.contains('images')) {
                    db.createObjectStore('images');
                }
            };
        });
    }

    async get(key, type = 'offers') {
        const data = this.storage.getItem(`${type}_${key}`);
        if (!data) return null;

        const cached = JSON.parse(data);
        if (Date.now() - cached.timestamp > this.config.cache.duration) {
            this.storage.removeItem(`${type}_${key}`);
            return null;
        }

        return cached.data;
    }

    async set(key, data, type = 'offers') {
        const cacheData = {
            timestamp: Date.now(),
            data: data
        };
        this.storage.setItem(`${type}_${key}`, JSON.stringify(cacheData));
    }
}
