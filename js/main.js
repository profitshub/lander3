import CONFIG from './config.js';
import { LocationService } from './services/location-service.js';
import { OfferService } from './services/offer-service.js';
import { DisplayService } from './services/display-service.js';

// Core utility functions only
const Utils = {
    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
            if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
            if (/android/i.test(userAgent)) return "Android";
            return "Mobile";
        }
        return "Desktop";
    },

    detectOS() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/windows/.test(userAgent)) return "Windows";
        if (/mac/.test(userAgent)) return "Mac";
        if (/linux/.test(userAgent)) return "Linux";
        if (/android/.test(userAgent)) return "Android";
        if (/ios|iphone|ipad|ipod/.test(userAgent)) return "iOS";
        return "Unknown";
    },

    generateTrackingId() {
        return `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
};

// Initialize core services
const locationService = new LocationService(CONFIG);
const offerService = new OfferService(CONFIG);
const displayService = new DisplayService(CONFIG);

// Main initialization function
async function initializeApp() {
    try {
        const userInfo = {
            device: Utils.detectDevice(),
            os: Utils.detectOS(),
            language: navigator.language || navigator.userLanguage
        };

        // Start with default location while fetching real location
        const location = await locationService.detectLocation();
        const offers = await offerService.fetchOffers(location);
        displayService.displayOffers(offers, userInfo);
        
    } catch (error) {
        console.error('Initialization error:', error);
        displayService.showError();
    }
}

// Start app when document is ready
$(document).ready(initializeApp);
