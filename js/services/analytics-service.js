export class AnalyticsService {
    constructor(config) {
        this.config = config;
        this.metrics = new Map();
    }

    trackOfferView(offer, userInfo) {
        const key = `${offer.id}_views`;
        const count = this.metrics.get(key) || 0;
        this.metrics.set(key, count + 1);
        
        // Track by country
        const countryKey = `${offer.id}_${userInfo.geo.country_code}`;
        const countryCount = this.metrics.get(countryKey) || 0;
        this.metrics.set(countryKey, countryCount + 1);
    }

    trackOfferClick(offer, userInfo) {
        const key = `${offer.id}_clicks`;
        const count = this.metrics.get(key) || 0;
        this.metrics.set(key, count + 1);
        
        // Calculate CTR
        const views = this.metrics.get(`${offer.id}_views`) || 0;
        const ctr = views ? (count + 1) / views : 0;
        this.metrics.set(`${offer.id}_ctr`, ctr);
    }

    getOfferMetrics(offerId) {
        return {
            views: this.metrics.get(`${offerId}_views`) || 0,
            clicks: this.metrics.get(`${offerId}_clicks`) || 0,
            ctr: this.metrics.get(`${offerId}_ctr`) || 0
        };
    }
}
