const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];
const WARN_ONLY = ['GROQ_API_KEY', 'IMAGEKIT_PRIVATE_KEY', 'IMAGEKIT_PUBLIC_KEY', 'IMAGEKIT_URL_ENDPOINT'];

const validateEnv = () => {
  const missing = REQUIRED.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  const missingWarn = WARN_ONLY.filter(key => !process.env[key]);
  if (missingWarn.length > 0) {
    console.warn(`WARNING: Optional env vars not set: ${missingWarn.join(', ')} — some features may be degraded.`);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    console.warn('WARNING: JWT_SECRET is too short (< 16 chars). Use a strong random string in production.');
  }

  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB: ${process.env.MONGO_URI ? 'configured' : 'missing'}`);
  console.log(`JWT: ${process.env.JWT_SECRET ? 'configured' : 'missing'}`);
  console.log(`GROQ: ${process.env.GROQ_API_KEY ? 'configured' : 'not set'}`);
  console.log(`ImageKit: ${process.env.IMAGEKIT_PRIVATE_KEY ? 'configured' : 'not set'}`);
};

module.exports = validateEnv;