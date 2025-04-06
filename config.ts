export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    access_token_expiry: process.env.ACCESS_TOKEN_EXPIRY,
    refresh_token_expiry: process.env.REFRESH_TOKEN_EXPIRY,
  },
  smtp: {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  },
  client_url: process.env.CLIENT_URL,
});
