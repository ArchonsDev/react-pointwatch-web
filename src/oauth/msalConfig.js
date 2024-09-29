import { LogLevel } from "@azure/msal-browser";

const msalConfig = {
    auth: {
        clientId: "1808ee47-081f-42ba-be42-b00143d37a23", // Replace with your client ID
        authority: "https://login.microsoftonline.com/823cde44-4433-456d-b801-bdf0ab3d41fc", // Optional, use if needed
        redirectUri: "http://localhost:3000/authorized", // Your redirect URI
    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set to true if using IE
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                }
            },
            level: LogLevel.Info,
        }
    }
};

export default msalConfig;
