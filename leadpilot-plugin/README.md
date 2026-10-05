# LeadPilot AI Plugin MVP

Five workflows are implemented:

1. `find_leads` — ranks supplied inbound sales messages by explicit intent signals.
2. `needs_reply` — identifies conversations whose latest message is from the prospect.
3. `draft_followups` — drafts grounded, non-sending follow-ups.
4. `prepare_booking` — proposes only supplied/verified availability and refuses to invent slots.
5. `sales_briefing` — builds a daily sales briefing from real supplied activity.

## Run

```bash
npm install
npm test
npm start
```

The production server exposes Streamable HTTP MCP at `/mcp` and a health endpoint at `/health`. The package targets Node 20+ and the current MCP server/node packages.

## Production integration

The core is intentionally source-agnostic. Gmail/CRM adapters should normalize messages into the `messages` / `conversations` shapes used by these tools. Calendar adapters should pass only verified free slots into `prepare_booking`. Sending email and creating calendar events should remain separate write tools protected by the host's user-confirmation flow.

## Current deployment target

`https://leadpilot-ai-beathub.onrender.com/mcp`
