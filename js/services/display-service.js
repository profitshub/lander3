export class DisplayService {
    constructor(config) {
        this.config = config;
        this.currentOffers = [];
        this.currentIndex = 0;
        this.imageService = new ImageService();
    }

    displayOffers(offers, userInfo = {}) {
        // Ensure userInfo has default values
        this.userInfo = {
            device: userInfo.device || 'Desktop',
            language: userInfo.language || 'en-US',
            geo: userInfo.geo || {
                country: 'United States',
                country_code: 'US'
            }
        };

        this.currentOffers = offers;
        this.currentIndex = 0;
        
        const offersContainer = document.getElementById("offers");
        if (!offers || offers.length === 0) {
            this.showError();
            return;
        }

        this.displaySingleOffer(this.currentIndex);
        this.updateNavigation();
        this.setupEventListeners();
    }

    displaySingleOffer(index) {
        const offer = this.currentOffers[index];
        const container = document.getElementById("offers");
        
        const offerCard = document.createElement("div");
        offerCard.className = "offer-card";
        
        // Use direct image URL with reliable fallback
        const imageUrl = offer.image_url || this.generatePlaceholder(offer.title);
        
        offerCard.innerHTML = `
            <div class="offer-image-container">
                <img class="offer-image" 
                     src="${imageUrl}" 
                     alt="${offer.title}"
                     onerror="this.onerror=null; this.src='${this.generatePlaceholder(offer.title)}'">
            </div>
            <div class="offer-content">
                <h3 class="offer-title">${offer.title}</h3>
                <p class="offer-description">${offer.description || 'Click to access premium content instantly'}</p>
                <div class="offer-features">
                    ${this.getFeaturesList(offer)}
                </div>
                <a href="${this.getOfferUrl(offer)}" class="cta-button" target="_blank">
                    ${this.getCtaText(offer)}
                </a>
            </div>
        `;
        
        container.innerHTML = '';
        container.appendChild(offerCard);
        
        // Force reflow and add active class
        void offerCard.offsetWidth;
        offerCard.classList.add('active');
        
        this.updateProgress(index);
        
        // Add popunder to button
        const button = offerCard.querySelector('.cta-button');
        if (typeof addPopunderToButton === 'function') {
            addPopunderToButton(button);
        }
    }

    createOfferCard(offer) {
        const card = document.createElement('div');
        card.className = 'offer-card';
        
        // Use built-in placeholder
        const imageUrl = offer.image_url || this.generatePlaceholder(offer.title);
        
        card.innerHTML = `
            <div class="offer-image-container">
                <img class="offer-image" 
                     src="${imageUrl}" 
                     alt="${offer.title}">
            </div>
            <div class="offer-content">
                <h3 class="offer-title">${offer.title}</h3>
                <p class="offer-description">${offer.description || 'Exclusive premium content'}</p>
                <div class="offer-features">
                    ${this.getFeaturesList(offer)}
                </div>
                <a href="${this.getOfferUrl(offer)}" class="cta-button" target="_blank">
                    ${this.getCtaText(offer)}
                </a>
            </div>
        `;
        
        // Add popunder to button
        const button = card.querySelector('.cta-button');
        if (typeof addPopunderToButton === 'function') {
            addPopunderToButton(button);
        }
        
        return card;
    }

    getFeaturesList(offer) {
        const defaultFeatures = ["Premium Access", "Instant Download", "24/7 Support"];
        const features = offer.features || defaultFeatures;
        
        return features.map(feature => `
            <div class="offer-highlight">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                ${feature}
            </div>
        `).join('');
    }

    getCtaText(offer) {
        const ctaTexts = {
            'games': 'Play Now',
            'software': 'Download Now',
            'utilities': 'Get Access',
            'streaming': 'Stream Now'
        };
        return ctaTexts[offer.category] || 'Get Access Now';
    }

    getOfferUrl(offer) {
        return offer.vanityUrl || offer.target_url || offer.offerlink;
    }

    generatePlaceholder(text) {
        return this.createCanvasPlaceholder(text);
    }

    createCanvasPlaceholder(text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 400;
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#f3f4f6');
        gradient.addColorStop(1, '#e5e7eb');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#4b5563';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width/2, canvas.height/2);
        
        return canvas.toDataURL('image/png');
    }

    updateProgress(index) {
        const progressIndicator = document.getElementById("offerProgress");
        progressIndicator.textContent = `Offer ${index + 1} of ${this.currentOffers.length}`;
    }

    setupEventListeners() {
        document.getElementById('prevOffer').onclick = () => this.showPreviousOffer();
        document.getElementById('nextOffer').onclick = () => this.showNextOffer();
    }

    showError() {
        const container = document.getElementById("offers");
        container.innerHTML = `
            <div class="error-state">
                <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <h3>No Offers Available</h3>
                <p>Please try again later</p>
            </div>
        `;
    }

    updateNavigation() {
        const prevButton = document.getElementById('prevOffer');
        const nextButton = document.getElementById('nextOffer');
        
        prevButton.disabled = this.currentIndex === 0;
        nextButton.disabled = this.currentIndex === this.currentOffers.length - 1;
    }

    showNextOffer() {
        if (this.currentIndex < this.currentOffers.length - 1) {
            this.currentIndex++;
            this.displaySingleOffer(this.currentIndex);
            this.updateNavigation();
        }
    }

    showPreviousOffer() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.displaySingleOffer(this.currentIndex);
            this.updateNavigation();
        }
    }
}
