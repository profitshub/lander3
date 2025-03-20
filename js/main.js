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
        // Get initial location
        const defaultLocation = {
            country: "United States",
            country_code: "US",
            country_name: "United States",
            city: "New York",
            region: "NY"
        };

        // Fetch and display offers
        const offers = await offerService.fetchOffers(defaultLocation);
        if (offers && offers.length > 0) {
            displayService.displayOffers(offers, {
                device: 'Desktop',
                language: navigator.language
            });
        } else {
            displayService.showError();
        }

        // Start other features
        startCountdown();
        simulateVisitors();
        showRecentActivity();

    } catch (error) {
        console.error('Initialization error:', error);
        displayService.showError();
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', initializeApp);
