const CONFIG = {
    api: {
        cpagrip: {
            userId: NETLIFY_ENV_USER_ID || "168038", // Will be replaced by Netlify
            pubkey: NETLIFY_ENV_PUB_KEY || "c7839a1512ea66f688e4b56a6e8f0f64",
            baseUrl: "https://www.cpagrip.com/common/offer_feed_json.php",
            limit: 6
        },
        geolocation: {
            ipApiKey: "f44c4d56fb7f45d0872c26a2e51a7a2e",
            nominatimUrl: 'https://nominatim.openstreetmap.org/reverse'
        }
    },
    security: {
        allowedDomains: JSON.parse(process.env.ALLOWED_DOMAINS),
        headers: {
            'Content-Security-Policy': "default-src 'self'",
            'X-Frame-Options': 'SAMEORIGIN',
            'X-Content-Type-Options': 'nosniff'
        }
    },
    cache: {
        duration: 24 * 60 * 60 * 1000, // 24 hours
        prefix: {
            offers: 'offers_',
            images: 'images_'
        }
    },
    defaultLocation: {
        'en-US': {
            country: "United States",
            country_code: "US",
            country_name: "United States",
            city: "New York",
            region: "NY"
        }
    },
    vanityDomain: "optidownloader.com"
};

// Load production config if available
if (typeof PROD_CONFIG !== 'undefined') {
    CONFIG.api.cpagrip = {
        ...CONFIG.api.cpagrip,
        ...PROD_CONFIG.api.cpagrip
    };
}

export default CONFIG;
