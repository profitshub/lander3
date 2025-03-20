import CONFIG from '../config.js';
import { CacheService } from './cache-service.js';
import { AnalyticsService } from './analytics-service.js';

export class OfferService {
    constructor() {
        this.config = CONFIG.api.cpagrip;
        this.cache = new CacheService(CONFIG);
        this.analytics = new AnalyticsService(CONFIG);
    }

    async init() {
        await this.cache.init();
    }

    async fetchOffers(geoInfo) {
        try {
            // Add location parameters to the request
            const params = new URLSearchParams({
                user_id: this.config.userId,
                pubkey: this.config.pubkey,
                tracking_id: this.generateSecureTrackingId(),
                limit: 6,
                // Add location parameters
                country: geoInfo.country_code || 'US',
                city: geoInfo.city || '',
                region: geoInfo.region || '',
                // Add language targeting
                language: navigator.language || 'en-US'
            });

            // Log location info for debugging
            console.log('Fetching offers for location:', {
                country: geoInfo.country_code,
                city: geoInfo.city,
                region: geoInfo.region
            });

            const url = `${this.config.baseUrl}?${params.toString()}`;
            const response = await fetch(url);
            const data = await response.json();

            if (!data.offers || data.offers.length === 0) {
                console.log('No offers found for location, using mock offers');
                return this.generateMockOffers(geoInfo);
            }

            // Filter offers by location relevance
            const locationFiltered = data.offers.filter(offer => {
                // Check if offer has location targeting
                if (offer.allowed_countries) {
                    return offer.allowed_countries.includes(geoInfo.country_code);
                }
                return true; // Include if no specific targeting
            });

            // Sort offers by location relevance
            const sortedOffers = locationFiltered.sort((a, b) => {
                // Prioritize offers specifically targeted to user's country
                const aTargeted = a.allowed_countries?.includes(geoInfo.country_code) ? 1 : 0;
                const bTargeted = b.allowed_countries?.includes(geoInfo.country_code) ? 1 : 0;
                return bTargeted - aTargeted;
            });

            console.log(`Found ${sortedOffers.length} relevant offers for location`);
            return this.processOffers(sortedOffers, geoInfo);
        } catch (error) {
            console.error('Error fetching location-based offers:', error);
            return this.generateMockOffers(geoInfo);
        }
    }

    processOffers(offers, geoInfo) {
        return offers.map(offer => ({
            ...offer,
            vanityUrl: this.createVanityUrl(offer),
            // Add location relevance flag
            locationRelevant: offer.allowed_countries?.includes(geoInfo.country_code) || false
        }));
    }

    generateTrackingId() {
        return `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    generateSecureTrackingId() {
        const array = new Uint32Array(2);
        crypto.getRandomValues(array);
        return `tr_${array[0]}${array[1]}`;
    }

    createVanityUrl(offer) {
        return offer.offerlink.replace('www.cpagrip.com', CONFIG.vanityDomain);
    }

    generateMockOffers(geoInfo) {
        return [
            {
                id: 'mock-1',
                title: 'Premium Software Package',
                description: 'Access premium software with all features unlocked',
                image_url: this.generatePlaceholderUrl('Premium Software'),
                offerlink: `https://${this.config.vanityDomain}/offer/premium-software`,
                features: ['Full Access', 'No Restrictions', '24/7 Support']
            },
            // Add 2-3 more mock offers
        ];
    }

    generatePlaceholderUrl(text) {
        // Use data URI instead of external service
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 300;
        
        ctx.fillStyle = '#3498db';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width/2, canvas.height/2);
        
        return canvas.toDataURL('image/png');
    }

    isAllowedDomain(url) {
        try {
            const domain = new URL(url).hostname;
            return CONFIG.security.allowedDomains.includes(domain);
        } catch {
            return false;
        }
    }
}
