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
            // Check cache first
            const cachedOffers = await this.getFromCache(geoInfo.country_code);
            if (cachedOffers) return cachedOffers;

            const params = new URLSearchParams({
                user_id: this.config.userId,
                pubkey: this.config.pubkey,
                tracking_id: this.generateTrackingId(),
                limit: this.config.limit
            });

            const response = await fetch(`${this.config.baseUrl}?${params.toString()}`);
            const data = await response.json();

            if (data.offers && data.offers.length > 0) {
                const processedOffers = await this.processOffers(data.offers, geoInfo);
                await this.cacheOffers(processedOffers, geoInfo.country_code);
                return processedOffers;
            }

            return this.generateMockOffers(geoInfo);
        } catch (error) {
            console.error('Error fetching offers:', error);
            return this.generateMockOffers(geoInfo);
        }
    }

    async processOffers(offers, geoInfo) {
        const processedOffers = offers.map(offer => {
            // Track view
            this.analytics.trackOfferView(offer, { geo: geoInfo });
            
            return {
                ...offer,
                payoutScore: this.calculatePayoutScore(offer, geoInfo),
                vanityUrl: this.createVanityUrl(offer),
                metrics: this.analytics.getOfferMetrics(offer.id)
            };
        });

        // Cache the processed offers
        await this.cache.set(geoInfo.country_code, processedOffers);
        
        return processedOffers.sort((a, b) => b.payoutScore - a.payoutScore);
    }

    calculatePayoutScore(offer, geoInfo) {
        const baseScore = parseFloat(offer.payout) || 0;
        const countryMultiplier = this.getCountryMultiplier(geoInfo.country_code);
        return baseScore * countryMultiplier;
    }

    createVanityUrl(offer) {
        const baseUrl = CONFIG.vanityDomain;
        return offer.offerlink.replace('www.cpagrip.com', baseUrl);
    }

    // ... rest of helper methods ...
}
