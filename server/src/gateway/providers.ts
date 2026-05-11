import { ISMSGatewayProvider } from '../types';
import axios from 'axios';

export class TwilioProvider implements ISMSGatewayProvider {
  private accountSid = process.env.TWILIO_ACCOUNT_SID;
  private authToken = process.env.TWILIO_AUTH_TOKEN;
  private fromNumber = process.env.TWILIO_PHONE_NUMBER;

  async sendMessage(phone: string, message: string): Promise<{ externalId: string }> {
    try {
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          From: this.fromNumber,
          To: phone,
          Body: message,
        },
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
      return { externalId: response.data.sid };
    } catch (error: any) {
      throw new Error(`Twilio error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getDeliveryStatus(externalId: string): Promise<string> {
    try {
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      const response = await axios.get(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages/${externalId}.json`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
      return response.data.status;
    } catch (error: any) {
      throw new Error(`Twilio error: ${error.response?.data?.message || error.message}`);
    }
  }
}

export class AfricasTalkingProvider implements ISMSGatewayProvider {
  private apiKey = process.env.AFRICAS_TALKING_API_KEY;
  private username = process.env.AFRICAS_TALKING_USERNAME;

  async sendMessage(phone: string, message: string): Promise<{ externalId: string }> {
    try {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://api.africastalking.com/version1/messaging'
        : 'https://api.sandbox.africastalking.com/version1/messaging';
      const response = await axios.post(
        baseUrl,
        {
          username: this.username,
          message: message,
          recipients: [phone],
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'apiKey': this.apiKey,
          },
        }
      );
      const result = response.data.SMSMessageData?.Recipients?.[0];
      if (result?.statusCode !== 101) {
        throw new Error(result?.errorMessage || 'Failed to send SMS');
      }
      return { externalId: result.messageId };
    } catch (error: any) {
      throw new Error(`Africa's Talking error: ${error.message}`);
    }
  }

  async getDeliveryStatus(externalId: string): Promise<string> {
    // Africa's Talking uses webhooks for delivery reports
    // This is a placeholder implementation
    return 'sent';
  }
}

export class VonageProvider implements ISMSGatewayProvider {
  private apiKey = process.env.VONAGE_API_KEY;
  private apiSecret = process.env.VONAGE_API_SECRET;
  private fromNumber = process.env.VONAGE_FROM_NUMBER;

  async sendMessage(phone: string, message: string): Promise<{ externalId: string }> {
    try {
      const response = await axios.post(
        'https://rest.nexmo.com/sms/json',
        {
          api_key: this.apiKey,
          api_secret: this.apiSecret,
          to: phone,
          from: this.fromNumber,
          text: message,
        }
      );
      if (response.data.messages[0]['status'] !== '0') {
        throw new Error(response.data.messages[0]['error-text']);
      }
      return { externalId: response.data.messages[0]['message-id'] };
    } catch (error: any) {
      throw new Error(`Vonage error: ${error.message}`);
    }
  }

  async getDeliveryStatus(externalId: string): Promise<string> {
    // Vonage uses webhooks for delivery reports
    return 'sent';
  }
}

export class BriqProvider implements ISMSGatewayProvider {
  private apiKey = process.env.BRIQ_API_KEY;
  private appId = process.env.BRIQ_APP_ID;
  private senderId = process.env.BRIQ_SENDER_ID || 'BRIQ'; // Optional default

  async sendMessage(phone: string, message: string): Promise<{ externalId: string }> {
    try {
      const response = await axios.post(
        'https://karibu.briq.tz/v1/message/send-instant',
        {
          content: message,
          recipients: [phone],
          sender_id: this.senderId,
        },
        {
          headers: {
            'X-API-Key': this.apiKey,
            // 'X-App-ID': this.appId, // Commented out to fix 403 unlinked API key error
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send Briq SMS');
      }

      // Briq returns 'job_id' instead of 'message_id' per phone number
      return { externalId: response.data.job_id };
    } catch (error: any) {
      let errorMsg = error.message;
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data.detail === 'string') {
          errorMsg = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMsg = data.detail[0]?.msg || JSON.stringify(data.detail);
        } else if (data.message) {
          errorMsg = data.message;
        }
      }
      throw new Error(`Briq error: ${errorMsg}`);
    }
  }

  async getDeliveryStatus(externalId: string): Promise<string> {
    // Briq pushes delivery status via webhooks to your defined callback URL
    return 'sent';
  }
}

export class FallbackProvider implements ISMSGatewayProvider {
  private primary: ISMSGatewayProvider;
  private secondary: ISMSGatewayProvider | null;

  constructor(primary: ISMSGatewayProvider, secondary: ISMSGatewayProvider | null = null) {
    this.primary = primary;
    this.secondary = secondary;
  }

  async sendMessage(phone: string, message: string): Promise<{ externalId: string }> {
    try {
      return await this.primary.sendMessage(phone, message);
    } catch (error: any) {
      if (this.secondary) {
        console.warn(`Primary provider failed: ${error.message}. Trying secondary...`);
        return await this.secondary.sendMessage(phone, message);
      }
      throw error;
    }
  }

  async getDeliveryStatus(externalId: string): Promise<string> {
    return this.primary.getDeliveryStatus(externalId);
  }
}

export function getSMSProvider(): ISMSGatewayProvider {
  const providerName = process.env.SMS_PROVIDER || 'twilio';
  const fallbackProviderName = process.env.FALLBACK_SMS_PROVIDER;
  
  let primary: ISMSGatewayProvider;
  switch (providerName) {
    case 'briq':
      primary = new BriqProvider();
      break;
    case 'africas_talking':
      primary = new AfricasTalkingProvider();
      break;
    case 'vonage':
      primary = new VonageProvider();
      break;
    default:
      primary = new TwilioProvider();
  }

  let secondary: ISMSGatewayProvider | null = null;
  if (fallbackProviderName) {
    switch (fallbackProviderName) {
      case 'briq':
        secondary = new BriqProvider();
        break;
      case 'africas_talking':
        secondary = new AfricasTalkingProvider();
        break;
      case 'vonage':
        secondary = new VonageProvider();
        break;
      case 'twilio':
        secondary = new TwilioProvider();
        break;
    }
  }

  return new FallbackProvider(primary, secondary);
}
