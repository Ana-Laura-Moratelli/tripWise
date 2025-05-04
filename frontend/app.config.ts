import 'dotenv/config';

export default {
    expo: {
        name: "tripwise",
        slug: "tripwise",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "myapp",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        splash: {
            image: "./assets/images/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff",
        },
        ios: {
            supportsTablet: true,
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#ffffff",
            },
            edgeToEdgeEnabled: true,
            config: {
                googleMaps: {
                    apiKey: process.env.GOOGLE_MAPS_API_KEY,
                },
            },
        },
        web: {
            favicon: "./assets/images/favicon.png",
            bundler: "metro",
            output: "static"
        },
        extra: {
            googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
        plugins: ["expo-router"],
        experiments: {
            typedRoutes: true
        }
    }
};
