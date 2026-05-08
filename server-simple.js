const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Twilio if credentials are provided
let twilio = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio initialized successfully');
  } catch (err) {
    console.log('⚠️ Twilio not available, using mock mode');
  }
}

// Mock data
let campaigns = [];
let contacts = [];
let groups = [];
let messages = [];

// Health check
app.get('/health', (req, res) => {
  console.log('✓ Health check');
  res.json({ status: 'OK', message: 'Server running' });
});

// Campaign endpoints
app.post('/api/campaigns', (req, res) => {
  const { name, message, recipients } = req.body;
  console.log(`📨 Creating campaign: "${name}" with ${recipients.length} recipients`);
  
  const campaign = {
    id: Date.now().toString(),
    name,
    message,
    totalRecipients: recipients.length,
    sentCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    status: 'draft',
    recipients,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  campaigns.push(campaign);
  console.log(`✓ Campaign created with ID: ${campaign.id}`);
  res.status(201).json(campaign);
});

app.get('/api/campaigns', (req, res) => {
  console.log(`📋 Fetching campaigns (total: ${campaigns.length})`);
  res.json({ data: campaigns, rows: campaigns, total: campaigns.length });
});

app.get('/api/campaigns/:id', (req, res) => {
  const campaign = campaigns.find(c => c.id === req.params.id);
  console.log(`📋 Fetching campaign ${req.params.id}: ${campaign ? 'found' : 'not found'}`);
  if (!campaign) return res.status(404).json({ error: 'Not found' });
  res.json(campaign);
});

app.post('/api/campaigns/:id/send', async (req, res) => {
  const campaign = campaigns.find(c => c.id === req.params.id);
  console.log(`📤 Sending campaign ${req.params.id}: ${campaign ? 'found' : 'not found'}`);
  if (!campaign) return res.status(404).json({ error: 'Not found' });
  
  campaign.status = 'sending';
  res.json(campaign);
  
  // Send SMS in background
  if (twilio) {
    console.log(`🚀 Sending ${campaign.recipients.length} SMS via Twilio...`);
    sendSMSWithTwilio(campaign);
  } else {
    console.log(`📱 Mock mode: Simulating SMS delivery...`);
    simulateSMSDelivery(campaign);
  }
});

// Send SMS using Twilio
async function sendSMSWithTwilio(campaign) {
  let sent = 0;
  let failed = 0;
  
  for (const phone of campaign.recipients) {
    try {
      const message = await twilio.messages.create({
        body: campaign.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
      console.log(`✅ SMS sent to ${phone} (SID: ${message.sid})`);
      sent++;
    } catch (error) {
      console.error(`❌ Failed to send SMS to ${phone}: ${error.message}`);
      failed++;
    }
  }
  
  campaign.status = 'completed';
  campaign.sentCount = sent;
  campaign.deliveredCount = sent;
  campaign.failedCount = failed;
  console.log(`✅ Campaign ${campaign.id} completed! Sent: ${sent}, Failed: ${failed}`);
}

// Simulate SMS delivery (mock mode)
function simulateSMSDelivery(campaign) {
  setTimeout(() => {
    campaign.status = 'completed';
    campaign.sentCount = campaign.totalRecipients;
    campaign.deliveredCount = campaign.totalRecipients;
    campaign.failedCount = 0;
    console.log(`✅ Campaign ${campaign.id} completed! All messages delivered (mock mode).`);
  }, 2000);
}

// Contact endpoints
app.post('/api/contacts', (req, res) => {
  const { contacts: newContacts } = req.body;
  console.log(`👥 Adding ${newContacts.length} contacts`);
  contacts.push(...newContacts);
  res.status(201).json({ count: newContacts.length });
});

app.get('/api/contacts', (req, res) => {
  console.log(`👥 Fetching contacts (total: ${contacts.length})`);
  res.json({ data: contacts, total: contacts.length });
});

app.delete('/api/contacts/:id', (req, res) => {
  console.log(`🗑️ Deleting contact ${req.params.id}`);
  contacts = contacts.filter(c => c.id !== req.params.id);
  res.json({ success: true });
});

// Group endpoints
app.post('/api/groups', (req, res) => {
  const { name, description } = req.body;
  console.log(`📁 Creating group: "${name}"`);
  const group = {
    id: Date.now().toString(),
    name,
    description,
    createdAt: new Date()
  };
  groups.push(group);
  console.log(`✓ Group created with ID: ${group.id}`);
  res.status(201).json(group);
});

app.get('/api/groups', (req, res) => {
  console.log(`📁 Fetching groups (total: ${groups.length})`);
  res.json(groups);
});

app.get('/api/groups/:id', (req, res) => {
  const group = groups.find(g => g.id === req.params.id);
  console.log(`📁 Fetching group ${req.params.id}: ${group ? 'found' : 'not found'}`);
  if (!group) return res.status(404).json({ error: 'Not found' });
  res.json({ ...group, contacts: [] });
});

app.put('/api/groups/:id', (req, res) => {
  const group = groups.find(g => g.id === req.params.id);
  console.log(`✏️ Updating group ${req.params.id}: ${group ? 'found' : 'not found'}`);
  if (!group) return res.status(404).json({ error: 'Not found' });
  Object.assign(group, req.body);
  res.json(group);
});

app.delete('/api/groups/:id', (req, res) => {
  console.log(`🗑️ Deleting group ${req.params.id}`);
  groups = groups.filter(g => g.id !== req.params.id);
  res.json({ success: true });
});

// Webhook endpoint
app.post('/api/webhooks/delivery-report', (req, res) => {
  console.log(`📬 Webhook delivery report received`);
  res.json({ success: true });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 SMS Provider: ${twilio ? 'Twilio (REAL)' : 'Mock Mode'}\n`);
});
