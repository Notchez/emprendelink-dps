import { existsSync } from "node:fs";

const configureApp = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    ...(existsSync("./google-services.json") ? { googleServicesFile: "./google-services.json" } : {}),
  },
  ios: {
    ...config.ios,
    ...(existsSync("./GoogleService-Info.plist") ? { googleServicesFile: "./GoogleService-Info.plist" } : {}),
  },
});

export default configureApp;
