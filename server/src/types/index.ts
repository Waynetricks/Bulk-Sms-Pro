export interface IContact {
  id: string;
  phone: string;
  name?: string;
  groupId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGroup {
  id: string;
  name: string;
  description?: string;
  contactCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICampaign {
  id: string;
  name: string;
  message: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  id: string;
  campaignId: string;
  phone: string;
  message: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  externalId?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISMSGatewayProvider {
  sendMessage(phone: string, message: string): Promise<{ externalId: string }>;
  getDeliveryStatus(externalId: string): Promise<string>;
}
