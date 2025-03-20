import CONFIG from '../config.js';

export class LocationService {
    constructor() {
        this.config = CONFIG.api.geolocation;
        this.cache = new Map();
    }

    async detectLocation() {
        try {
            // Try browser geolocation first
            const position = await this.getBrowserLocation();
            if (position) {
                return this.getLocationFromCoords(position.coords);
            }
        } catch (error) {
            console.log('Browser geolocation failed, trying IP');
        }

        try {
            // Fallback to IP-based location
            return await this.getIPLocation();
        } catch (error) {
            console.log('IP location failed, using default');
            return this.getDefaultLocation();
        }
    }

    getBrowserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 0
            });
        });
    }

    async getLocationFromCoords(coords) {
        const { latitude, longitude } = coords;
        const url = `${this.config.nominatimUrl}?format=json&lat=${latitude}&lon=${longitude}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        return {
            country: data.address.country,
            country_code: data.address.country_code?.toUpperCase() || "Unknown",
            country_name: data.address.country || "your area",
            city: data.address.city || data.address.town || "",
            region: data.address.state || "",
            detected: true
        };
    }

    async getIPLocation() {
        const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${this.config.ipApiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        
        return {
            country: data.country_name,
            country_code: data.country_code2,
            country_name: data.country_name,
            city: data.city,
            region: data.state_prov,
            detected: true
        };
    }

    getDefaultLocation() {
        const browserLanguage = navigator.language || navigator.userLanguage;
        return CONFIG.defaultLocation[browserLanguage] || CONFIG.defaultLocation['en-US'];
    }
}
