# LeadPilot AI v0.3

LeadPilot is a read-only sales productivity MCP plugin.

## Public tools

1. `rank_sales_leads` — ranks explicitly supplied sales messages by intent signals.
2. `list_conversations_needing_reply` — finds supplied conversations whose latest message is inbound.
3. `draft_sales_followups` — drafts grounded follow-ups without sending them.
4. `prepare_booking_options` — uses only explicitly supplied verified availability.
5. `create_sales_briefing` — creates a concise briefing from supplied activity.

## Public endpoints

- MCP: `/mcp`
- Health: `/health`
- Privacy: `/privacy`
- Terms: `/terms`
- Support: `/support`

## Run

```bash
npm install
npm test
npm start
```

Node 20+ is required.

## Data boundary

The public MVP does not independently access Gmail, Google Calendar, contacts, precise location, or full ChatGPT history. Account-specific integrations must be implemented inside LeadPilot with OAuth and least-privilege permissions before those capabilities are exposed as public tools.
