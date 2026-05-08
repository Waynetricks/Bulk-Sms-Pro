import { Router, Request, Response } from 'express';
import { CampaignService, ContactService, GroupService } from '../services';
import { sendLimiter } from '../middleware/error';

const router = Router();
const campaignService = new CampaignService();
const contactService = new ContactService();
const groupService = new GroupService();

// Campaign Routes
router.post('/campaigns', sendLimiter, async (req: Request, res: Response) => {
  try {
    const { name, message, recipients } = req.body;

    if (!name || !message || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const campaign = await campaignService.createCampaign(name, message, recipients);
    res.status(201).json(campaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/campaigns', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const campaigns = await campaignService.listCampaigns(limit, offset);
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/campaigns/:id', async (req: Request, res: Response) => {
  try {
    const campaign = await campaignService.getCampaignStatus(req.params.id);
    res.json(campaign);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/campaigns/:id/send', sendLimiter, async (req: Request, res: Response) => {
  try {
    const campaign = await campaignService.sendCampaign(req.params.id);
    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Contact Routes
router.post('/contacts', async (req: Request, res: Response) => {
  try {
    const { contacts, groupId } = req.body;

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: 'Invalid contacts format' });
    }

    const created = await contactService.addContacts(contacts, groupId);
    res.status(201).json({ count: created.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/contacts', async (req: Request, res: Response) => {
  try {
    const groupId = req.query.groupId as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const contacts = await contactService.getContacts(groupId, limit, offset);
    res.json(contacts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/contacts/:id', async (req: Request, res: Response) => {
  try {
    await contactService.deleteContact(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// Group Routes
router.post('/groups', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Group name required' });
    }

    const group = await groupService.createGroup(name, description);
    res.status(201).json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/groups', async (req: Request, res: Response) => {
  try {
    const groups = await groupService.listGroups();
    res.json(groups);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/groups/:id', async (req: Request, res: Response) => {
  try {
    const group = await groupService.getGroup(req.params.id);
    res.json(group);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/groups/:id', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const group = await groupService.updateGroup(req.params.id, name, description);
    res.json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/groups/:id', async (req: Request, res: Response) => {
  try {
    await groupService.deleteGroup(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook Routes
router.post('/webhooks/delivery-report', async (req: Request, res: Response) => {
  try {
    const { externalId, status } = req.body;

    if (!externalId || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find and update message
    const message = await Message.findOne({ where: { externalId } });
    if (message) {
      await message.update({ status: status || 'delivered' });

      // Update campaign stats
      if (status === 'delivered') {
        const campaign = await Campaign.findByPk(message.campaignId);
        if (campaign) {
          await campaign.increment('deliveredCount');
        }
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import { Message, Campaign } from '../models';
