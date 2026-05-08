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
      const response = await axios.post(
        'https://api.sandbox.africastalking.com/version1/messaging',
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

export function getSMSProvider(): ISMSGatewayProvider {
  const provider = process.env.SMS_PROVIDER || 'twilio';
  switch (provider) {
    case 'africas_talking':
      return new AfricasTalkingProvider();
    case 'vonage':
      return new VonageProvider();
    default:
      return new TwilioProvider();
  }
}
