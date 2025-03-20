import CONFIG from '../config.js';
import { DisplayService } from './display-service.js';

export class LocationService {
    constructor() {
        this.config = CONFIG.api.geolocation;
        this.cache = new Map();
        this.displayService = new DisplayService(CONFIG);
    }

    async detectLocation() {
        // Step 1: Try browser geolocation first
        try {
            console.log('Requesting browser geolocation...');
            const position = await this.getBrowserLocation();
            if (position) {
                console.log('Browser geolocation successful');
                return await this.getLocationFromCoords(position.coords);
            }
        } catch (error) {
            console.log('Browser geolocation failed:', error.message);
        }

        // Step 2: Fallback to IP-based location
        try {
            console.log('Trying IP-based location...');
            const ipLocation = await this.getIPLocation();
            if (ipLocation.detected) {
                console.log('IP location successful');
                return ipLocation;
            }
        } catch (error) {
            console.log('IP location failed:', error.message);
        }

        // Step 3: Use default location as last resort
        console.log('Using default location');
        return this.getDefaultLocation();
    }

    getBrowserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => {
                    console.log('Geolocation permission granted');
                    resolve(position);
                },
                error => {
                    console.log('Geolocation permission denied or error:', error.message);
                    reject(error);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
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
        try {
            // Single consistent approach for both desktop and mobile
            const response = await fetch('https://ipapi.co/json/', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0',
                    'Referer': window.location.origin
                },
                credentials: 'omit',
                cache: 'no-cache',
                mode: 'cors' // Explicitly set CORS mode
            });

            if (!response.ok) {
                // If primary endpoint fails, try backup endpoint
                return await this.getBackupIPLocation();
            }

            const data = await response.json();
            return {
                country: data.country_name || data.country,
                country_code: data.country_code,
                country_name: data.country_name || data.country,
                city: data.city,
                region: data.region,
                detected: true
            };
        } catch (error) {
            console.warn('Primary IP detection failed:', error);
            return await this.getBackupIPLocation();
        }
    }

    async getBackupIPLocation() {
        try {
            const response = await fetch('https://ip-api.com/json/', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error('Backup IP detection failed');
            }

            const data = await response.json();
            return {
                country: data.country,
                country_code: data.countryCode,
                country_name: data.country,
                city: data.city,
                region: data.regionName,
                detected: true
            };
        } catch (error) {
            console.warn('Backup IP detection failed:', error);
            return this.getDefaultLocation();
        }
    }

    getDefaultLocation() {
        const browserLanguage = navigator.language || navigator.userLanguage;
        return CONFIG.defaultLocation[browserLanguage] || CONFIG.defaultLocation['en-US'];
    }

    getLanguageFromCountry(countryCode) {
        const countryToLanguage = {
            'ES': 'es', // Spain
            'MX': 'es', // Mexico
            'AR': 'es', // Argentina
            'FR': 'fr', // France
            'DE': 'de', // Germany
            'IT': 'it', // Italy
            'JP': 'ja', // Japan
            'KR': 'ko', // South Korea
            'CN': 'zh', // China
            'TW': 'zh', // Taiwan
            'HK': 'zh', // Hong Kong
            'NL': 'nl', // Netherlands
            'SE': 'se', // Sweden
            // Add more country-to-language mappings as needed
        };
        
        return countryToLanguage[countryCode] || 'en';
    }
}
