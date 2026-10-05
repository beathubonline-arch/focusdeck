import { createServer as createHttpServer } from 'node:http';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import * as z from 'zod/v4';
import { findLeads, needsReply, draftFollowups, prepareBooking, salesBriefing } from './core.js';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const VERSION = '0.2.0';

const Message = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  from: z.string().optional(),
  email: z.string().optional(),
  from_email: z.string().optional(),
  subject: z.string().optional(),
  text: z.string().optional(),
  date: z.string().optional(),
  direction: z.string().optional(),
});

const Conversation = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  messages: z.array(Message),
});

const readOnly = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

const result = (value) => ({
  content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
  structuredContent: value,
});

function buildServer() {
  const server = new McpServer({ name: 'leadpilot-ai', version: VERSION });

  server.registerTool('find_leads', {
    title: 'Find my leads',
    description: 'Rank real supplied sales messages by buying intent, urgency, pricing interest, meeting intent, and recency. Never invents missing customer information.',
    inputSchema: z.object({ messages: z.array(Message) }),
    annotations: readOnly,
  }, async ({ messages }) => result({ leads: findLeads({ messages }) }));

  server.registerTool('needs_reply', {
    title: 'Who needs a reply?',
    description: 'Find conversations where the latest message is inbound and prioritize prospects who are waiting for a response.',
    inputSchema: z.object({ conversations: z.array(Conversation) }),
    annotations: readOnly,
  }, async ({ conversations }) => result({ conversations: needsReply({ conversations }) }));

  server.registerTool('draft_followups', {
    title: 'Draft my follow-ups',
    description: 'Draft grounded follow-up messages from supplied lead context. Does not send messages and does not invent prices, promises, or facts.',
    inputSchema: z.object({ leads: z.array(z.object({
      id: z.string().optional(), name: z.string().optional(), email: z.string().optional(),
      last_message: z.string().optional(), text: z.string().optional(), context: z.string().optional(),
    })) }),
    annotations: readOnly,
  }, async ({ leads }) => result({ drafts: draftFollowups({ leads }) }));

  server.registerTool('prepare_booking', {
    title: 'Book interested leads',
    description: 'Prepare meeting-slot options using only supplied verified availability. Does not create a calendar event and never invents an available time.',
    inputSchema: z.object({
      lead: z.object({ name: z.string().optional(), email: z.string().optional() }),
      availability: z.array(z.object({ start: z.string(), end: z.string().optional(), label: z.string().optional() })).default([]),
    }),
    annotations: readOnly,
  }, async ({ lead, availability }) => result(prepareBooking({ lead, availability })));

  server.registerTool('sales_briefing', {
    title: "Give me today's sales briefing",
    description: 'Summarize supplied sales activity, high-intent leads, overdue replies, and next actions without fabricating metrics.',
    inputSchema: z.object({ leads: z.array(Message).default([]), conversations: z.array(Conversation).default([]) }),
    annotations: readOnly,
  }, async ({ leads, conversations }) => result(salesBriefing({ leads, conversations })));

  return server;
}

const handler = createMcpHandler(buildServer);
const nodeHandler = toNodeHandler(handler);

const httpServer = createHttpServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, service: 'leadpilot-ai', version: VERSION }));
    return;
  }
  if (url.pathname !== '/mcp') {
    res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Not found', mcp: '/mcp', health: '/health' }));
    return;
  }
  void nodeHandler(req, res);
});

httpServer.listen(PORT, HOST, () => console.error(`[leadpilot-ai] listening on ${HOST}:${PORT}; MCP endpoint /mcp`));

async function shutdown() {
  await handler.close();
  httpServer.close(() => process.exit(0));
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
