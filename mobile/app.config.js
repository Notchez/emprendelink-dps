import { existsSync } from "node:fs";

const configureApp = ({ config }) => {
  const androidGoogleServices =
    process.env.GOOGLE_SERVICES_JSON ||
    (existsSync("./google-services.json") ? "./google-services.json" : undefined);

  return {
    ...config,

    android: {
      ...config.android,
      ...(androidGoogleServices ? { googleServicesFile: androidGoogleServices } : {}),
    },

    ios: {
      ...config.ios,
      ...(existsSync("./GoogleService-Info.plist")
        ? { googleServicesFile: "./GoogleService-Info.plist" }
        : {}),
    },
  };
};

export default configureApp;
