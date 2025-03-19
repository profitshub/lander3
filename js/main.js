// Core configuration
const CONFIG = {
    cpagrip: {
        userId: "168038",
        pubkey: "c7839a1512ea66f688e4b56a6e8f0f64",
        vanityDomain: "optidownloader.com"
    },
    // ...other configurations
};

// Core functionality
class OfferManager {
    // ...move offer management logic here
}

// Initialize when document is ready
$(document).ready(() => {
    try {
        const offerManager = new OfferManager();
        offerManager.init();
    } catch (error) {
        console.error('Initialization error:', error);
    }
});
