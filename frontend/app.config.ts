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
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      bundleIdentifier: "com.analaura.tripwise",
      supportsTablet: true,
      infoPlist: {
        NSCalendarsUsageDescription: "Precisamos acessar seu calendário para adicionar eventos das viagens.",
        NSRemindersUsageDescription: "Precisamos acessar seus lembretes para agendar as atividades da viagem.",
      },
    },
    android: {
      package: "com.analaura.tripwise",
      softInputMode: "adjustResize",
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
      GEOAPIFY_API_KEY: process.env.GEOAPIFY_API_KEY,
      "eas": {
        "projectId": "91733a12-f30e-4664-a881-15c6b092c499"
      }
    },
    plugins: [
      'expo-notifications',
      'expo-router',
      'expo-image-picker',
      [
        'expo-build-properties',
        {
          android: {
            'useNextNotificationsApi': true,
            manifest: {
              application: {
                'android:windowSoftInputMode': 'adjustResize'
              }
            }
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
  }
};
