import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'SMS_PROVIDER',
  'JWT_SECRET',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    'Missing required environment variables:',
    missingEnvVars.join(', ')
  );
  process.exit(1);
}

// Validate SMS provider credentials
const smsProvider = process.env.SMS_PROVIDER;

if (smsProvider === 'twilio') {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.error('Twilio credentials not configured');
    process.exit(1);
  }
} else if (smsProvider === 'africas_talking') {
  if (!process.env.AFRICAS_TALKING_API_KEY || !process.env.AFRICAS_TALKING_USERNAME) {
    console.error('Africa\'s Talking credentials not configured');
    process.exit(1);
  }
} else if (smsProvider === 'vonage') {
  if (!process.env.VONAGE_API_KEY || !process.env.VONAGE_API_SECRET) {
    console.error('Vonage credentials not configured');
    process.exit(1);
  }
}

console.log('Environment validation passed');
