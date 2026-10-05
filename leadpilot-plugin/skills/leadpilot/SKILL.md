---
name: leadpilot
description: Use when the user wants to discover sales leads, identify messages that need replies, draft personalized follow-ups, prepare meeting-booking actions, or get a daily sales briefing.
---
# LeadPilot

Use the LeadPilot tools only with data the user supplied or data retrieved from an authorized connected source. Never invent leads, message history, intent, revenue, or booking availability.

## Workflows

1. **Find my leads** → call `find_leads`. Rank by explicit buying signals, urgency, recency, and positive engagement. Explain the reason for each score.
2. **Who needs a reply?** → call `needs_reply`. Prioritize inbound conversations where the latest meaningful message came from the prospect and no later seller reply exists.
3. **Draft my follow-ups** → call `draft_followups`. Draft concise messages grounded in the conversation. Never claim discounts, availability, guarantees, or facts not present in the input.
4. **Book interested leads** → call `prepare_booking`. Use provided availability only. If no slots are supplied, return a booking-ready action plan rather than inventing a time.
5. **Today's sales briefing** → call `sales_briefing`. Report counts, priority leads, overdue replies, and suggested next actions without fabricating missing metrics.

Before any external send or calendar write, require the host/client to perform its normal confirmation and permission flow.
