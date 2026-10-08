import { createServer as createHttpServer } from 'node:http';
import { databaseStatus, closeDatabase } from './database.js';
import { accountApi } from './account-api.js';
import { billingApi } from './billing-api.js';
import { emailApi } from './email-api.js';
import { googleEmailApi } from './google-email.js';
import { signupPage, loginPage, accountPage } from './account-pages.js';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import * as z from 'zod/v4';
import { findLeads, needsReply, draftFollowups, prepareBooking, salesBriefing } from './core.js';
import { homePage, privacyPage, termsPage, supportPage, pricingPage, dashboardPreviewPage } from './public.js';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const VERSION = '0.6.0';

const Message = z.object({
  id: z.string().optional(), name: z.string().optional(), from: z.string().optional(),
  email: z.string().optional(), from_email: z.string().optional(), subject: z.string().optional(),
  text: z.string().optional(), date: z.string().optional(), direction: z.string().optional(),
});
const Conversation = z.object({
  id: z.string().optional(), name: z.string().optional(), email: z.string().optional(),
  messages: z.array(Message),
});

const readOnly = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
  idempotentHint: true
};

const result = value => ({
  content:[{type:'text',text:JSON.stringify(value,null,2)}],
  structuredContent:value
});

function buildServer() {
  const server = new McpServer({ name:'leadpilot-ai', version:VERSION });

  server.registerTool('rank_sales_leads', {
    title:'Rank sales leads',
    description:'Use when the user wants to prioritize sales messages they explicitly supplied. Ranks only the supplied messages using buying intent, urgency, pricing interest, meeting intent, and recency. Does not access an inbox or invent missing customer information.',
    inputSchema:z.object({messages:z.array(Message)}),
    annotations:readOnly,
  }, async ({messages}) => result({leads:findLeads({messages})}));

  server.registerTool('list_conversations_needing_reply', {
    title:'List conversations needing a reply',
    description:'Use when the user wants to identify which explicitly supplied sales conversations are waiting for a reply. Returns only conversations whose latest supplied message is inbound. Does not access email accounts or send messages.',
    inputSchema:z.object({conversations:z.array(Conversation)}),
    annotations:readOnly,
  }, async ({conversations}) => result({conversations:needsReply({conversations})}));

  server.registerTool('draft_sales_followups', {
    title:'Draft sales follow-ups',
    description:'Use when the user wants reply drafts for explicitly supplied lead context. Produces grounded draft text only. Does not send messages and does not invent prices, discounts, promises, availability, or other commercial facts.',
    inputSchema:z.object({leads:z.array(z.object({
      id:z.string().optional(),name:z.string().optional(),email:z.string().optional(),
      last_message:z.string().optional(),text:z.string().optional(),context:z.string().optional(),
    }))}),
    annotations:readOnly,
  }, async ({leads}) => result({drafts:draftFollowups({leads})}));

  server.registerTool('prepare_booking_options', {
    title:'Prepare booking options',
    description:'Use when the user wants meeting options prepared from availability they explicitly supplied. Returns only supplied verified availability. Does not create a calendar event and never invents an available time.',
    inputSchema:z.object({
      lead:z.object({name:z.string().optional(),email:z.string().optional()}),
      availability:z.array(z.object({start:z.string(),end:z.string().optional(),label:z.string().optional()})).default([]),
    }),
    annotations:readOnly,
  }, async ({lead,availability}) => result(prepareBooking({lead,availability})));

  server.registerTool('create_sales_briefing', {
    title:'Create sales briefing',
    description:'Use when the user wants a concise sales briefing from explicitly supplied lead and conversation data. Summarizes counts, high-intent leads, overdue replies, and next actions without fabricating revenue, pipeline value, or other missing metrics.',
    inputSchema:z.object({
      leads:z.array(Message).default([]),
      conversations:z.array(Conversation).default([])
    }),
    annotations:readOnly,
  }, async ({leads,conversations}) => result(salesBriefing({leads,conversations})));

  return server;
}

const handler=createMcpHandler(buildServer);
const nodeHandler=toNodeHandler(handler);
const pages=new Map([['/',homePage],['/privacy',privacyPage],['/terms',termsPage],['/support',supportPage],['/pricing',pricingPage],['/workspace-preview',dashboardPreviewPage],['/signup',signupPage],['/login',loginPage],['/account',accountPage]]);

const httpServer=createHttpServer((req,res)=>{
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);

  if (url.pathname === '/.well-known/openai-apps-challenge') {
    const token = String(process.env.OPENAI_APPS_CHALLENGE || '').trim();
    if (!token) {
      res.writeHead(404, {'content-type':'text/plain; charset=utf-8','cache-control':'no-store'});
      res.end('challenge token not configured');
      return;
    }
    res.writeHead(200, {'content-type':'text/plain; charset=utf-8','cache-control':'no-store'});
    res.end(token);
    return;
  }

  if(req.method==='GET' && pages.has(url.pathname)){
    res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'public, max-age=300'});
    res.end(pages.get(url.pathname)); return;
  }

  if(req.method==='GET' && url.pathname==='/health/database'){
    void databaseStatus().then(status=>{
      res.writeHead(status.connected&&status.schema_ready&&status.quota_ready?200:503,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});
      res.end(JSON.stringify(status));
    });
    return;
  }

  if(url.pathname==='/health'){
    res.writeHead(200,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});
    res.end(JSON.stringify({
      ok:true,service:'leadpilot-ai',version:VERSION,mcp:'/mcp',
      privacy:'/privacy',terms:'/terms',support:'/support',
      domain_challenge_ready:true
    }));
    return;
  }

  if(url.pathname.startsWith('/api/google/')){void googleEmailApi(req,res,url.pathname,url);return;}
  if(url.pathname.startsWith('/api/email/')){void emailApi(req,res,url.pathname);return;}

  if(url.pathname.startsWith('/api/billing/')||url.pathname==='/api/paystack/webhook'){
    void billingApi(req,res,url.pathname,url);return;
  }
  if(url.pathname.startsWith('/api/')){
    void accountApi(req,res,url.pathname);return;
  }

  if(url.pathname!=='/mcp'){
    res.writeHead(404,{'content-type':'application/json; charset=utf-8'});
    res.end(JSON.stringify({error:'Not found'})); return;
  }

  void nodeHandler(req,res);
});

httpServer.listen(PORT,HOST,()=>console.error(`[leadpilot-ai] v${VERSION} listening on ${HOST}:${PORT}`));
async function shutdown(){await closeDatabase();await handler.close();httpServer.close(()=>process.exit(0));}
process.on('SIGTERM',shutdown);
process.on('SIGINT',shutdown);
