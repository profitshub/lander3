class SmartOfferManager {
    constructor() {
        this.cacheBaseDir = './cache';
        this.cacheOffersDir = './cache/offers';
        this.cacheImagesDir = './cache/images';
        this.offers = [];
        this.payoutData = {};
    }

    async init() {
        // Create cache directories
        await this.ensureDirectories();
        // Load cached payout data
        this.payoutData = await this.loadPayoutData();
    }

    async ensureDirectories() {
        try {
            // Create base cache directory if it doesn't exist
            if (!this.directoryExists(this.cacheBaseDir)) {
                await fs.promises.mkdir(this.cacheBaseDir);
            }
            
            // Create offers directory
            if (!this.directoryExists(this.cacheOffersDir)) {
                await fs.promises.mkdir(this.cacheOffersDir);
            }
            
            // Create images directory
            if (!this.directoryExists(this.cacheImagesDir)) {
                await fs.promises.mkdir(this.cacheImagesDir);
            }
        } catch (error) {
            console.error('Error creating directories:', error);
            // Fall back to localStorage if filesystem access fails
            this.useLocalStorage = true;
        }
    }

    directoryExists(path) {
        try {
            return fs.existsSync(path);
        } catch (error) {
            console.error('Error checking directory:', error);
            return false;
        }
    }

    // Update storage methods to work with both filesystem and localStorage
    async saveToCache(key, data) {
        if (this.useLocalStorage) {
            return this.cacheManager.saveToCache(key, data);
        }
        
        try {
            const filePath = `${this.cacheOffersDir}/${key}.json`;
            await fs.promises.writeFile(filePath, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to cache:', error);
            return false;
        }
    }

    async fetchOffers(geoInfo) {
        const params = new URLSearchParams({
            user_id: "168038",
            pubkey: "c7839a1512ea66f688e4b56a6e8f0f64",
            tracking_id: this.generateTrackingId(),
            limit: 10
        });

        try {
            // First check cache
            const cachedOffers = await this.loadFromCache(geoInfo.country_code);
            if (cachedOffers) {
                return this.sortByPayout(cachedOffers);
            }

            // Fetch fresh offers
            const response = await fetch(`https://www.cpagrip.com/common/offer_feed_json.php?${params.toString()}`);
            const data = await response.json();

            if (data.offers && data.offers.length > 0) {
                // Process and cache offers
                const processedOffers = await this.processOffers(data.offers, geoInfo);
                await this.cacheOffers(processedOffers, geoInfo.country_code);
                return this.sortByPayout(processedOffers);
            }

            return null;
        } catch (error) {
            console.error('Error fetching offers:', error);
            return null;
        }
    }

    async processOffers(offers, geoInfo) {
        return Promise.all(offers.map(async (offer) => {
            // Generate screenshot
            const screenshot = await this.captureOfferPreview(offer);
            
            // Calculate payout score
            const payoutScore = this.calculatePayoutScore(offer, geoInfo);
            
            return {
                ...offer,
                screenshot,
                payoutScore,
                cached_image: await this.cacheImage(offer.image_url, offer.id)
            };
        }));
    }

    async captureOfferPreview(offer) {
        try {
            // Use Puppeteer to capture offer preview
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            
            // Create a preview page for the offer
            await page.setContent(this.generateOfferPreviewHTML(offer));
            
            // Capture screenshot
            const screenshot = await page.screenshot({
                path: `${this.cacheDir}${offer.id}_preview.png`,
                type: 'png',
                fullPage: false,
                clip: { x: 0, y: 0, width: 600, height: 400 }
            });

            await browser.close();
            return `${this.cacheDir}${offer.id}_preview.png`;
        } catch (error) {
            console.error('Screenshot error:', error);
            return null;
        }
    }

    generateOfferPreviewHTML(offer) {
        return `
            <html>
                <head>
                    <style>
                        body { font-family: Arial; margin: 0; padding: 20px; }
                        .offer-card { max-width: 600px; border-radius: 8px; overflow: hidden; }
                        .offer-image { width: 100%; height: 200px; object-fit: cover; }
                        .offer-content { padding: 20px; }
                        .offer-title { font-size: 24px; margin: 0 0 10px 0; }
                        .payout { color: green; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="offer-card">
                        <img class="offer-image" src="${offer.image_url}" alt="${offer.title}">
                        <div class="offer-content">
                            <h2 class="offer-title">${offer.title}</h2>
                            <p>${offer.description}</p>
                            <p class="payout">Payout: $${offer.payout}</p>
                        </div>
                    </div>
                </body>
            </html>
        `;
    }

    calculatePayoutScore(offer, geoInfo) {
        const baseScore = parseFloat(offer.payout) || 0;
        const countryMultiplier = this.getCountryMultiplier(geoInfo.country_code);
        const conversionRate = this.getHistoricalConversionRate(offer.id, geoInfo.country_code);
        
        return baseScore * countryMultiplier * conversionRate;
    }

    async cacheOffers(offers, countryCode) {
        const cacheData = {
            timestamp: Date.now(),
            offers: offers,
            country: countryCode
        };

        await this.saveToFile(
            `${this.cacheDir}offers_${countryCode}.json`,
            JSON.stringify(cacheData)
        );
    }

    sortByPayout(offers) {
        return offers.sort((a, b) => b.payoutScore - a.payoutScore);
    }
}
