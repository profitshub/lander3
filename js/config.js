const CONFIG = {
    api: {
        cpagrip: {
            userId: "168038",
            pubkey: "c7839a1512ea66f688e4b56a6e8f0f64",
            baseUrl: "https://www.cpagrip.com/common/offer_feed_json.php",
            limit: 6
        },
        geolocation: {
            ipApiKey: 'f44c4d56fb7f45d0872c26a2e51a7a2e',
            nominatimUrl: 'https://nominatim.openstreetmap.org/reverse'
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

export default CONFIG;
