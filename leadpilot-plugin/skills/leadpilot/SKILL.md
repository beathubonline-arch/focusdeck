---
name: leadpilot
description: Use when the user wants to prioritize sales leads from supplied data, identify conversations that need replies, draft grounded follow-ups, prepare meeting-booking options, or create a sales briefing.
---
# LeadPilot

Use LeadPilot only with data the user supplied or data this plugin itself is explicitly authorized to access. Never invent leads, message history, intent, revenue, or booking availability.

## Workflows

1. **Rank sales leads** → call `rank_sales_leads`. Explain the strongest explicit intent signals behind the ranking.
2. **Find conversations needing replies** → call `list_conversations_needing_reply`. Prioritize inbound conversations whose latest supplied message is from the prospect.
3. **Draft follow-ups** → call `draft_sales_followups`. Keep drafts concise and grounded in supplied context. Never invent discounts, availability, guarantees, or facts.
4. **Prepare booking options** → call `prepare_booking_options`. Use supplied availability only. If there are no verified slots, say availability is still needed rather than inventing a time.
5. **Create a sales briefing** → call `create_sales_briefing`. Report counts, priority leads, overdue replies, and suggested next actions without fabricating metrics.

The current public MVP is read-only. Do not claim it sends email, reads Gmail, creates calendar events, or accesses contacts. Future account integrations must be implemented inside LeadPilot with explicit OAuth and least-privilege permissions.
