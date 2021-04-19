const config = {
    backendApiBaseUri: 'api',
};

if (process.env.hasOwnProperty('NODE_ENV') && process.env.NODE_ENV === 'development') {
    config.backendApiBaseUri = 'https://preprod.app.logbuddy.io/api';
}

export default config;
