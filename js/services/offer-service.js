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
            // Use secured configuration
            const params = new URLSearchParams({
                user_id: this.config.userId,
                pubkey: this.config.pubkey,
                tracking_id: this.generateSecureTrackingId(),
                limit: 6
            });

            // Validate domain
            const url = `${this.config.baseUrl}?${params.toString()}`;
            if (!this.isAllowedDomain(url)) {
                throw new Error('Invalid domain');
            }

            // Show loading state first
            document.getElementById("offers").innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
            `;

            const response = await fetch(url);
            const data = await response.json();

            if (!data.offers || data.offers.length === 0) {
                return this.generateMockOffers(geoInfo);
            }

            return this.processOffers(data.offers, geoInfo);
        } catch (error) {
            console.error('Secure offer fetch error:', error);
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
