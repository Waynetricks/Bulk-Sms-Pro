import { Contact, Campaign, Message, Group } from '../models';
import smsQueue from '../queue/smsQueue';

export class CampaignService {
  async createCampaign(name: string, message: string, recipients: string[]) {
    const campaign = await Campaign.create({
      name,
      message,
      totalRecipients: recipients.length,
      status: 'draft',
    });

    // Create message records
    const messages = recipients.map((phone) => ({
      campaignId: campaign.id,
      phone,
      message,
      status: 'queued' as const,
    }));

    await Message.bulkCreate(messages, { batchSize: 100 });

    return campaign;
  }

  async sendCampaign(campaignId: string) {
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const messages = await Message.findAll({
      where: { campaignId, status: 'queued' },
    });

    campaign.status = 'sending';
    await campaign.save();

    // Add messages to queue
    for (const message of messages) {
      await smsQueue.add(
        { messageId: message.id },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );
    }

    return campaign;
  }

  async getCampaignStatus(campaignId: string) {
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const messages = await Message.findAll({
      where: { campaignId },
      attributes: ['status'],
    });

    const statusCount = {
      queued: messages.filter((m) => m.status === 'queued').length,
      sent: messages.filter((m) => m.status === 'sent').length,
      delivered: messages.filter((m) => m.status === 'delivered').length,
      failed: messages.filter((m) => m.status === 'failed').length,
    };

    return {
      ...campaign.toJSON(),
      messageStats: statusCount,
    };
  }

  async listCampaigns(limit: number = 20, offset: number = 0) {
    const campaigns = await Campaign.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return campaigns;
  }
}

export class ContactService {
  async addContacts(contacts: Array<{ phone: string; name?: string }>, groupId?: string) {
    const created = await Contact.bulkCreate(
      contacts.map((c) => ({
        phone: c.phone,
        name: c.name,
        groupId,
      })),
      {
        ignoreDuplicates: true,
        batchSize: 100,
      }
    );

    if (groupId) {
      const group = await Group.findByPk(groupId);
      if (group) {
        const count = await Contact.count({ where: { groupId } });
        // Update group contact count in cache or through association
      }
    }

    return created;
  }

  async getContacts(groupId?: string, limit: number = 20, offset: number = 0) {
    const where = groupId ? { groupId } : {};
    const contacts = await Contact.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return contacts;
  }

  async deleteContact(id: string) {
    const contact = await Contact.findByPk(id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    await contact.destroy();
  }
}

export class GroupService {
  async createGroup(name: string, description?: string) {
    return await Group.create({
      name,
      description,
    });
  }

  async listGroups() {
    return await Group.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  async getGroup(id: string) {
    const group = await Group.findByPk(id, {
      include: [{ association: 'contacts' }],
    });

    if (!group) {
      throw new Error('Group not found');
    }

    return group;
  }

  async updateGroup(id: string, name: string, description?: string) {
    const group = await Group.findByPk(id);
    if (!group) {
      throw new Error('Group not found');
    }

    return await group.update({
      name,
      description,
    });
  }

  async deleteGroup(id: string) {
    const group = await Group.findByPk(id);
    if (!group) {
      throw new Error('Group not found');
    }

    // Remove group association from contacts
    await Contact.update(
      { groupId: null },
      { where: { groupId: id } }
    );

    await group.destroy();
  }
}
