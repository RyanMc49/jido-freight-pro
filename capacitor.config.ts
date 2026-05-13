import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.jidofreight.pro",
  appName: "JIDO FREIGHT",
  webDir: "dist",
  bundledWebRuntime: false,
  server: {
    // In production, uncomment and set your live backend URL:
    // url: "https://api.jidofreight.com",
    // cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#0a0e1a",
      showSpinner: false,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#0a0e1a",
    },
  },
};

export default config;
