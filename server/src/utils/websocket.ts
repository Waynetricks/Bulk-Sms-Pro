import express, { Request, Response, NextFunction } from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import { Campaign, Message } from '../models';

export function setupWebSocket(app: express.Application) {
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  const clients: Set<WebSocket.WebSocket> = new Set();

  wss.on('connection', (ws: WebSocket.WebSocket) => {
    console.log('WebSocket client connected');
    clients.add(ws);

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);

        if (data.type === 'subscribe_campaign') {
          // Client wants to subscribe to campaign updates
          const campaignId = data.campaignId;
          const campaign = await Campaign.findByPk(campaignId);

          if (campaign) {
            const messages = await Message.findAll({
              where: { campaignId },
              attributes: ['id', 'phone', 'status', 'updatedAt'],
            });

            ws.send(
              JSON.stringify({
                type: 'campaign_status',
                campaignId,
                campaign: campaign.toJSON(),
                messages,
              })
            );
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Broadcast campaign updates to all connected clients
  async function broadcastCampaignUpdate(campaignId: string) {
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) return;

    const messages = await Message.findAll({
      where: { campaignId },
      attributes: ['status'],
    });

    const update = {
      type: 'campaign_update',
      campaignId,
      campaign: campaign.toJSON(),
      messageStats: {
        queued: messages.filter((m) => m.status === 'queued').length,
        sent: messages.filter((m) => m.status === 'sent').length,
        delivered: messages.filter((m) => m.status === 'delivered').length,
        failed: messages.filter((m) => m.status === 'failed').length,
      },
    };

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(update));
      }
    });
  }

  return { server, broadcastCampaignUpdate };
}
