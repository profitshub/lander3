const CONFIG = {
    api: {
        cpagrip: {
            // Use static values since GitHub Pages is static hosting
            userId: "168038", 
            pubkey: "c7839a1512ea66f688e4b56a6e8f0f64",
            baseUrl: "https://www.cpagrip.com/common/offer_feed_json.php",
            limit: 6
        },
        geolocation: {
            nominatimUrl: 'https://nominatim.openstreetmap.org/reverse',
            ipDetection: {
                primary: 'https://ipapi.co/json/',
                fallback: 'https://ip-api.com/json/',
                // Add more fallback services if needed
            }
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
