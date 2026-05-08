import Queue from 'bull';
import { Message, Campaign } from '../models';
import { getSMSProvider } from '../gateway/providers';
import redisClient from '../config/redis';

const smsQueue = new Queue('sms-queue', process.env.REDIS_URL || '');

smsQueue.process(parseInt(process.env.QUEUE_CONCURRENCY || '10'), async (job) => {
  const { messageId } = job.data;
  const message = await Message.findByPk(messageId);

  if (!message) {
    throw new Error('Message not found');
  }

  try {
    const provider = getSMSProvider();
    const result = await provider.sendMessage(message.phone, message.message);

    await message.update({
      status: 'sent',
      externalId: result.externalId,
    });

    // Update campaign stats
    const campaign = await Campaign.findByPk(message.campaignId);
    if (campaign) {
      await campaign.increment('sentCount');
    }

    return { success: true };
  } catch (error: any) {
    await message.update({
      status: 'failed',
      errorMessage: error.message,
    });

    // Update campaign stats
    const campaign = await Campaign.findByPk(message.campaignId);
    if (campaign) {
      await campaign.increment('failedCount');
    }

    throw error;
  }
});

smsQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

smsQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

export default smsQueue;
