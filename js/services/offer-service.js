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
            const params = new URLSearchParams({
                user_id: this.config.userId,
                pubkey: this.config.pubkey,
                tracking_id: this.generateTrackingId(),
                limit: 6
            });

            // Show loading state first
            document.getElementById("offers").innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
            `;

            const response = await fetch(`${this.config.baseUrl}?${params.toString()}`);
            const data = await response.json();

            if (!data.offers || data.offers.length === 0) {
                return this.generateMockOffers(geoInfo);
            }

            return this.processOffers(data.offers, geoInfo);
        } catch (error) {
            console.error('CPA Grip API error:', error);
            return this.generateMockOffers(geoInfo);
        }
    }

    processOffers(offers, geoInfo) {
        return offers.map(offer => ({
            ...offer,
            vanityUrl: this.createVanityUrl(offer)
        }));
    }

    generateTrackingId() {
        return `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
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
}
